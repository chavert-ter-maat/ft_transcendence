import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './message.model';
import { User } from '../users/user.model';
// import { UserChat } from './userchat.model';
// import { timestamp } from 'rxjs';

interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number};
interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

@Injectable()
export class MessageService {
	constructor(
		@InjectModel(Chat) private userChat: typeof Chat,
	) {}

  getHello(): string {
    return 'Hello World!';
  }

  async get_chats_from_db(creator: string): Promise<chat_stamp []> {
	const user = await User.findOne({where: {username: creator}});
	const chats = await this.userChat.findAll({ 
		include: [{
			model: User,
			where: { id: user?.id },
			attributes: ['id']
		}]
	});
	let chat_overview: chat_stamp [] = [];
	chats.forEach((value: Chat) => chat_overview.push({name_: value.chatname, unread_: 0,
		timestamp: Date(), users: [value.creator], index: 0}))
	return (chat_overview);
  }

	async get_users_from_db(username: string, chatname: string): Promise<user_stamp []> {
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		let user_overview: user_stamp [] = [];
		if (existingChat && existingChat.messages)
			user_overview = existingChat.user_stamps;
		return (user_overview);
	}

	async get_messages_from_db(username: string, chatname: string): Promise<message_stamp []> {
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		let message_overview: message_stamp [] = [];
		if (existingChat && existingChat.messages)
			message_overview = existingChat.messages.slice(-20);
		return (message_overview);
	}

	async new_chat(chatname: string, creator: string): Promise<void> {
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		if (existingChat)
			throw new ConflictException('Chatname already taken'); //should be login/enter/noacces
		const user = await User.findOne({where: { username: creator } });
		if (user)
		{
			let first_message: message_stamp = {message_: "start of chat",
				name_: "Server_administrator", user_: "App-message_someone_else",
				timestamp: Date(), pic_: "b"};
			const newChat = await this.userChat.create(
				{ chatname, creator: creator, messages: [first_message],
				user_stamps: [{name_: creator, admin_: true, timestamp: Date()}],
				password: "why?"} as any);
			await (newChat as any).addUser(user);
		}
	}

	async add_user(chatname: string, creator: string, add_user: string): Promise<boolean> {
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		if (existingChat)
		{
			const user = await User.findOne({where: { username: add_user } });
			if (user)
			{
				await (existingChat as any).addUser(user); //not supposed to be like this, according to 
				existingChat.user_stamps.push({name_: add_user, admin_: false, timestamp: Date()});
				existingChat.changed('user_stamps', true);
				await existingChat.save();
				return (true);
			}
		}
		return (false);
	}

	async new_message(username: string, chatname: string, message: message_stamp): Promise<user_stamp []> {
		const existingChat = await this.userChat.findOne({ where: { chatname } });
		if (existingChat)
		{
			existingChat.messages.push(message);
			existingChat.changed('messages', true);
			await existingChat.save();
			return (existingChat.user_stamps);
		}
		return ([]);
	}
}
