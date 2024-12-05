import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './message.model';
import { User } from '../users/user.model';

interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number, DM: boolean};
interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

@Injectable()
export class MessageService {
	constructor(
		@InjectModel(Chat) private userChat: typeof Chat,
	) {}

	async get_user(username: string): Promise <User | null>{
		const user = await User.findOne({ where: { username } })
		return user;
	}

	async check_block(username: string, get_user: string): Promise <User | null>{
		const user = await User.findOne({ where: { username: get_user } })
		if (user){
			if (user.blocked_users.findIndex((usery) => (usery.username == username)) != -1)
				return (null);
		}
		return user;
	}

	async get_chat_without_permissions(username: string, chatname: string): Promise<Chat | null> {
		const user = await this.get_user(username);
		if (!user)
			return null;
		const existingChat = await this.userChat.findOne({
			where: { chatname },
			include: [{
				model: User,
				where: { id: user?.id },
				attributes: ['id']
			}]
		});
		return (existingChat);
	}

	async get_chat_with_permissions(username: string, chatname: string): Promise<Chat | null> {
		const existingChat = await this.get_chat_without_permissions(username, chatname);
		if (existingChat && existingChat.admins && existingChat.admins.includes(username))
			return (existingChat);
		return null;
	}

	async get_chats_from_db(username: string): Promise<chat_stamp []> {
		const user = await this.get_user(username);
		if (!user)
			return ([]);
		const chats = await this.userChat.findAll({
			include: [{
				model: User,
				where: { id: user?.id },
				attributes: ['id']
			}]
		});
		let chat_overview: chat_stamp [] = [];
		chats.forEach((value: Chat) => chat_overview.push({name_: value.chatname, unread_: 0,
			timestamp: value.last_edit, users: [value.creator], index: 0, DM: value.DM}))
		return (chat_overview);
	}

	async get_users_from_db(username: string, chatname: string): Promise<{ array: user_stamp [], admin_: boolean, creator_: boolean }> {
		const existingChat = await this.get_chat_without_permissions(username, chatname);
		let user_overview: user_stamp [] = [];
		let admin_: boolean = false;
		let creator_: boolean = false;
		if (existingChat && existingChat.messages)
		{
			user_overview = existingChat.user_stamps;
			if (existingChat.admins.includes(username))
				admin_ = true;
			if (existingChat.creator == username)
				creator_ = true;
		}
		return {array: user_overview, admin_: admin_, creator_: creator_};
	}

	async filter_mute(chat: Chat, username: string): Promise<Boolean>	{
		chat.muted_users = chat.muted_users.filter( (muted) => (muted.timestamp > Date.now() || muted.forever) );
		await chat.save();
		let index: number = chat.muted_users.findIndex( (muted) => (muted.username == username) );
		if (index != -1)
			return (true);
		return (false);
	}

	async filter_block(message_overview: message_stamp[], user: User): Promise<message_stamp []>	{
		user.blocked_users = user.blocked_users.filter( (blocked) => (blocked.timestamp > Date.now() || blocked.forever) );
		await user.save();
		user.blocked_users.forEach((blocked) => {
				message_overview = message_overview.filter(message => (message.name_ != blocked.username))
			});
		return (message_overview);
	}

	async get_messages_from_db(username: string, chatname: string, password: string, offset: number): Promise<message_stamp []> {
		const user = await User.findOne({ where: { username } })
		if (!user)
			throw new UnauthorizedException("not logged in");
		const existingChat = await this.get_chat_without_permissions(username, chatname);
		let message_overview: message_stamp [] = [];
		if (!existingChat)
		{
			const existingChatNotLoggedIn = await this.userChat.findOne({ where: { chatname } });
			if (!existingChatNotLoggedIn)
				throw new UnauthorizedException("Doesn't exist");
			if (!existingChatNotLoggedIn.public)
				throw new UnauthorizedException("Private chat"); // might be too much info
			else
			{
				if (!existingChatNotLoggedIn.password || existingChatNotLoggedIn.password == password)
					await (existingChatNotLoggedIn as any).addUser(user);
				else
					throw new UnauthorizedException("Wrong password");
			}
			if (!offset)
				message_overview = existingChatNotLoggedIn.messages.slice(-20);
			else if (offset > existingChatNotLoggedIn.messages.length)
				return ([]);
			else
				message_overview = existingChatNotLoggedIn.messages.slice(-offset - 20, -offset);
		}
		else {
			if (!offset)
				message_overview = existingChat.messages.slice(-20);
			else if (offset > existingChat.messages.length)
				return ([]);
			else
				message_overview = existingChat.messages.slice(-offset - 20, -offset);
		}
		message_overview = await this.filter_block(message_overview, user);
		return (message_overview);
	}

