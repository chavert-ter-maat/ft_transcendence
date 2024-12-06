import logo from './8589-screaming-cat.png';
import './App.css';
import React from 'react';
import axios from '../axios';
import { UserStats, UsersViewProps } from './Chat.interface';

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
	let	users_jsx : any = [];

	function ButtonGoAddMuteOrBlock(username: string) {
		logged_in_user.selected_user = username;
		setSwitch(5);
		//console.log("add as mute or block:" + username);
	}

	const makePublic = async (): Promise<boolean> => {
		try {
			await axios.post('/messages/make_public',
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
			await axios.post('/messages/add_user',
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
			await axios.post('/messages/leave_chat',
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

	users_input.forEach(function (usery, index) {
		users_jsx.push(<li className={"App-chat_name"} key={index}>{usery.name_}</li>);
		if (usery.name_ !== logged_in_user.username)
			users_jsx.push( <button onClick={() => ButtonGoAddMuteOrBlock(usery.name_)} className={"App-chat_name_button"}> Edit user. </button> );
	});

	if (logged_in_user.page_creator && logged_in_user.page_admin)
		{
			return (
				<div className="App">
					<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Editing: {logged_in_user.chatname}</h2>
					<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input1.setState, password1.setState)} className={"App-chat_name_button"}> Go to chat. </button>
					<button onClick={() => LeaveChat()}> Leave this chat. </button>
					<form onSubmit={addUser}>
						<input type="text" placeholder="Enter username" value={input1.state} onChange={(e) => input1.setState(e.target.value)} />
						<input type="submit" value="Add user" />
					</form>
					<form onSubmit={setPublic}>
						<input type="password" placeholder="Enter password" value={password1.state} onChange={(e) => password1.setState(e.target.value)} />
						<input type="submit" value="Set public, with password." />
					</form>
					</header>
					<ol>
						{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
					</ol>
				</div>
			);
		}
	if (logged_in_user.page_admin)
	{
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>Editing: {logged_in_user.chatname}</h2>
				<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input1.setState, password1.setState)}> Go to chat. </button>
				<button onClick={() => LeaveChat()}> Leave this chat. </button>
				<form onSubmit={addUser}>
					<input type="text" placeholder="Enter username" value={input1.state} onChange={(e) => input1.setState(e.target.value)} />
					<input type="submit" value="Add user" />
				</form>
				</header>
				<ol>
					{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
				</ol>
			</div>
		);
	}
	else
	{
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>Editing: {logged_in_user.chatname}</h2>
				<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input1.setState, password1.setState)}> Go to chat. </button>
				<button onClick={() => LeaveChat()}> Leave this chat. </button>
				</header>
				<ol>
					{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
				</ol>
			</div>
		);
	}
}