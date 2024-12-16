import './App.css';
import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import axios from '../axios';
import { message_stamp, chat_stamp, user_stamp, UserStats } from './Chat.interface';
import { ChatOverviewPage } from './OverView';
import { MessagesView } from './MessageView';
import { UsersView } from './UsersView';
import { LoginView } from './LoginView';
import { EditView } from './EditView';

let messages_input:	message_stamp[]	= [];
let	chats_input:	chat_stamp[]	= [];
let users_input:	user_stamp[]	= [];

let logged_in_user: UserStats = {
	username:		"",
	password:		"",
	chatname:		"",
	chat_password:	"",
	state:			0,
	loaded:			false,
	loading:		false,
	page_offset:	0,
	end_reached:	false,
	page_admin:		false,
	page_creator:	false,
	selected_user:	""
}

let	input_var:		string	= "";
let	input_var2:		string	= "";
let password_var:	string	= "";
let switchy_var:	number	= 0;
let loaded_var:		boolean	= false;
let reload_var:		boolean = true;
let	reloading:		boolean = false;
let	just_started:	boolean = true;

const Chat: React.FC = () =>  {
	const state = useLocation().state as {username: string};

	if (state)
		logged_in_user.username = state.username;
	else
		logged_in_user.username = "not_logged_in";
	//console.log("Logged in as: " + logged_in_user.username);

	const [switchy_state, setSwitch]	= useState(switchy_var);
	const [input_state, setInput]		= useState(input_var);
	const [input_state2, setInput2]		= useState(input_var2);
	const [, setLoaded]					= useState(loaded_var);
	const [reload_state, setReload]		= useState(reload_var);
	const [password_state, setPassword]	= useState(password_var);

	if (just_started)
	{
		just_started = false;
		setLoaded(false);
	}

	//console.log("With states: " + logged_in_user.username + " state:" + switchy_state + " userstats: " + logged_in_user);

	//all timestamps are the same
	const getChats = async (): Promise<void> => {
		try {
			const response = await axios.post('/messages/get_chats',
				{username: logged_in_user.username,  password: "why?"});
			//console.log("response getChats:" + response.data.array);
			chats_input = response.data.array;
			setLoaded(true);
			logged_in_user.loaded = true;
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
		logged_in_user.loading = false;
	}

	const getUsers = async (): Promise<void> => {
		try {
			const response = await axios.post('/messages/get_users',
				{username: logged_in_user.username,  password: password_state, chatname: logged_in_user.chatname});
			//console.log("response getUsers:" + response.data.array);
			users_input = response.data.array;
			logged_in_user.page_admin = response.data.admin_;
			logged_in_user.page_creator = response.data.creator_;
			setLoaded(true);
			logged_in_user.loaded = true;
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
		logged_in_user.loading = false;
	}

	const getMessages = async (): Promise<void> => {
		try {
			//console.log("Get this chat:" + logged_in_user.chatname);
			const response = await axios.post('/messages/get_messages',
				{username: logged_in_user.username,  password: password_state, chatname: logged_in_user.chatname, offset: logged_in_user.page_offset});
			//console.log("response getMessages:" + response.data.array);
			messages_input = response.data.array;
			if (!messages_input.length && logged_in_user.page_offset > 0)
			{
				//console.log("limiting offset" + logged_in_user.page_offset);
				logged_in_user.end_reached = true;//offset -= 20;
			}
			setLoaded(true);
			logged_in_user.loaded = true;
		} catch (error: any) {
				alert(error.response?.data.message || 'Login failed');
		}
		logged_in_user.loading = false;
	}

	// doesn't get removed between adjecant calls
	const	reload_call = async (): Promise<boolean> => {
		try {
			const response = await axios.post('messages/apply_for_update',
				{username: logged_in_user.username,  password: "why?", chatname: logged_in_user.chatname});
			if (response.data.notification)
			{
				//console.log("received reload");
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
			setReload(true);
			setLoaded(false);
			reloading = false;
			logged_in_user.loading = false;
			logged_in_user.loaded = false;
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

	// overview
	if (switchy_state === 0)
	{
		//load state lags
		if ((!logged_in_user.loaded && !logged_in_user.loading))
		{
			logged_in_user.loading = true;
			getChats();
		}
		return (ChatOverviewPage({
			logged_in_user, chats_input, setLoaded, setSwitch,
			input1: {state: input_state, setState: setInput},
			input2: {state: input_state2, setState: setInput2}
		}));
	}

	// message view
	else if (switchy_state === 1){
		if (!logged_in_user.loaded && !logged_in_user.loading)
		{
			logged_in_user.loading = true;
			getMessages();
		}
		return (MessagesView({
			logged_in_user, messages_input, setLoaded, setSwitch,
			input1: {state: input_state, setState: setInput}
		}))
	}

	//edit chat
	else if (switchy_state === 2)
	{
		if (!logged_in_user.loaded && !logged_in_user.loading)
		{
			logged_in_user.loading = true;
			getUsers();
		}
		return (UsersView({
			logged_in_user, users_input, setLoaded, setSwitch,
			input1: {state: input_state, setState: setInput},
			password1: {state: password_state, setState: setPassword}
		}))
	}

	//login view
	else if (switchy_state === 4)
	{
		return (LoginView({
			logged_in_user, messages_input, setLoaded, setSwitch,
			input1: {state: input_state, setState: setInput},
			password1: {state: password_state, setState: setPassword}
		}))
	}

	//edit user
	else
	{
		return(EditView({
			logged_in_user, setLoaded, setSwitch,
			input1: {state: input_state, setState: setInput},
			password1: {state: password_state, setState: setPassword}
		}))
	}
}

export default Chat;