	async add_user_internal(existingChat: Chat, add_username: string, username: string): Promise<boolean> {
		const add_user = await this.check_block(username, add_username);
		if (!add_user)
			throw new NotFoundException("User not found");
		if (existingChat.banned_users.includes(add_user.username))
			throw new UnauthorizedException("User banned");
		const existingChatUser = await this.userChat.findOne({
			where: { chatname: existingChat.chatname },
			include: [{
				model: User,
				where: { id: add_user?.id },
				attributes: ['id']
			}]
		});
		if (existingChatUser)
			return (false);
		await (existingChat as any).addUser(add_user); //not supposed to be like this, according to 
		existingChat.user_stamps.push({name_: add_username, admin_: false, timestamp: Date()});
		existingChat.last_edit = Date();
		existingChat.changed('user_stamps', true);
		existingChat.changed('last_edit', true);
		await existingChat.save();
		return (true);
	}

	async new_dm(chatname: string, username: string, password: string): Promise<[user_stamp [], string]> {
		const user = await this.get_user(username);
		if (!user)
			throw new ConflictException('Not signed in.');
		if (username == chatname)
			throw new ConflictException('User is yourself.');
		const dm_user = await this.check_block(username, chatname);
		if (!dm_user)
			throw new ConflictException('User does not exist.');
		let dm_chat_name: string = "DM_" + chatname + "_" + username;
		const existingChat = await this.userChat.findOne({ where: { chatname: dm_chat_name } });
		if (existingChat)
		{
			if (existingChat.user_stamps.findIndex((user) => (user.name_ == username)) == -1)
				await this.add_user_internal(existingChat, username, username);
			return [ existingChat.user_stamps, dm_chat_name ];
		}
		dm_chat_name = "DM_" + username + "_" + chatname;
		const existingChat2 = await this.userChat.findOne({ where: { chatname: dm_chat_name } });
		if (existingChat2)
		{
			if (existingChat2.user_stamps.findIndex((user) => (user.name_ == username)) == -1)
				await this.add_user_internal(existingChat2, username, username);
			return [ existingChat2.user_stamps, dm_chat_name ];
		}
		let first_message: message_stamp = {message_: "start of chat",
			name_: "Server_administrator", user_: "App-message_someone_else",
			timestamp: Date(), pic_: "b"};
		const newChat = await this.userChat.create(
			{ chatname: dm_chat_name, creator: username, admins: [], banned_users: [], messages: [first_message],
			user_stamps: [{name_: username, admin_: false, timestamp: Date()}, {name_: chatname, admin_: false, timestamp: Date()}],
			muted_users: [], password: "", public: false, DM: true, last_edit: Date()} as any);
		await (newChat as any).addUser(user);
		await (newChat as any).addUser(dm_user);
		return [newChat.user_stamps, dm_chat_name];
	}

	async new_chat(chatname: string, username: string, password: string): Promise<user_stamp []> {
		const user = await this.get_user(username);
		if (!user)
			throw new ConflictException('Not signed in.');
		if (chatname.startsWith("DM_"))
			throw new ConflictException('Reserved name.');
		const existingChatLoggedIn = await this.get_chat_without_permissions(username, chatname);
		if (existingChatLoggedIn)
			return (existingChatLoggedIn.user_stamps);
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		if (existingChat)
		{
			if (existingChat.public)
			{
				if (!existingChat.password || existingChat.password == password)
				{
					await this.add_user_internal(existingChat, username, username);
					return (existingChat.user_stamps);
				}
				else
					throw new UnauthorizedException('Please enter password.');
			}
			else
				throw new ConflictException('Private chat.');
		}
		else
		{
			let first_message: message_stamp = {message_: "start of chat",
				name_: "Server_administrator", user_: "App-message_someone_else",
				timestamp: Date(), pic_: "b"};
			const newChat = await this.userChat.create(
				{ chatname, creator: username, admins: [username], banned_users: [], messages: [first_message],
				user_stamps: [{name_: username, admin_: true, timestamp: Date()}], muted_users: [],
				password: "", public: false, DM: false, last_edit: Date()} as any);
			await (newChat as any).addUser(user);
			return (newChat.user_stamps);
		}
	}

	async remove_user(chatname: string, username: string, add_username: string): Promise<user_stamp []> {
		const existingChat = await this.get_chat_with_permissions(username, chatname);
		if (existingChat && existingChat.creator != add_username)
			if (await this.leave_chat(chatname, add_username, username))
				return (existingChat.user_stamps);
		return ([]);
	}

	async ban_user(chatname: string, username: string, add_username: string): Promise<user_stamp []> {
		const existingChat = await this.get_chat_with_permissions(username, chatname);
		if (existingChat && existingChat.creator != add_username)
		{
			existingChat.banned_users.push(add_username);
			existingChat.changed("banned_users", true);
			existingChat.save();
			if (await this.leave_chat(chatname, add_username, username))
				return (existingChat.user_stamps);
		}
		return ([]);
	}

	async add_user(chatname: string, username: string, add_username: string): Promise<user_stamp []> {
		const existingChat = await this.get_chat_with_permissions(username, chatname);
		if (existingChat)
		{
			if (existingChat.creator == username && existingChat.banned_users.includes(add_username))
			{
				existingChat.banned_users =  existingChat.banned_users.filter((users) => users != add_username);
				existingChat.save();
			}
			if (await this.add_user_internal(existingChat, add_username, username))
				return (existingChat.user_stamps);
		}
		return ([]);
	}

