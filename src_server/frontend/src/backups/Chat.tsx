import logo from './8589-screaming-cat.png';
import a from './talking_cat_d.jpeg';
import b from './talking_cat_ab.jpeg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from '../axios';
// import { useState } from 'react';
// import { App_parent } from './App_parent';
// import {switchy} from './index';
// import React, { useState } from 'react';

interface message_stamp { message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface chat_stamp { name_: string, unread_: number, timestamp: string, users: string[], index: number};
// interface user_stamp { name_: string}; //user_ };

let	chat_index: number = 0;
let messages_input: message_stamp[] = [];
let	chats_input: chat_stamp[] = [];
// let	users_input: user_stamp[] = [];

let user: {name: string, count: number} = {
	name: 'Jojo',
	count: 0
  };

let chatey:	string = "";
let switchy: number = 0;

// export function App ()
const Chat: React.FC = () =>  {
	const [namey1, setNamey1] = useState(user.name);
	const [namey2, setNamey2] = useState("someone else");
	const [chatey1, setChatey1] = useState(chatey);
	const [swicthy_state, setSwitch] = useState(switchy);
	function ButtonGoToChats() {
		function handleClick() {
			chatey = "";
			setSwitch(0);
		}
		return (
		<button onClick={handleClick}>
			Go back to chats overview.
		</button>
		);
	  }
	function ButtonGoToChat(chat_name: string, unread_: number, index: number) {
		function handleClick() {
			chat_index = index;
			console.log("log chat selected:" + chat_name + "==" + chats_input[chat_index].name_);
			chatey = chat_name;
			setSwitch(1);
			setChatey1(chatey);
		}
		return (
		<button onClick={handleClick} className={"App-chat_name_button"}>
			{unread_.toString()}
		</button>
		);
	  }
	function ButtonGoToEditChat() {
		function handleClick() {
			console.log("Edit this chat:" + chatey1);
			setSwitch(2);
		}
		return (
		<button onClick={handleClick}>
			Edit this chat: {chatey1}
		</button>
		);
	  }
	  function ButtonGoBackToChat() {
		function handleClick() {
			console.log("Going back to chat:" + chatey1);
			setSwitch(1);
		}
		return (
		<button onClick={handleClick}>
			Go back to chat.
		</button>
		);
	  }
	function	handleSubmit1(event: any) { //any is bad practice
		if (namey1 !== "")
			messages_input.push({message_: namey1, name_: user.name, user_: "App-message_" + user.name, timestamp: Date(), pic_: a}); //Date(Date.now())
		setNamey1("");
		event.preventDefault();
	  }
	function	handleSubmit2(event: any) {
		if (namey2 !== "")
			messages_input.push({message_: namey2, name_: "someone_else", user_: "App-message_someone_else", timestamp: Date(), pic_: b}); //Date(Date.now())
		setNamey2("");
		event.preventDefault();
	  }
	function	addUser(event: any) {
		if (namey2 !== "")
			chats_input[chat_index].users.push(namey2)
		console.log("Added user:" + namey2);
		setNamey2("");
		event.preventDefault();
	  }
	async function	addChat(event: any) {
		if (chatey1 !== "")
			chats_input.push({name_: chatey1, unread_: 0, timestamp: Date(), users: [namey1], index: chats_input.length}); //Date(Date.now())
		// make create request at server
		// try {
		// 	const response = await axios.post('/messages/new', {chatname: chatey1,  creator: namey1});//, {
		// 	console.log("response:" + response.data.message);
		//   } catch (error: any) {
		// 	alert(error.response?.data.message || 'Login failed');
		//   }
		// return to existing or new. (block / login / accept)
		// if (response.data.message)
		chatey = chatey1;
		setSwitch(1);
		event.preventDefault();
	  }

	//return overview view:
	console.log("switch" + chatey);

	const getUserName = async (): Promise<void> => {
	try {
		// const putting = await axios.post('/messages', { username: "jojo" });
		const response = await axios.post('/messages', {username: user.name,  password: "why?"});//, {
		// 	params: {
		// 		username: "hoi"
		// 	}
		// })
		// .then( function (response) {
		// 	console.log(response);
		// });
		console.log("response:" + response.data.message);
		setNamey1(response.data.message);
		// navigate('/chat');
	  } catch (error: any) {
		alert(error.response?.data.message || 'Login failed');
	  }
	}
	getUserName();
	// useEffect(() => {
	// 	fetch("http://localhost:5001/messages", {mode:'cors'})
	// 	.then(response => response.text())
	// 	.then(data => setNamey1(data))
	// }, [])

	if (swicthy_state === 0)
	{
		let	chats_jsx : any = [];
		chats_input.forEach(function (chatey, index) {
			chats_jsx.push(<li className={"App-chat_name"} key={index}>{chatey.name_}</li>);
			chats_jsx.push(ButtonGoToChat(chatey.name_, chatey.unread_, index));
			chats_jsx.push(<li className={"App-chat_name_timestamp"} key={index}>{chatey.timestamp}</li>);
			});
		return (
		<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<h2>{user.name}</h2>
			<form onSubmit={addChat}>
				<input type="text" value={chatey1} onChange={(e) => setChatey1(e.target.value)} />
				<input type="submit" value="Add chat" />
			</form>
			</header>
			<ol>
				{chats_jsx.map((chat_jsx : any) => <>{chat_jsx}</>)}
			</ol>
		</div>
	  );
	}

	else if (swicthy_state === 2)
	{
		let	users_jsx : any = [];
		chats_input[chat_index].users.forEach(function (usery, index) {
			users_jsx.push(<li className={"App-chat_name"} key={index}>{usery}</li>);
			// users_jsx.push(ButtonGoToChat(chatey.name_, chatey.unread_, index));
			// users_jsx.push(<li className={"App-chat_name_timestamp"} key={index}>{chatey.timestamp}</li>);
			});
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>Editing: {chatey1}</h2>
				<ButtonGoBackToChat/>
				<form onSubmit={addUser}>
					<input type="text" value={namey2} onChange={(e) => setNamey2(e.target.value)} />
					<input type="submit" value="Add user" />
				</form>
				</header>
				<ol>
					{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
				</ol>
			</div>
		);
	}

	//Add all mesages to display list
	let	messages_jsx : any = [];
	messages_input.forEach(function (messagey, index) {
		messages_jsx.push(<li className={messagey.user_+"_user"} key={index}>{messagey.name_}</li>);
		messages_jsx.push(<img src={messagey.pic_} className={messagey.user_+"_pic"}/>);
		messages_jsx.push(<li className={messagey.user_} key={index}>{messagey.message_}</li>);
		messages_jsx.push(<li className={messagey.user_+"_timestamp"} key={index}>{messagey.timestamp}</li>);
		});
	messages_input.reverse();

	// return message view:
	return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
		<h2>{chatey}</h2>
		<ButtonGoToChats />
		<form onSubmit={handleSubmit1}>
			<input type="text" value={namey1} onChange={(e) => setNamey1(e.target.value)} />
			<input type="submit" value="Message" />
		</form>
		<form onSubmit={handleSubmit2}>
			<input type="text" value={namey2} onChange={(e) => setNamey2(e.target.value)} />
			<input type="submit" value="Message, until database can be loaded" />
		</form>
		<ButtonGoToEditChat />
		</header>
		<ol>
			{messages_jsx.map((message_jsx : any) => <>{message_jsx}</>)}
		</ol>
    </div>
  );
}

export default Chat;
