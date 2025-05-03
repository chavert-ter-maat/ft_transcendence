import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from '../../axios';
import { message_stamp, chat_stamp, user_stamp, UserStats, friend_stamp } from './Chat.interface';
import { ChatOverviewPage } from './OverView';
import { MessagesView } from './MessageView';
import { UsersView } from './UsersView';
import { FriendsView } from './FriendsView';
import { LoginView } from './LoginView';
import { EditView } from './EditView';
import { User } from '../../global.interface';

let messages_input:	message_stamp[]	= [];
let	chats_input:	chat_stamp[]	= [];
let users_input:	user_stamp[]	= [];
let friends_input:	friend_stamp[]	= [];
let	requestedUserInfo:	User;

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
	selected_user:	"",
	invited_by:		"",
	invited:		false,
}

let switchy_var:	number	= 0;
let loaded_var:		boolean	= false;
let update_var:		boolean	= false;
let request_var:	boolean	= true;
let invite_modal:	boolean = false;
let invite_accept:	boolean = false;

const Chat: React.FC = () =>  {
	const state = useLocation().state as {user: User};
	const navigate = useNavigate();

	const [switchy_state, setSwitch]	= useState(switchy_var);
	const [loaded_state, setLoaded]					= useState(loaded_var);
	const [update_state, setUpdate]					= useState(update_var);
	const [request_state, setRequest]				= useState(request_var);
	const [inviteModalOpen, inviteModalSet]	= useState(invite_modal);
	const [inviteAccept, inviteAcceptSet]	= useState(invite_accept);

	const input_field1 = useRef<string>("");
	const input_field2 = useRef<string>("");
	const password_field = useRef<string>("");

	const	reload_call = async (): Promise<boolean> => {
		try {
			const response = await axios.post('/api/messages/apply_for_update',
				{username: logged_in_user.username,  password: "why?", chatname: logged_in_user.chatname});
			if (response.data.notification)
			{
				if (response.data.invite)
				{
					const responseInfo = await axios.post('/api/auth/userInfoSomeoneElse',
						{requestedUser: response.data.invite});
					requestedUserInfo = responseInfo.data;
					logged_in_user.invited_by = requestedUserInfo.username;
					logged_in_user.invited = true;
					inviteModalSet(true);
				}
				return (response.data.notification);
			}
		}
		catch (error: any){
			alert("que passa?");
		}
		return (false);
	}
	
	const getChats = async (): Promise<void> => {
		try {
			const response = await axios.post('/api/messages/get_chats',
				{username: logged_in_user.username,  password: "why?"});
			chats_input = response.data.array;
			setLoaded(true);
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
	}

	const getFriends = async (): Promise<void> => {
		try {
			const response = await axios.post('/api/messages/get_friends',
				{username: logged_in_user.username,  password: "", chatname: logged_in_user.chatname});
			friends_input = response.data.array_;
			setLoaded(true);
		} catch (error: any) {
			alert(error.response?.data.message || 'Login failed');
		}
	}

	const getMessages = async (): Promise<void> => {
		try {
			const response = await axios.post('/api/messages/get_messages',
				{username: logged_in_user.username,  password: "", chatname: logged_in_user.chatname, offset: logged_in_user.page_offset});
			messages_input = response.data.array;
			if (!messages_input.length && logged_in_user.page_offset > 0)
				logged_in_user.end_reached = true;
			setLoaded(true);
		} catch (error: any) {
				alert(error.response?.data.message || 'Login failed');
		}
	}

	const getRequestedUser = async (): Promise<void> => {
		try {
			const response = await axios.post('/api/auth/userInfoSomeoneElse',
				{requestedUser: logged_in_user.selected_user});
			requestedUserInfo = response.data;
			setLoaded(true);
		} catch (error: any) {
				alert(error.response?.data.message || 'Login failed');
		}
	}

	const getUsers = async (): Promise<void> => {
		try {
			const response = await axios.post('/api/messages/get_users',
				{username: logged_in_user.username, chatname: logged_in_user.chatname, password: ""});
			users_input = response.data.array;
			logged_in_user.page_admin = response.data.admin_;
			logged_in_user.page_creator = response.data.creator_;
			setLoaded(true);
		} catch (error: any) {
			console.log("Error in getting users");
		}
		logged_in_user.loading = false;
	}

	if (state)
		{
			logged_in_user.username = state.user.username;
			logged_in_user.user = state.user;
		}
		if (!logged_in_user.user)
			throw new Error("No user");
	
		if (inviteAccept)
		{
			navigate('/game', {state: {user: logged_in_user, requestedUser: requestedUserInfo} });
		}
	
		useEffect(() => {
			const id: number = Math.random();
			const updateData = async () => {
				const rere = await reload_call();
				if (rere)
				{
					setUpdate(true);
					setLoaded(false);
				}
				if (inviteAccept)
				{
					inviteAcceptSet(false);
					setSwitch(9);
				}
			}
			if (request_state)
			{
				const interval = setInterval(updateData, 1000);
				return () => {clearInterval(interval);}
			}
		}, [request_state])
	
		if (switchy_state === 1) {
			useEffect(() => {
				console.log('Message page');
				setUpdate(false);
				getMessages();
			}, [switchy_state, loaded_state, update_state]);
			return (MessagesView({
				logged_in_user, messages_input, setLoaded, setSwitch,
				modal:	{state: inviteModalOpen, setState: inviteModalSet},
				invite:	{state: inviteAccept, setState: inviteAcceptSet},
				input_field1
			}))
		} else if (switchy_state === 2){
			useEffect(() => {
				console.log('Users overview page');
				setUpdate(false);
				getUsers();
			}, [switchy_state, loaded_state, update_state]);
			return (UsersView({
				logged_in_user, users_input, setLoaded, setSwitch,
				modal:	{state: inviteModalOpen, setState: inviteModalSet},
				invite:	{state: inviteAccept, setState: inviteAcceptSet},
				input_field1, password_field
			}))
		} else if (switchy_state === 4){
			useEffect(() => {
				console.log('Login page');
				setUpdate(false);
			}, [switchy_state, loaded_state, update_state]);
			return (LoginView({
					logged_in_user, messages_input, setLoaded, setSwitch,
					modal:	{state: inviteModalOpen, setState: inviteModalSet},
					invite:	{state: inviteAccept, setState: inviteAcceptSet},
					input_field1, password_field
				}))
		} else if (switchy_state === 5){
			useEffect(() => {
				console.log('User page');
				setUpdate(false);
				getRequestedUser();
			}, [switchy_state, loaded_state, update_state]);
			return(EditView({
				logged_in_user, setLoaded, setSwitch, requestedUserInfo, navigate,
				modal:	{state: inviteModalOpen, setState: inviteModalSet},
				invite:	{state: inviteAccept, setState: inviteAcceptSet},
				input_field1, input_field2
			}))
		} else if (switchy_state === 6) {
			useEffect(() => {
				console.log('Friends page');
				setUpdate(false);
				getFriends();
			}, [switchy_state, loaded_state, update_state]);
			return (FriendsView({
				logged_in_user, friends_input, setLoaded, setSwitch,
				modal:	{state: inviteModalOpen, setState: inviteModalSet},
				invite:	{state: inviteAccept, setState: inviteAcceptSet},
				input_field1
			}))
		} else {
			useEffect(() => {
				console.log('Overview page');
				setUpdate(false);
				getChats();
			}, [switchy_state, loaded_state, update_state]);
			return (ChatOverviewPage({
				logged_in_user, chats_input, setLoaded, setSwitch,
				modal:	{state: inviteModalOpen, setState: inviteModalSet},
				invite:	{state: inviteAccept, setState: inviteAcceptSet},
				input_field1, input_field2
			}));
		}
}

export default Chat;
