import logo from './8589-screaming-cat.png';
import a from './talking_cat_d.jpeg';
import b from './talking_cat_ab.jpeg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from '../axios';

interface message_stamp	{ message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface chat_stamp	{ name_: string, unread_: number, timestamp: string, users: string[], index: number, DM: boolean};
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
let	input_var2:		string	= "";
let password_var:	string	= "";
let sel_user_var:	string	= "";
let minutes_var:	string	= "";
let switchy_var:	number	= 0;
let loaded_var:		boolean	= false;
let reload_var:		boolean = true;
let	loading:		boolean = false;
let	reloading:		boolean = false;
let loaded:			boolean = false;
let nth_reload: 	number	= 0;
let	offset:			number	= 0;
let end_reached:	boolean	= false;
let admin_of_page:	boolean = false;
let creator_of_page:	boolean = false;

const Chat: React.FC = () =>  {
	const state = useLocation().state as {username: string};

	if (state)
		user.name = state.username;
	else
		user.name = "not_logged_in";
	console.log("Logged in as: " + user.name);

	const [switchy_state, setSwitch]	= useState(switchy_var);
	const [input_state, setInput]		= useState(input_var);
	const [input_state2, setInput2]		= useState(input_var2);
	const [loaded_state, setLoaded]		= useState(loaded_var);
	const [reload_state, setReload]		= useState(reload_var);
	const [password_state, setPassword]	= useState(password_var);
	const [sel_user_state, setSelUser]	= useState(sel_user_var);
	const [minutes_state, setMinutes]	= useState(minutes_var);

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

	function ButtonLeaveChat() {
		function handleClick() {
			leaveChat(chat_name);
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
				Leave chat.
			</button>
		);
	}

	function ButtonGoToChat(button_chat_name: string, unread_: number, index: number) {
		function handleClick() {
			chat_index = index;
			chat_name = button_chat_name;
			console.log("log chat selected:" + button_chat_name + "==" + chats_input[chat_index].name_);
			setSwitch(1);
			offset = 0;
			admin_of_page = false;
			creator_of_page = false;
			end_reached = false;
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

	function ButtonGoAddAdmin() {
		function handleClick() {
			addNewAdmin(sel_user_state);
			console.log("add as admin:" + sel_user_state);
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{"add as admin."}
			</button>
		);
	}

	function ButtonGoAddMuteOrBlock(username: string, index: number) {
		function handleClick() {
			setSelUser(username);
			setSwitch(5);
			console.log("add as mute or block:" + username + "==" + users_input[index].name_);
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{"Edit user."}
			</button>
		);
	}

	function ButtonMuteUser() {
		function handleClick() {
			addMute(sel_user_state, minutes_state);
			console.log("add mute:" + sel_user_state + " for: " + minutes_state);
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{"Mute."}
			</button>
		);
	}

	function ButtonBlockUser() {
		function handleClick() {
			addBlock(sel_user_state, minutes_state);
			console.log("add block:" + sel_user_state + " for: " + minutes_state);
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{"Block."}
			</button>
		);
	}

	function ButtonRemoveUser() {
		function handleClick() {
			removeUser(sel_user_state);
			console.log("remove user:" + sel_user_state);
		}
		return (
			<button onClick={handleClick} className={"App-chat_name_button"}>
				{"Kick."}
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

	function ButtonGoToPrevPage() {
		function handleClick() {
			console.log("Previous page:" + chat_name);
			setLoaded(false);
			loaded = false;
			loading = false;
			if (offset > 0)
			{
				offset -= 20;
				end_reached = false;
			}
		}
		return (
			<button onClick={handleClick}>
				Go to previous page.
			</button>
		);
	}

	function ButtonGoToNextPage() {
		function handleClick() {
			console.log("Next page:" + chat_name);
			setLoaded(false);
			loaded = false;
			loading = false;
			if (!end_reached)
				offset += 20;
		}
		return (
			<button onClick={handleClick}>
				Go to next page.
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
			const response = await axios.post('/messages/new_message',
				{username: user.name,  password: password_state, chatname: chat_name,
					message_: input_state, name_: user.name,
					user_: "App-message_" + user.name, timestamp: Date(), pic_: "a"});
			console.log("Chat added:" + response.data.message);
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

	const leaveChat = async (chatname_leaving: string): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/leave_chat',
				{chatname: chatname_leaving,  username: user.name, password: user.password});
			console.log("Chat left:" + response.data.message);
			setLoaded(false);
			loaded = false;
			loading = false;
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

	const addNewAdmin = async (username: string): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/add_admin',
				{chatname: chat_name,  creator: user.name, add_user: username});
			console.log("Admin added:" + response.data.message);
			setLoaded(false);
			loaded = false;
			loading = false;
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

	const addMute = async (username: string, minutes: string): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/add_mute',
				{chatname: chat_name, add_user: username,  creator: user.name, minutes: minutes});
			console.log("Mute added:" + response.data.message);
			if (!minutes)
				alert(username + " got unmuted.");
			else if (minutes == "-1")
				alert(username + " got muted indefintely.");
			else
				alert(username + " got muted for: " + minutes + " minutes.");
			setLoaded(false);
			loaded = false;
			loading = false;
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

	const addBlock = async (username: string, minutes: string): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/add_block',
				{add_user: username,  creator: user.name, minutes: minutes});
			console.log("Mute added:" + response.data.message);
			if (!minutes)
				alert(username + " got unblocked.");
			else if (minutes == "-1")
				alert(username + " got blocked indefintely.");
			else
				alert(username + " got blocked for: " + minutes + " minutes.");
			setLoaded(false);
			loaded = false;
			loading = false;
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

	const removeUser = async (username: string): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/remove_user',
				{chatname: chat_name,  creator: user.name, add_user: username});
			console.log("User removed:" + response.data.message);
			setLoaded(false);
			loaded = false;
			loading = false;
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

	const addNewUser = async (): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/add_user',
				{chatname: chat_name,  creator: user.name, add_user: input_state});
			console.log("User added:" + response.data.message);
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

	const makePublic = async (): Promise<boolean> => {
		try {
			const response = await axios.post('/messages/make_public',
				{chatname: chat_name,  creator: user.name, password_chat: password_state});
			console.log("Password setted:" + response.data.message);
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

	async function	LoginToChat(event: any) {
		console.log("log into selected:" + chat_name + "}_{" + user.name);
		addNewChat(password_state, false).then(x => {if (x == 1) {setSwitch(1);} else if (x == 2) {setSwitch(4)} else {setSwitch(0);}});
		event.preventDefault();
	}
	
	async function	addUser(event: any) {
		console.log("add user input is:" + input_state + ", chatname:" + chat_name);
		if (input_state !== "")
		{
			addNewUser();
			setInput("");
		}
		event.preventDefault();
	}

	async function	setPublic(event: any) {
		console.log("Publicize:" + input_state + ", chatname:" + chat_name);
		makePublic();
		event.preventDefault();
	}

	const addNewChat = async (password: string, DM: boolean): Promise<number> => {
		try {
			const response = await axios.post('/messages/new',
				{chatname: chat_name, creator: user.name, password: password, DM:DM});
			if (DM)
				chat_name = response.data.message;
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

	async function	addChat(event: any) {
		console.log("input is:" + input_state + ", chatname:" + chat_name);
		if (input_state !== "")
		{
			chat_name = input_state;
			addNewChat("", false).then(x => {if (x == 1) {setSwitch(1);} else if (x == 2) {setSwitch(4)} else {setSwitch(0);}});
			setInput("");
		}
		event.preventDefault();
	}

	async function	addDM(event: any) {
		console.log("DM input is:" + input_state2 + ", chatname:" + chat_name);
		if (input_state2 !== "")
		{
			chat_name = input_state2;
			addNewChat("", true).then(x => {if (x == 1) {setSwitch(1);} else if (x == 2) {setSwitch(4)} else {setSwitch(0);}});
			setInput2("");
		}
		event.preventDefault();
	}

	//all timestamps are the same
	const getChats = async (): Promise<void> => {
		try {
			const response = await axios.post('/messages/get_chats',
				{username: user.name,  password: "why?"});
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
			const response = await axios.post('/messages/get_users',
				{username: user.name,  password: password_state, chatname: chat_name});
			console.log("response getUsers:" + response.data.array);
			users_input = response.data.array;
			admin_of_page = response.data.admin_;
			creator_of_page = response.data.creator_;
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
			const response = await axios.post('/messages/get_messages',
				{username: user.name,  password: password_state, chatname: chat_name, offset: offset});
			console.log("response getMessages:" + response.data.array);
			messages_input = response.data.array;
			if (!messages_input.length && offset > 0)
			{
				console.log("limiting offset" + offset);
				end_reached = true;//offset -= 20;
			}
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
			const response = await axios.post('messages/apply_for_update',
				{username: user.name,  password: "why?", chatname: chat_name});
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
			let buttonname: string = chatey.name_;
			if (chatey.DM)
				buttonname = chatey.name_.replace("_" + user.name, ""); // might be buggy if _ is allowed in username
			chats_jsx.push(<li className={"App-chat_name"} key={index}>{buttonname}</li>);
			chats_jsx.push(ButtonGoToChat(chatey.name_, chatey.unread_, index));
			chats_jsx.push(<li className={"App-chat_name_timestamp"} key={index}>{chatey.timestamp}</li>);
		});
		chats_input.reverse();
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>{user.name}</h2>
				<form onSubmit={addChat}>
					<input type="text" value={input_state} onChange={(e) => setInput(e.target.value)} />
					<input type="submit" value="Add chat" />
				</form>
				<form onSubmit={addDM}>
					<input type="text" value={input_state2} onChange={(e) => setInput2(e.target.value)} />
					<input type="submit" value="Add direct message to user" />
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
			if (usery.name_ != user.name)
				users_jsx.push(ButtonGoAddMuteOrBlock(usery.name_, index));
		});
		if (creator_of_page && admin_of_page)
			{
				return (
					<div className="App">
						<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h2>Editing: {chat_name}</h2>
						<ButtonGoBackToChat/>
						<ButtonLeaveChat/>
						<form onSubmit={addUser}>
							<input type="text" placeholder="Enter username" value={input_state} onChange={(e) => setInput(e.target.value)} />
							<input type="submit" value="Add user" />
						</form>
						<form onSubmit={setPublic}>
							<input type="password" placeholder="Enter password" value={password_state} onChange={(e) => setPassword(e.target.value)} />
							<input type="submit" value="Set public, with password." />
						</form>
						</header>
						<ol>
							{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
						</ol>
					</div>
				);
			}
		if (admin_of_page)
		{
			return (
				<div className="App">
					<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Editing: {chat_name}</h2>
					<ButtonGoBackToChat/>
					<ButtonLeaveChat/>
					<form onSubmit={addUser}>
						<input type="text" placeholder="Enter username" value={input_state} onChange={(e) => setInput(e.target.value)} />
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
					<h2>Editing: {chat_name}</h2>
					<ButtonGoBackToChat/>
					<ButtonLeaveChat/>
					</header>
					<ol>
						{users_jsx.map((user_jsx : any) => <>{user_jsx}</>)}
					</ol>
				</div>
			);
		}
	}

	else if (switchy_state === 4)
	{
		return (
			<div className="App">
				<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h2>Log into: {chat_name}</h2>
				<ButtonGoToChats/>
				<form onSubmit={LoginToChat}>
					<input type="password" placeholder="Enter password" value={password_state} onChange={(e) => setPassword(e.target.value)} />
					<input type="submit" value="Login to chat." />
				</form>
				</header>
			</div>
		);
	}

	else if (switchy_state === 5)
		{
			if (admin_of_page)
				{
				return (
					<div className="App">
						<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h2>Mute or block: {sel_user_state}</h2>
						<p>For amount of minutes. (-1 for indefinite, 0 to revoke block)</p>
						<ButtonGoBackToChat/>
						<input
							type="number"
							placeholder="Enter minutes"
							value={minutes_state}
							onChange={(e) => setMinutes(e.target.value)}
						/>
						<ButtonMuteUser/>
						<ButtonBlockUser/>
						<ButtonRemoveUser/>
						<ButtonGoAddAdmin/>
						</header>
					</div>
				);
			}
			else
			{
				return (
					<div className="App">
						<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h2>Mute or block: {sel_user_state}</h2>
						<p>For amount of minutes. (-1 for indefinite, 0 to revoke block)</p>
						<ButtonGoBackToChat/>
						<input
							type="number"
							placeholder="Enter minutes"
							value={minutes_state}
							onChange={(e) => setMinutes(e.target.value)}
						/>
						<ButtonBlockUser/>
						</header>
					</div>
				);
			}
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
				<ButtonGoToPrevPage />
				<ButtonGoToEditChat />
				<ButtonGoToNextPage />
				</header>
				<ol>
					{messages_jsx.map((message_jsx : any) => <>{message_jsx}</>)}
				</ol>
			</div>
		);
	}
}

export default Chat;
