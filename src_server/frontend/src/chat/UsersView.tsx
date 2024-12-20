import logo from './8589-screaming-cat.png';
import './App.css';
import React from 'react';
import axios from '../axios';
import { UserStats, UsersViewProps, user_stamp } from './Chat.interface';

interface UserStamp_int {
	usery:			user_stamp;
	logged_in_user:	UserStats;
  }

interface	UserStampList_int {
	users:			user_stamp[];
	logged_in_user:	UserStats;
}

export const GoBackToChat = (	logged_in_user: UserStats,
		setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
		setSwitch: React.Dispatch<React.SetStateAction<number>>,
		setInput: React.Dispatch<React.SetStateAction<string>>,
		setPassword: React.Dispatch<React.SetStateAction<string>> ) => {
	//console.log("Going back to chat:" + logged_in_user.chatname);
	setSwitch(1);
	setLoaded(false);
	setInput("");
	setPassword("");
	logged_in_user.loaded = false;
	logged_in_user.loading = false;
}

export const UsersView: React.FC<UsersViewProps> = ({ logged_in_user, users_input, setLoaded, setSwitch, input1, password1 }) => {
	function USERSTAMP_RENDER({usery, logged_in_user}: UserStamp_int ): React.ReactElement {
		// console.log(usery.name_);
		if (usery.name_ !== logged_in_user.username)
			return (
				<div>
					<li className={"App-chat_name"}>{usery.name_}</li>
					<button onClick={() => ButtonGoAddMuteOrBlock(usery.name_)} className={"App-chat_name_button"}> Edit user. </button>
				</div>
			)
		else
			return (
				<div>
					<li className={"App-chat_name"}>{usery.name_}</li>
				</div>
		)
	}

	function USERSTAMP_LIST( {users, logged_in_user} : UserStampList_int ) {
		return (
			<section>
				<h2>{"All chats:"}</h2>
				{users.map(user =>
					<USERSTAMP_RENDER key={user.name_} usery={user} logged_in_user={logged_in_user}/>
				).reverse()}
			</section>
		);
	}

	function ButtonGoAddMuteOrBlock(username: string) {
		logged_in_user.selected_user = username;
		setSwitch(5);
		//console.log("add as mute or block:" + username);
	}

	const makePublic = async (): Promise<boolean> => {
		try {
			await axios.post('/api/messages/make_public',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, password_chat: password1.state});
			//console.log("Password setted:" + response.data.message);
			return true;
		} catch (err: any) {
			if (!err?.response) {
				console.log('No server response.');
			} else if (err.response?.status === 409) {
				console.log('Chats does not exists, please create.'); // login?
			} else {
				console.log('You no admin.'); // not able to login or blocked
			}
			return false;
		}
	}

	const addNewUser = async (): Promise<boolean> => {
		try {
			await axios.post('/api/messages/add_user',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: input1.state});
			//console.log("User added:" + response.data.message);
			return true;
		} catch (err: any) {
			if (!err?.response) {
				console.log('No server response.');
			} else if (err.response?.status === 409) {
				console.log('User exists, please login.'); // login?
			} else {
				console.log('You no admin.'); // not able to login or blocked
			}
			return false;
		}
	}

	const leaveChat = async (chatname_leaving: string): Promise<boolean> => {
		try {
			await axios.post('/api/messages/leave_chat',
				{chatname: chatname_leaving,  username: logged_in_user.username, password: logged_in_user.password});
			//console.log("Chat left:" + response.data.message);
			setLoaded(false);
			logged_in_user.loaded = false;
			logged_in_user.loading = false;
			return true;
		} catch (err: any) {
			if (!err?.response) {
				console.log('No server response.');
			} else if (err.response?.status === 409) {
				console.log('User exists, please login.'); // login?
			} else {
				console.log('You no admin.'); // not able to login or blocked
			}
			return false;
		}
	}

	async function	setPublic(event: any) {
		//console.log("Publicize chat:" + logged_in_user.chatname);
		makePublic();
		event.preventDefault();
	}

	async function	addUser(event: any) {
		//console.log("add user input is:" + input1.state + ", chatname:" + logged_in_user.chatname);
		if (input1.state !== "")
		{
			addNewUser();
			input1.setState("");
		}
		event.preventDefault();
	}

	function LeaveChat() {
		leaveChat(logged_in_user.chatname);
		logged_in_user.chatname = "";
		// messages_input = []; might be needed
		setSwitch(0);
		input1.setState("");
		setLoaded(false);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
	}
	return (
		<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>Editing: {logged_in_user.chatname}</h2>
			<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input1.setState, password1.setState)} className={"App-chat_name_button"}> Go to chat. </button>
			<button onClick={() => LeaveChat()}> Leave this chat. </button>
			{logged_in_user.page_admin && <form onSubmit={addUser}>
				<input type="text" placeholder="Enter username to add to chat" value={input1.state} onChange={(e) => input1.setState(e.target.value)} />
				<input type="submit" value="Add user" />
			</form>}
			{logged_in_user.page_creator && <form onSubmit={setPublic}>
				<input type="password" placeholder="Enter password to chat" value={password1.state} onChange={(e) => password1.setState(e.target.value)} />
				<input type="submit" value="Set public, with password." />
			</form>}
			</header>
			<ol>
				<USERSTAMP_LIST users={users_input} logged_in_user={logged_in_user}/>
			</ol>
		</div>
	);
}