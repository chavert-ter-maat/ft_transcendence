import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
// import { OnlineUsers } from 'src/online_users';
import { FortyTwoAuthGuard } from '../auth/guards/passport.guard'; // Correct import for FortyTwoAuthGuard
import { FortyTwoStrategy } from 'src/auth/strategies/42.strategy';
import { JwtAuthGuard } from 'src/auth/guards/42-auth.guards';
import { OnlineService } from './online.service';

interface message_stamp { message_: string, name_: string, user_ : string, timestamp: string, pic_: string, key_: number };

interface UserName {
	username:	string;
	password:	string;
}

interface NewChat {
	chatname:	string;
	creator:	string;
	password:	string;
	DM:			boolean;
}

interface AddUser {
	chatname:	string;
	creator:	string;
	add_user:	string;
}

interface MakePublic {
	chatname:	string;
	creator:	string;
	password_chat:	string;
}

interface AddBlock {
	add_user:	string;
	creator:	string;
	minutes:	string;
}

interface AddMute {
	chatname:	string;
	add_user:	string;
	creator:	string;
	minutes:	string;
}

interface SelectChat {
	username:	string;
	password:	string;
	chatname:	string;
}

interface GetMessagesInt {
	username:	string;
	password:	string;
	chatname:	string;
	offset:		number;
}

interface AddMessageToSelectChat {
	username:	string;
	password:	string;
	chatname:	string;
	message_: 	string;
	name_: 		string;
	user_:	 	string;
	timestamp: 	string;
	pic_: 		string;
}

interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number, DM: boolean};
interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string, key_: number };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };
interface friend_stamp	{ stamp_: user_stamp, status: string };

// function sleep(ms: number) {
// 	return new Promise((resolve) => setTimeout(resolve, ms));
// }

// limits number of clients?
@Controller('messages')
export class MessageController {
	private notify_users:		string[] = ["Server_administrator"];

	constructor( private readonly MessageService: MessageService, private readonly onlineService: OnlineService ) {	}

	// remove_user(user: string): void
	// {
	// 	let i: number = 0;
	// 	while (i < this.notify_users.length)
	// 	{
	// 		if (this.notify_users[i] == user)
	// 			this.notify_users.splice(i, 1);
	// 		else
	// 			i++;
	// 	}
	// }

	// add_users( user_input: [user_stamp[], string]): string
	// {
	// 	let i_ru: number = 0;
	// 	const online_relevant_users = this.online_users.find_online_users_by_channel(user_input[1]);
	// 	while (i_ru < user_input[0].length)
	// 	{
	// 			if (!this.notify_users.includes(user_input[0][i_ru].name_)
	// 				&& online_relevant_users.find((value) => value.username == user_input[0][i_ru].name_))
	// 				this.notify_users.push(user_input[0][i_ru].name_);
	// 		i_ru++;
	// 	}
	// 	return (user_input[1]);
	// }

	// async notify_friends( username: string )
	// {
	// 	const friend_user_array: user_stamp [] = await this.MessageService.get_friends_from_db(username);
	// 	const friend_array: friend_stamp [] = this.get_friends_statusses(friend_user_array);
	// 	friend_array.filter(friend => friend.status === "online").forEach(friend => this.add_users([[{name_: friend.stamp_.name_, admin_: false, timestamp: Date()}], ""]) );
	// }

	// async check_notification(sleep_ms: number, username: string): Promise<boolean> // might have to protect from unauthroized usage
	// {
	// 	if (this.online_users.find_online_user(username)?.invited_by && this.online_users.find_online_user(username)?.invited_by !== "")
	// 		return (true);
	// 	else if (this.notify_users && this.notify_users.includes(username))
	// 		return (true);
	// 	else
	// 		await sleep(sleep_ms);
	// 	return (false);
	// }

	// get_friends_statusses(friend_user_list: user_stamp []): friend_stamp []
	// {
	// 	const friend_stamp_list: friend_stamp [] = friend_user_list.map(friend => {
	// 		let status: string = "offline";
	// 		if (this.online_users.find_online_user(friend.name_))
	// 			status = "online";
	// 		return { stamp_: friend, status: status};
	// 	});
	// 	return (friend_stamp_list);
	// }

	@Get()
	@UseGuards(JwtAuthGuard)
	getHello(): string { return "hello there" }

	@Post('apply_for_update')
	@UseGuards(JwtAuthGuard)
	async apply_for_update(@Body() user: SelectChat): Promise<{ notification: boolean, invite: string }> {
		const new_apply: boolean = this.onlineService.online_users.add_online_user(user.username, user.chatname, "chat")
		if (new_apply)
		{
			this.onlineService.add_users([[{name_: user.username, admin_: false, timestamp: Date()}], ""]);
			this.onlineService.notify_friends(user.username);
		}
		for (let i = 0; i < 4; i++)
		{
			const update = await this.onlineService.check_notification(250, user.username);
			if (update)
			{
				this.onlineService.remove_user(user.username); //why
				return {notification : true, invite : this.onlineService.online_users.pop_invite(user.username) };
			}
		}
		this.onlineService.online_users.remove_disconnected_users(Date.now() - 2500).forEach(disconnected_user => {this.onlineService.notify_friends(disconnected_user.username)});
		return { notification: false, invite : "" };
	}

