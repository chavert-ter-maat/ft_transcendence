import logo from './8589-screaming-cat.png';
import './App.css';
import React from 'react';
import axios from '../axios';
import { UserStats, ChatOverviewProps } from './Chat.interface';

export const addNewChat = async (logged_in_user: UserStats, DM: boolean): Promise<number> => {
	try {
		const response = await axios.post('/messages/new',
			{chatname: logged_in_user.chatname, creator: logged_in_user.username, password: logged_in_user.chat_password, DM:DM});
		if (DM)
			logged_in_user.chatname = response.data.message;
		console.log("Chat added:" + response.data.message);
		return 1;
	} catch (err: any) {
		if (!err?.response) {
			console.log('No server response.');
		} else if (err.response?.status === 409) {
			console.log('Chat exists, please login.'); // login?
		} 
		else if (err.response?.status === 401)	{
			console.log("Log in for chat:" + err.response.message);
			return 2;
		} else {
			console.log('This is a private chat.'); // not able to login or blocked
		}
		return 0;
	}
}

const GoToChat = (	logged_in_user: UserStats,
					setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
					setSwitch: React.Dispatch<React.SetStateAction<number>>,
					button_chat_name: string) => {
	logged_in_user.chatname = button_chat_name;
	console.log("log chat selected:" + button_chat_name);
	setSwitch(1);
	logged_in_user.page_offset = 0;
	logged_in_user.page_admin = false;
	logged_in_user.page_creator = false;
	logged_in_user.end_reached = false;
	setLoaded(false);
	logged_in_user.loaded = false;
	logged_in_user.loading = false;
}

export const ChatOverviewPage: React.FC<ChatOverviewProps> = ({ logged_in_user, chats_input, setLoaded, setSwitch, input1, input2 }) => {
	let	chats_jsx : any = [];

	async function	addChat(event: any) {
		console.log("input is:" + input1.state + ", chatname:" + logged_in_user.chatname);
		if (input1.state !== "")
		{
			logged_in_user.chatname = input1.state;
			addNewChat(logged_in_user, false).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
			input1.setState("");
		}
		event.preventDefault();
	}

	async function	addDM(event: any) {
		console.log("DM input is:" + input2.state + ", chatname:" + logged_in_user.chatname);
		if (input2.state !== "")
		{
			logged_in_user.chatname = input2.state;
			addNewChat(logged_in_user, true).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
			input2.setState("");
		}
		event.preventDefault();
	}

	chats_input.forEach(function (chatey, index) {
		let buttonname: string = chatey.name_;
		if (chatey.DM)
			buttonname = chatey.name_.replace("_" + logged_in_user.username, ""); // might be buggy if _ is allowed in username
		chats_jsx.push(<li className={"App-chat_name"} key={index}>{buttonname}</li>);
		chats_jsx.push(<button onClick={() => GoToChat(logged_in_user, setLoaded, setSwitch, chatey.name_)} className={"App-chat_name_button"}> Go to </button>);
		chats_jsx.push(<li className={"App-chat_name_timestamp"} key={index}>{chatey.timestamp}</li>);
	});
	chats_input.reverse(); // weird shit

	return (
		<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>{logged_in_user.username}</h2>
			<form onSubmit={addChat}>
				<input type="text" value={input1.state} onChange={(e) => input1.setState(e.target.value)} />
				<input type="submit" value="Add chat" />
			</form>
			<form onSubmit={addDM}>
				<input type="text" value={input2.state} onChange={(e) => input2.setState(e.target.value)} />
				<input type="submit" value="Add direct message to user" />
			</form>
			</header>
			<ol>
				{chats_jsx.map((chat_jsx : any) => <>{chat_jsx}</>)}
			</ol>
		</div>
	);
}
