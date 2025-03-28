// import logo from './8589-screaming-cat.png';
import './App.css';
import React from 'react';
import axios from '../../axios';
import { UserStats, UsersViewProps, user_stamp } from './Chat.interface';
import { HeaderWrap } from "./Header";

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
		input_field1:	React.MutableRefObject<string>,
		password_field:	React.MutableRefObject<string>) => {
	setSwitch(1);
	setLoaded(false);
	input_field1 = "";
	password_field = "";
}

export const UsersView: React.FC<UsersViewProps> = ({ logged_in_user, users_input, setLoaded, setSwitch, modal, invite, input_field1, password_field }) => {
	if (!logged_in_user.user)
		throw new Error("No user");
	
	function USERSTAMP_RENDER({usery, logged_in_user}: UserStamp_int ): React.ReactElement {
		if (usery.name_ !== logged_in_user.username)
			return (
				<div>
					<li className={"App-chat_name"}>{usery.name_}</li>
					<button onClick={() => ButtonGoAddMuteOrBlock(usery.name_)} className={"App-chat_name_button"}> Go to user. </button>
				</div>
			)
		else
			return (
				<div>
					<li className={"App-chat_name"}>{usery.name_}</li>
					<button onClick={() => ButtonGoAddMuteOrBlock(usery.name_)} className={"App-chat_name_button"}> Go my own page. </button>
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
		logged_in_user.friend_view = false;
		setLoaded(false);
		setSwitch(5);
	}

	const makePublic = async (): Promise<boolean> => {
		try {
			await axios.post('/api/messages/make_public',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, password_chat: password_field.current.value});
				password_field.current.value = "";
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
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: input_field1.current.value});
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
			setLoaded(false);
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
		makePublic();
		event.preventDefault();
	}

	async function	addUser(event: any) {
		if (input_field1.current.value !== "")
		{
			addNewUser();
			input_field1.current.value = "";
		}
		event.preventDefault();
	}

	function LeaveChat() {
		leaveChat(logged_in_user.chatname);
		logged_in_user.chatname = "";
		// messages_input = []; might be needed
		setSwitch(0);
		input_field1.current.value = "";
		password_field.current.value = "";
		setLoaded(false);
	}

	const JSX_content = (
		<>
			<h2>Editing: {logged_in_user.chatname}</h2>
			<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input_field1, password_field)} className={"App-chat_name_button"}> Go to chat. </button>
			<button onClick={() => LeaveChat()}> Leave this chat. </button>
			{logged_in_user.page_admin && <form onSubmit={addUser}>
				<input type="text" placeholder="Enter username to add to chat" ref={input_field1} onChange={(e) => input_field1.current.value=e.target.value} />
				<input type="submit" value="Add user" />
			</form>}
			{(logged_in_user.page_creator && !logged_in_user.chatname.startsWith("DM"))&& <form onSubmit={setPublic}>
				<input type="password" placeholder="Enter password to chat" ref={password_field} onChange={(e) => password_field.current.value=e.target.value} />
				<input type="submit" value="Set public, with password." />
			</form>}
		</>
	);

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
			<ol>
				<USERSTAMP_LIST users={users_input} logged_in_user={logged_in_user}/>
			</ol>
		</div>
	);
}