	async leave_chat(chatname: string, username: string, password: string): Promise<user_stamp []> {
		const user = await this.get_user(username);
		if (!user)
			throw new UnauthorizedException("Not logged in");
		const existingChat = await this.get_chat_without_permissions(username, chatname);
		if (existingChat) {
			existingChat.admins = existingChat.admins.filter((admin) => admin != username);
			existingChat.user_stamps = existingChat.user_stamps.filter((userstamp) => userstamp.name_ != username)
			await (existingChat as any).removeUser(user);
			existingChat.last_edit = Date();
			existingChat.changed('last_edit', true);
			await existingChat.save();
			if (!existingChat.user_stamps.length)
				existingChat.destroy();
			else {
				if ((!existingChat.admins || !existingChat.admins.length) && !existingChat.DM)
				{
					existingChat.admins = [existingChat.user_stamps[0].name_];
					existingChat.user_stamps[0].admin_ = true;
					existingChat.last_edit = Date();
					existingChat.changed('user_stamps', true);
					existingChat.changed('user_stamps', true);
					existingChat.changed('last_edit', true);
					await existingChat.save();
				}
				if (!existingChat.admins.includes(existingChat.creator))
				{
					existingChat.creator = existingChat.admins[0];
					existingChat.changed('creator', true);
					await existingChat.save();
				}
				return (existingChat.user_stamps);
			}
		}
		return ([]);
	}

	async add_admin(chatname: string, username: string, add_username: string): Promise<user_stamp []> {
		const existingChat = await this.get_chat_with_permissions(username, chatname);
		if (existingChat) {
			existingChat.admins.push(add_username);
			const new_admin = existingChat.user_stamps.find((userstamp) => userstamp.name_ == add_username);
			if (new_admin)
				new_admin.admin_ = true;
			existingChat.last_edit = Date();
			existingChat.changed('admins', true);
			existingChat.changed('user_stamps', true);
			existingChat.changed('last_edit', true);
			await existingChat.save();
			return (existingChat.user_stamps);
			}
		return ([]);
	}

	async new_message(username: string, chatname: string, message: message_stamp): Promise<user_stamp []> {
		const existingChat = await this.get_chat_without_permissions(username, chatname);
		if (existingChat && !(await this.filter_mute(existingChat, username)))
		{
			existingChat.messages.push(message);
			existingChat.last_edit = Date();
			existingChat.changed('messages', true);
			existingChat.changed('last_edit', true);
			await existingChat.save();
			return (existingChat.user_stamps);
		}
		throw new NotFoundException('Page not found');
	}

	async make_public(chatname: string, username: string, password_chat: string): Promise<user_stamp []> {
		const existingChat = await this.get_chat_with_permissions(username, chatname);
		if (existingChat && existingChat.creator == username)
		{
			existingChat.password = password_chat;
			existingChat.public = true;
			existingChat.last_edit = Date();
			existingChat.changed('password', true);
			existingChat.changed('public', true);
			existingChat.changed('last_edit', true);
			await existingChat.save();
			return (existingChat.user_stamps);
		}
		return ([]);
	}

	async add_mute(chatname: string, add_user: string, username: string, minutes: string): Promise<user_stamp []> { //-> migrate to chat
		const chat = await this.get_chat_with_permissions(username, chatname);
		if (!chat)
			throw new UnauthorizedException("Not logged in.");
		let index: number = chat.muted_users.findIndex((mutey) => (mutey.username == add_user));
		if (index == -1) {
			if (minutes == "-1")
				chat.muted_users.push({username: add_user, timestamp: (Date.now() + (1000 * 60 * Number(minutes))), forever: true});
			else
				chat.muted_users.push({username: add_user, timestamp: (Date.now() + (1000 * 60 * Number(minutes))), forever: false});
		}
		else {
			chat.muted_users[index].timestamp = (Date.now() + (1000 * 60 * Number(minutes)));
			if (minutes == "-1")
				chat.muted_users[index].forever = true;
			else
				chat.muted_users[index].forever = false;
		}
		chat.changed('muted_users', true);
		await chat.save();
		return ([{name_: username, admin_: false, timestamp: Date()}])
	}

	async add_block(add_user: string, username: string, minutes: string): Promise<user_stamp []> {
		const user = await this.get_user(username);
		if (!user)
			throw new UnauthorizedException("Not logged in.");
		let index: number = user.blocked_users.findIndex((mutey) => (mutey.username == add_user));
		if (index == -1) {
			if (minutes == "-1")
				user.blocked_users.push({username: add_user, timestamp: (Date.now() + (1000 * 60 * Number(minutes))), forever: true});
			else
				user.blocked_users.push({username: add_user, timestamp: (Date.now() + (1000 * 60 * Number(minutes))), forever: false});
		}
		else {
			user.blocked_users[index].timestamp = (Date.now() + (1000 * 60 * Number(minutes)));
			if (minutes == "-1")
				user.blocked_users[index].forever = true;
			else
				user.blocked_users[index].forever = false;
		}
		user.changed('blocked_users', true);
		await user.save();
		return ([{name_: username, admin_: false, timestamp: Date()}])
	}
}
