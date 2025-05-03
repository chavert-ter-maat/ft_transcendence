export interface ConnUser {
	username:	string;
	channel:	string;
	timestamp:	number;
	invited_by:	string;
	location:	string;
}

export class OnlineUsers{
	connected_users: ConnUser[] = [];

	add_online_user(username: string, channel: string, location: string): boolean{
		const user = this.connected_users.find((conn_user) => conn_user.username == username);
		if (user)
		{
			user.channel = channel;
			user.timestamp = Date.now();
			if (user.location != location){
				user.location = location;
				return true;
			}
			user.location = location;
			return false;
		}
		else
		{
			this.connected_users.push({username, channel, timestamp: Date.now(), invited_by: "", location: location});
			return true;
		}
	}
	add_invite(username: string, added_by: string): boolean
	{
		const user: ConnUser[] = this.connected_users.filter((conn_user) => (conn_user.username == username && conn_user.location == "chat"));
		if (user.length === 0)
			return (false);
		user[0].invited_by = added_by;
		return (true);
	}
	find_online_users_by_channel(channel: string): ConnUser[]{
		return (this.connected_users.filter((conn_user) => (conn_user.channel == channel || conn_user.channel == "" || channel == "")));
	}
	find_online_user(username: string): ConnUser{
		const user: ConnUser[] = this.connected_users.filter((conn_user) => (conn_user.username == username));
		if (user.length !== 0)
			return (user[0]);
		return (undefined);
	}
	pop_invite(username: string): string{
		const user: ConnUser = this.find_online_user(username);
		const invited_by: string = user.invited_by;
		user.invited_by = "";
		return (invited_by);
	}
	remove_disconnected_users( remove_before: number ): ConnUser[]{
		this.connected_users.forEach(conn_user => {if (conn_user.timestamp < remove_before && conn_user.location == "chat") { conn_user.location = "online" } })
		const disconnected_users: ConnUser[] = this.connected_users.filter((conn_user) => conn_user.timestamp < remove_before);
		return (disconnected_users);
	}
	remove_user( username: string )
	{
		this.connected_users = this.connected_users.filter((conn_user) => conn_user.username != username);
	}
}
