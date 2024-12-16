import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { OnlineUsers } from '../online_users';

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

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// limits number of clients?
@Controller('messages')
export class MessageController {
	private notify_users:		string[] = ["Server_administrator"];

	constructor( private readonly MessageService: MessageService, private online_users: OnlineUsers ) {	}

	remove_user(user: string): void
	{
		let i: number = 0;
		while (i < this.notify_users.length)
		{
			if (this.notify_users[i] == user)
				this.notify_users.splice(i, 1);
			else
				i++;
		}
	}

	add_users( user_input: [user_stamp[], string]): string
	{
		//console.log("adding users:");
		//console.log(user_input[0]);
		let i_ru: number = 0;
		const online_relevant_users = this.online_users.find_online_users_by_channel(user_input[1]);
		while (i_ru < user_input[0].length)
		{
				//console.log(user_input[0][i_ru] + "is online");
				if (!this.notify_users.includes(user_input[0][i_ru].name_)
					&& online_relevant_users.find((value) => value.username == user_input[0][i_ru].name_))
				{
					//console.log(user_input[0][i_ru] + "is added");
					this.notify_users.push(user_input[0][i_ru].name_);
				}
			i_ru++;
		}
		//console.log("result");
		//console.log(this.notify_users);
		return (user_input[1]);
	}

	async check_notification(sleep_ms: number, username: string): Promise<boolean> // might have to protect from unauthroized usage
	{
		if (this.notify_users && this.notify_users.includes(username))
			return (true);
		else
			await sleep(sleep_ms);
		return (false);
	}

	@Post('apply_for_update')
	async apply_for_update(@Body() user: SelectChat): Promise<{ notification: boolean }> {
		this.online_users.add_online_user(user.username, user.chatname)
		for (let i = 0; i < 4; i++)
		{
			const update = await this.check_notification(250, user.username);
			if (update)
			{
				//console.log(user.username + "update?" + update);
				this.remove_user(user.username);
				return {notification : true};
			}
		}
		this.online_users.remove_disconnected_users(Date.now() - 10000);
		return { notification: false };
	}

	@Post('get_chats')
	async get_chats(@Body() username: UserName): Promise<{ array: chat_stamp []}> {
		return { array: await this.MessageService.get_chats_from_db(username.username) };	
	}

	@Post('get_users')
	async get_users(@Body() username: SelectChat): Promise<{ array: user_stamp [], admin_: boolean, creator_: boolean }> {
		return ( await this.MessageService.get_users_from_db(username.username, username.chatname) );	
	}

	@Post('get_messages')
	async get_messages(@Body() chatSelected: GetMessagesInt): Promise<{ array: message_stamp []}> {
		return { array: await this.MessageService.get_messages_from_db(chatSelected.username, chatSelected.chatname, chatSelected.password, chatSelected.offset) };	
	}

	@Post("new")
	async post_new_chat(@Body() newchat : NewChat): Promise<{ message: string }> {
		if (!newchat.DM)
			this.add_users([await this.MessageService.new_chat(newchat.chatname, newchat.creator, newchat.password), newchat.chatname]);
		else
			newchat.chatname = this.add_users( await this.MessageService.new_dm(newchat.chatname, newchat.creator, newchat.password) );
		return { message: newchat.chatname};
	}

	@Post("add_user")
	async add_user_to_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.add_users([await this.MessageService.add_user(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("leave_chat")
	async leave_chat(@Body() add_user : SelectChat): Promise<{ message: string }> {
		this.add_users([await this.MessageService.leave_chat(add_user.chatname, add_user.username, add_user.password), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.username + "_" + add_user.password};
	}

	@Post("add_admin")
	async add_admin_to_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.add_users([await this.MessageService.add_admin(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("new_message")
	async new_message(@Body() newmessage : AddMessageToSelectChat): Promise<{ message: string }> {
		let message: message_stamp = {message_: newmessage.message_, name_: newmessage.name_, user_: newmessage.user_, timestamp: newmessage.timestamp, pic_: newmessage.pic_, key_: 0};
		this.add_users([await this.MessageService.new_message(newmessage.username, newmessage.chatname, message), newmessage.chatname]);
		return { message: newmessage.username + "_" + newmessage.chatname + "_" + message.message_};
	}

	@Post("make_public")
	async make_public(@Body() add_user : MakePublic): Promise<{ message: string }> {
		this.add_users([await this.MessageService.make_public(add_user.chatname, add_user.creator, add_user.password_chat), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.password_chat};
	}

	@Post("add_mute")
	async add_mute(@Body() mute_user : AddMute): Promise<{ message: string }> {
		this.add_users([await this.MessageService.add_mute(mute_user.chatname, mute_user.add_user, mute_user.creator, mute_user.minutes), ""]);
		return { message: mute_user.add_user + "_" + mute_user.creator + "_" + mute_user.minutes};
	}

	@Post("add_block")
	async add_block(@Body() bock_user : AddBlock): Promise<{ message: string }> {
		this.add_users([await this.MessageService.add_block(bock_user.add_user, bock_user.creator, bock_user.minutes), ""]);
		return { message: bock_user.add_user + "_" + bock_user.creator + "_" + bock_user.minutes};
	}

	@Post("remove_user")
	async remove_user_from_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
		this.add_users([await this.MessageService.remove_user(add_user.chatname, add_user.creator, add_user.add_user), add_user.chatname]);
		return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
	}

	@Post("ban_user")
	async ban_user_from_chat(@Body() ban_user : AddUser): Promise<{ message: string }> {
		this.add_users([await this.MessageService.ban_user(ban_user.chatname, ban_user.creator, ban_user.add_user), ban_user.chatname]);
		return { message: ban_user.chatname + "_" + ban_user.creator + "_" + ban_user.add_user};
	}
}
