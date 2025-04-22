import { Injectable, } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OnlineUsers } from 'src/online_users';
import { MessageService } from './message.service';

interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };
interface friend_stamp	{ stamp_: user_stamp, status: string };

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OnlineService {
	constructor( private readonly MessageService: MessageService, public online_users: OnlineUsers ) {	console.log("OnlineService is constructed") }
	private notify_users:		string[] = ["Server_administrator"];

	remove_user(user: string): void
	{
		// console.log("\nREMOVE USER???\n", user, "\n\n\n");
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
		let i_ru: number = 0;
		// console.log("\nADDING USER:\n\n", user_input[0], "}{", user_input[1]);
		const online_relevant_users = this.online_users.find_online_users_by_channel(user_input[1]);
		// console.log("\nONLINE USERS:\n\n", this.online_users.connected_users);
		while (i_ru < user_input[0].length)
		{
				if (!this.notify_users.includes(user_input[0][i_ru].name_)
					&& online_relevant_users.find((value) => value.username == user_input[0][i_ru].name_))
					this.notify_users.push(user_input[0][i_ru].name_);
			i_ru++;
		}
		// console.log("\nONLINE USERS:\n\n", this.online_users.connected_users);
		return (user_input[1]);
	}

	async notify_friends( username: string )
	{
		const friend_user_array: user_stamp [] = await this.MessageService.get_friends_from_db(username);
		const friend_array: friend_stamp [] = this.get_friends_statusses(friend_user_array);
		friend_array.filter(friend => friend.status === "chat").forEach(friend => this.add_users([[{name_: friend.stamp_.name_, admin_: false, timestamp: Date()}], ""]) );
	}

	async check_notification(sleep_ms: number, username: string): Promise<boolean> // might have to protect from unauthroized usage
	{
		if (this.online_users.find_online_user(username)?.invited_by && this.online_users.find_online_user(username)?.invited_by !== "")
			return (true);
		else if (this.notify_users && this.notify_users.includes(username))
			return (true);
		else
			await sleep(sleep_ms);
		return (false);
	}

	get_friends_statusses(friend_user_list: user_stamp []): friend_stamp []
	{
		const friend_stamp_list: friend_stamp [] = friend_user_list.map(friend => {
			let status: string = "offline";
			if (this.online_users.find_online_user(friend.name_))
				status = this.online_users.find_online_user(friend.name_).location;
			console.log(this.online_users.find_online_user(friend.name_));
			return { stamp_: friend, status: status};
		});
		return (friend_stamp_list);
	}
}