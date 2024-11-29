import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { MessageService } from './message.service';

interface message_stamp { message_: string, name_: string, user_ : string, timestamp: string, pic_: string };

interface UserName {
	username:	string;
	password:	string;
}

interface NewChat {
	chatname:	string;
	creator:	string;
}

interface AddUser {
	chatname:	string;
	creator:	string;
	add_user:	string;
}

interface SelectChat {
	username:	string;
	password:	string;
	chatname:	string;
}

interface AddMessageToSelectChat {
	username:	string;
	password:	string;
	chatname:	string;
	message_: 	string;
	name_: 		string;
	user_ : 	string;
	timestamp: 	string;
	pic_: 		string;
}

interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number};
interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// limits number of clients?
@Controller('messages')
export class MessageController {
	// private	connected_users:	string[] = []; //disconnection is too long
	private notify_users:		string[] = ["Server_administrator"];

	constructor(private readonly MessageService: MessageService) {	}

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

	add_users(relevant_users: user_stamp[]): void
	{
		console.log("adding users:");
		console.log(relevant_users);
		let i_ru: number = 0;
		while (i_ru < relevant_users.length)
		{
				console.log(relevant_users[i_ru] + "is online");
				if (!this.notify_users.includes(relevant_users[i_ru].name_))
				{
					console.log(relevant_users[i_ru] + "is added");
					this.notify_users.push(relevant_users[i_ru].name_);
				}
			i_ru++;
		}
		console.log("result");
		console.log(this.notify_users);
	}

	async check_notification(sleep_ms: number, username: string): Promise<boolean>
	{
		if (this.notify_users && this.notify_users.includes(username))
			return (true);
		else
			await sleep(sleep_ms);
		return (false);
	}

  @Get()
  async get_nothing(): Promise<{ message: string }> {
    return { message: 'Jojo!' };
  }

	@Post('apply_for_update')
		async apply_for_update(@Body() username: UserName): Promise<{ notification: boolean }> {
		for (let i = 0; i < 4; i++)
		{
			const update = await this.check_notification(250, username.username);
			if (update)
			{
				console.log(username.username + "update?" + update);
				this.remove_user(username.username);
				return {notification : true};
			}
		}
		return { notification: false };
	}

  @Post('get_chats')
  async get_chats(@Body() username: UserName): Promise<{ array: chat_stamp []}> {
    return { array: await this.MessageService.get_chats_from_db(username.username) };
  }

  @Post('get_users')
  async get_users(@Body() username: SelectChat): Promise<{ array: user_stamp []}> {
    return { array: await this.MessageService.get_users_from_db(username.username, username.chatname) };
  }

  @Post('get_messages')
  async get_messages(@Body() chatSelected: SelectChat): Promise<{ array: message_stamp []}> {
    return { array: await this.MessageService.get_messages_from_db(chatSelected.username, chatSelected.chatname) };
  }

  @Post()
  async post_shit(@Body() username: UserName): Promise<{ message: string }> {
	return { message: username.username};
  }
  @Post("new")
  async post_new_chat(@Body() newchat : NewChat): Promise<{ message: string }> {
	await this.MessageService.new_chat(newchat.chatname, newchat.creator);
	return { message: newchat.chatname + "_" + newchat.creator};
  }
  @Post("add_user")
  async add_user_to_chat(@Body() add_user : AddUser): Promise<{ message: string }> {
	const added = await this.MessageService.add_user(add_user.chatname, add_user.creator, add_user.add_user);
	if (added) // && this.connected_users.includes(add_user.add_user))
	{
		if (!this.notify_users.includes(add_user.add_user))
			this.notify_users.push(add_user.add_user);
		if (!this.notify_users.includes(add_user.creator))
			this.notify_users.push(add_user.creator);
	}
	return { message: add_user.chatname + "_" + add_user.creator + "_" + add_user.add_user};
  }
  @Post("new_message")
  async new_message(@Body() newmessage : AddMessageToSelectChat): Promise<{ message: string }> {
	let message: message_stamp = {message_: newmessage.message_, name_: newmessage.name_, user_: newmessage.user_, timestamp: newmessage.timestamp, pic_: newmessage.pic_};
	this.add_users(await this.MessageService.new_message(newmessage.username, newmessage.chatname, message));
	return { message: newmessage.username + "_" + newmessage.chatname + "_" + message.message_};
  }
}
