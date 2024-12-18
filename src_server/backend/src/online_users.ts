interface ConnUser {
	username:	string;
	channel:	string;
	timestamp:	number;
}

export class OnlineUsers{
	connected_users: ConnUser[] = [];

	add_online_user(username: string, channel: string): void{
		const user = this.connected_users.find((conn_user) => conn_user.username == username);
		if (user)
		{
			user.channel = channel;
			user.timestamp = Date.now();
		}
		else
		{
			this.connected_users.push({username, channel, timestamp: Date.now()});
		}
	}
	find_online_users_by_channel(channel: string): ConnUser[]{
		return (this.connected_users.filter((conn_user) => (conn_user.channel == channel || conn_user.channel == "" || channel == "")));
	}
	remove_disconnected_users( remove_before: number ): void{
		this.connected_users = this.connected_users.filter((conn_user) => conn_user.timestamp >= remove_before);
	}
}
