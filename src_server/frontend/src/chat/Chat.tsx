import logo from './8589-screaming-cat.png';
import a from './talking_cat_d.jpeg';
import b from './talking_cat_ab.jpeg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import { useLocation } from "react-router-dom";
import axios from '../axios';
import { resolve } from 'path';

interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number};
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

interface UserName {
	username:	string;
	password:	string;
}

interface NewChat {
	chatname:	string;
	creator:	string;
}

interface newUser {
	username:	string;
	admin:		string;
}

let	chat_index:		number			= 0;
let messages_input:	message_stamp[]	= [];
let	chats_input:	chat_stamp[]	= [];
let users_input:	user_stamp[]	= [];

let user: {name: string, password: string, count: number} = {
	name: 'Jojo',
	password: '',
	count: 0
};

let chat_name:		string	= "";
let	input_var:		string	= "";
let switchy_var:	number	= 0;
let loaded_var:		boolean	= false;
let reload_var:		boolean = true;
let	loading:		boolean = false;
let	reloading:		boolean = false;
let loaded:			boolean = false;
let nth_reload: 	number	= 0;

const Chat: React.FC = () =>  {
	const state = useLocation().state as {username: string};

	if (state)
		user.name = state.username;
	else
		user.name = "not_logged_in";
	console.log("Logged in as: " + user.name);

	const [switchy_state, setSwitch]	= useState(switchy_var);
	const [input_state, setInput]		= useState(input_var);
	const [loaded_state, setLoaded]		= useState(loaded_var);
	const [reload_state, setReload]		= useState(reload_var);

	function ButtonGoToChats() {
		function handleClick() {
			chat_name = "";
			messages_input = [];
			setSwitch(0);
			setInput("");
			setLoaded(false);
			loaded = false;
			loading = false;
		}
		return (
			<button onClick={handleClick}>
				Go back to chats overview.
			</button>
		);
	}

	function ButtonGoToChat(button_chat_name: string, unread_: number, index: number) {
		function handleClick() {
			chat_index = index;
			chat_name = button_chat_name;
			console.log("log chat selected:" + button_chat_name + "==" + chats_input[chat_index].name_);
			setSwitch(1);
			setLoaded(false);
			loaded = false;
			loading = false;
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{unread_.toString()}
			</button>
		);
	}

	function ButtonGoToEditChat() {
		function handleClick() {
			console.log("Edit this chat:" + chat_name);
			setSwitch(2);
			setLoaded(false);
			loaded = false;
			loading = false;
		}
		return (
			<button onClick={handleClick}>
				Edit this chat: {chat_name}
			</button>
		);
	}

	function ButtonGoBackToChat() {
		function handleClick() {
			console.log("Going back to chat:" + chat_name);
			setSwitch(1);
			setLoaded(false);
			loaded = false;
			loading = false;
		}
		return (
			<button onClick={handleClick}>
				Go back to chat.
			</button>
		);
	}

	const addNewMessage = async (): Promise<boolean> => {
		try {
			console.log("Chat added:" + user.name + "_" + chat_name);
			const response = await axios.post('/messages/new_message', {username: user.name,  password: "why?", chatname: chat_name, message_: input_state, name_: user.name, user_: "App-message_" + user.name, timestamp: Date(), pic_: a});//, {
			console.log("Chat added:" + response.data.message);
			// setLoaded(false);
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

	function	handleSubmit1(event: any) { //any is bad practice
		if (input_state !== "")
			addNewMessage();
		setInput("");
		event.preventDefault();
	}

	const addNewUser = async (): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/add_user', {chatname: chat_name,  creator: user.name, add_user: input_state});//, {
			console.log("User added:" + response.data.message);
			// setLoaded(false);
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
	
	async function	addUser(event: any) {
		console.log("add user input is:" + input_state + ", chatname:" + chat_name);
		if (input_state !== "")
		{
			addNewUser();
			setInput("");
			event.preventDefault();
		}
	}

	const addNewChat = async (): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/new', {chatname: chat_name,  creator: user.name});//, {
			console.log("Chat added:" + response.data.message);
			// setLoaded(false);
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

	async function	addChat(event: any) {
		console.log("input is:" + input_state + ", chatname:" + chat_name);
		if (input_state !== "")
		{
			chat_name = input_state;
			addNewChat().then(x => {if (x) {setSwitch(1);} else {setSwitch(0);}});
			setInput("");
			event.preventDefault();
		}
	}

	//all timestamps are the same
	const getChats = async (): Promise<void> => {
		try {
			const response = await axios.post('/messages/get_chats', {username: user.name,  password: "why?"});
			console.log("response getChats:" + response.data.array);
			chats_input = response.data.array;
			setLoaded(true);
			loaded = true;
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
		loading = false;
	}

	const getUsers = async (): Promise<void> => {
		try {
			const response = await axios.post('/messages/get_users', {username: user.name,  password: "why?", chatname: chat_name});
			console.log("response getUsers:" + response.data.array);
			users_input = response.data.array;
			setLoaded(true);
			loaded = true;
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
		loading = false;
	}

	const getMessages = async (): Promise<void> => {
		try {
			console.log("Get this chat:" + chat_name);
			const response = await axios.post('/messages/get_messages', {username: user.name,  password: "why?", chatname: chat_name});
			console.log("response getMessages:" + response.data.array);
			messages_input = response.data.array;
			setLoaded(true);
			loaded = true;
		} catch (error: any) {
				alert(error.response?.data.message || 'Login failed');
		}
		loading = false;
	}

	// doesn't get removed between adjecant calls
	const	reload_call = async (): Promise<boolean> => {
		try {
			const response = await axios.post('messages/apply_for_update', {username: user.name,  password: "why?"});
			// console.log("reload" + response.data.notification);
			if (response.data.notification)
			{
				console.log("received reload");
				return (response.data.notification);//setReload(true);
			}
		}
		catch (error: any){
			alert("que passa?");
		}
		return (false);
	}

	async function	reload() {
		const rere = await reload_call();
		if (rere)
		{
			console.log("init reload" + nth_reload);
			nth_reload++;
			setReload(true);
			setLoaded(false);
			reloading = false;
			loading = false;
			loaded = false;
		}
		else
			reload();
	}

	
	if (reload_state && !reloading)
	{
		setReload(false);
		reloading = true;
		reload();
	}

	if (switchy_state === 0)
	{
		//load state lags
		if ((!loaded && !loading))
		{
			loading = true;
			getChats();
		}
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
					<input type="text" value={input_state} onChange={(e) => setInput(e.target.value)} />
					<input type="submit" value="Add chat" />
				</form>
				</header>
				<ol>
					{chats_jsx.map((chat_jsx : any) => <>{chat_jsx}</>)}
				</ol>
			</div>
		);
	}

	else if (switchy_state === 2)
	{
		if (!loaded && !loading)
		{
			loading = true;
			getUsers();
		}
		let	users_jsx : any = [];
		users_input.forEach(function (usery, index) {
			users_jsx.push(<li className={"App-chat_name"} key={index}>{usery.name_}</li>);
		});
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>Editing: {chat_name}</h2>
				<ButtonGoBackToChat/>
				<form onSubmit={addUser}>
					<input type="text" value={input_state} onChange={(e) => setInput(e.target.value)} />
					<input type="submit" value="Add user" />
				</form>
				</header>
				<ol>
					{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
				</ol>
			</div>
		);
	}

	else {
		if (!loaded && !loading)
		{
			loading = true;
			getMessages();
		}

		//Add all mesages to display list
		//get all viewable messages from server, similair things as getting all chats
		let	messages_jsx : any = [];
		messages_input.forEach(function (messagey, index) {
			if (messagey.name_ == user.name)
			{
				messages_jsx.push(<li className={"App-message_Jojo_user"} key={index}>{messagey.name_}</li>);
				messages_jsx.push(<img src={a} className={"App-message_Jojo_pic"}/>);
				messages_jsx.push(<li className={"App-message_Jojo"} key={index}>{messagey.message_}</li>);
				messages_jsx.push(<li className={"App-message_Jojo_timestamp"} key={index}>{messagey.timestamp}</li>);
			}
			else
			{
				messages_jsx.push(<li className={"App-message_someone_else_user"} key={index}>{messagey.name_}</li>);
				messages_jsx.push(<img src={b} className={"App-message_someone_else_pic"}/>);
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
				<h2>{chat_name}</h2>
				<ButtonGoToChats />
				<form onSubmit={handleSubmit1}>
					<input type="text" value={input_state} onChange={(e) => setInput(e.target.value)} />
					<input type="submit" value="Message" />
				</form>
				<ButtonGoToEditChat />
				</header>
				<ol>
					{messages_jsx.map((message_jsx : any) => <>{message_jsx}</>)}
				</ol>
			</div>
		);
	}
}

export default Chat;
