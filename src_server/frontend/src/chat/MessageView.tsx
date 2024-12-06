import logo from './8589-screaming-cat.png';
import a from './talking_cat_d.jpeg';
import b from './talking_cat_ab.jpeg';
import './App.css';
import React from 'react';
import axios from '../axios';
import { UserStats, MessagesViewProps, message_stamp } from './Chat.interface';

export const GoToChatOverview = (	logged_in_user: UserStats,
		setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
		setSwitch: React.Dispatch<React.SetStateAction<number>>,
		messages_input: message_stamp[],
		setInput: React.Dispatch<React.SetStateAction<string>> ) => {
	logged_in_user.chatname = "";
	messages_input = [];
	setSwitch(0);
	setInput("");
	setLoaded(false);
	logged_in_user.loaded = false;
	logged_in_user.loading = false;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ logged_in_user, messages_input, setLoaded, setSwitch, input1 }) => {
	let	messages_jsx : any = [];

	const addNewMessage = async (): Promise<boolean> => {
		try {
			//console.log("Chat added:" + logged_in_user.username + "_" + logged_in_user.chatname);
			await axios.post('/messages/new_message',
				{username: logged_in_user.username,  password: logged_in_user.chat_password, chatname: logged_in_user.chatname,
					message_: input1.state, name_: logged_in_user.username,
					user_: "App-message_" + logged_in_user.username, timestamp: Date(), pic_: "a"});
			//console.log("Chat added:" + response.data.message);
			return true;
		} catch (err: any) {
			if (!err?.response) {
				console.log('No server response.');
			} else if (err.response?.status === 409) {
				console.log('Chat exists, please login.'); // login?
			} else {
				console.log('This is a private chat.'); // not able to login or blocked
			}
			return false;
		}
	}

	function	enterOnMessage(event: any) { //any is bad practice
		if (input1.state !== "")
			addNewMessage();
		input1.setState("");
		event.preventDefault();
	}

	function GoToPrevPage() {
		//console.log("Previous page:" + logged_in_user.chatname);
		setLoaded(false);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
		if (logged_in_user.page_offset > 0)
		{
			logged_in_user.page_offset -= 20;
			logged_in_user.end_reached = false;
		}
	}

	function GoToNextPage() {
		//console.log("Next page:" + logged_in_user.chatname);
		setLoaded(false);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
		if (!logged_in_user.end_reached)
			logged_in_user.page_offset += 20;
	}

	function GoToEditChat() {
		//console.log("Edit this chat:" + logged_in_user.chatname);
		setSwitch(2);
		setLoaded(false);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
	}

	messages_input.forEach(function (messagey, index) {
		if (messagey.name_ === logged_in_user.username)
		{
			messages_jsx.push(<li className={"App-message_Jojo_user"} key={index}>{messagey.name_}</li>);
			messages_jsx.push(<img src={a} className={"App-message_Jojo_pic"} alt={""}/>);
			messages_jsx.push(<li className={"App-message_Jojo"} key={index}>{messagey.message_}</li>);
			messages_jsx.push(<li className={"App-message_Jojo_timestamp"} key={index}>{messagey.timestamp}</li>);
		}
		else
		{
			messages_jsx.push(<li className={"App-message_someone_else_user"} key={index}>{messagey.name_}</li>);
			messages_jsx.push(<img src={b} className={"App-message_someone_else_pic"} alt={""}/>);
			messages_jsx.push(<li className={"App-message_someone_else"} key={index}>{messagey.message_}</li>);
			messages_jsx.push(<li className={"App-message_someone_else_timestamp"} key={index}>{messagey.timestamp}</li>);
		}
	});
	messages_input.reverse();

	// return message view:
	return (
		<div className="App">
		<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>{logged_in_user.chatname}</h2>
			<button onClick={() => GoToChatOverview(logged_in_user, setLoaded, setSwitch, messages_input, input1.setState)} className={"App-chat_name_button"}> Go to chat overview. </button>
			<form onSubmit={enterOnMessage}>
				<input type="text" value={input1.state} onChange={(e) => input1.setState(e.target.value)} />
				<input type="submit" value="Message" />
			</form>
			<button onClick={() => GoToPrevPage()}> Go to previous page. </button>
			<button onClick={() => GoToEditChat()}> Edit this chat: {logged_in_user.chatname}. </button>
			<button onClick={() => GoToNextPage()}> Go to next page. </button>
			</header>
			<ol>
				{messages_jsx.map((message_jsx : any) => <>{message_jsx}</>)}
			</ol>
		</div>
	);
}