	@Post('get_chats')
	@UseGuards(JwtAuthGuard)
	async get_chats(@Body() username: UserName): Promise<{ array: chat_stamp []}> {
		return { array: await this.MessageService.get_chats_from_db(username.username) };	
	}

	@Post('get_users')
	@UseGuards(JwtAuthGuard)
	async get_users(@Body() username: SelectChat): Promise<{ array: user_stamp [], admin_: boolean, creator_: boolean }> {
		return ( await this.MessageService.get_users_from_db(username.username, username.chatname) );	
	}

	@Post('get_friends')
	@UseGuards(JwtAuthGuard)
	async get_friends(@Body() username: SelectChat): Promise<{ array_: friend_stamp [] }> {
		const friend_user_array: user_stamp [] = await this.MessageService.get_friends_from_db(username.username);
		const friend_array: friend_stamp [] = this.onlineService.get_friends_statusses(friend_user_array);
		return {array_: friend_array};	
	}

	@Post('invite_friend')
	@UseGuards(JwtAuthGuard)
	async invite_friend(@Body() add_user : AddUser): Promise<{ invited: boolean }> {
		try {
			const invitable: boolean = await this.MessageService.add_friend_invite(add_user.creator, add_user.add_user);
			if (invitable && this.onlineService.online_users.add_invite(add_user.add_user, add_user.creator))
				return {invited: true};
		} catch (error) {
			return {invited: false};
		}
		return {invited: false};
	}

	@Post('get_messages')
	@UseGuards(JwtAuthGuard)
	async get_messages(@Body() chatSelected: GetMessagesInt): Promise<{ array: message_stamp []}> {
		return { array: await this.MessageService.get_messages_from_db(chatSelected.username, chatSelected.chatname, chatSelected.password, chatSelected.offset) };	
	}

	@Post("new")
	@UseGuards(JwtAuthGuard)
	async post_new_chat(@Body() newchat : NewChat): Promise<{ message: string }> {
		if (!newchat.DM)
			this.onlineService.add_users([await this.MessageService.new_chat(newchat.chatname, newchat.creator, newchat.password), newchat.chatname]);
		else
			newchat.chatname = this.onlineService.add_users( await this.MessageService.new_dm(newchat.chatname, newchat.creator, newchat.password) );
		return { message: newchat.chatname};
	}

	@Post("add_user")
	@UseGuards(JwtAuthGuard)
	async add_user_to_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.add_user(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("add_friend")
	@UseGuards(JwtAuthGuard)
	async add_user_as_friend(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.add_friend(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("remove_friend")
	@UseGuards(JwtAuthGuard)
	async remove_user_as_friend(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.remove_friend(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("leave_chat")
	@UseGuards(JwtAuthGuard)
	async leave_chat(@Body() add_user : SelectChat): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.leave_chat(add_user.chatname, add_user.username, add_user.password), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.username + "_" + add_user.password};
	}

	@Post("add_admin")
	@UseGuards(JwtAuthGuard)
	async add_admin_to_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.add_admin(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("new_message")
	@UseGuards(JwtAuthGuard)
	async new_message(@Body() newmessage : AddMessageToSelectChat): Promise<{ message: string }> {
		let message: message_stamp = {message_: newmessage.message_, name_: newmessage.name_, user_: newmessage.user_, timestamp: newmessage.timestamp, pic_: newmessage.pic_, key_: 0};
		this.onlineService.add_users([await this.MessageService.new_message(newmessage.username, newmessage.chatname, message), newmessage.chatname]);
		return { message: newmessage.username + "_" + newmessage.chatname + "_" + message.message_};
	}

	@Post("make_public")
	@UseGuards(JwtAuthGuard)
	async make_public(@Body() add_user : MakePublic): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.make_public(add_user.chatname, add_user.creator, add_user.password_chat), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.password_chat};
	}

	@Post("add_mute")
	@UseGuards(JwtAuthGuard)
	async add_mute(@Body() mute_user : AddMute): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.add_mute(mute_user.chatname, mute_user.add_user, mute_user.creator, mute_user.minutes), ""]);
		return { message: mute_user.add_user + "_" + mute_user.creator + "_" + mute_user.minutes};
	}

	@Post("add_block")
	@UseGuards(JwtAuthGuard)
	async add_block(@Body() bock_user : AddBlock): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.add_block(bock_user.add_user, bock_user.creator, bock_user.minutes), ""]);
		return { message: bock_user.add_user + "_" + bock_user.creator + "_" + bock_user.minutes};
	}

	@Post("remove_user")
	@UseGuards(JwtAuthGuard)
	async remove_user_from_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.remove_user(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("ban_user")
	@UseGuards(JwtAuthGuard)
	async ban_user_from_chat(@Body() ban_user : AddUser): Promise<{ message: string }> {
		this.onlineService.add_users([await this.MessageService.ban_user(ban_user.chatname, ban_user.creator, ban_user.add_user), ban_user.chatname]);
		return { message: ban_user.chatname + "_" + ban_user.creator + "_" + ban_user.add_user};
	}
}
