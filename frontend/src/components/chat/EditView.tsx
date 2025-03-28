import './App.css';
import React from 'react';
import { EditViewProps } from './Chat.interface';
import axios from '../../axios';
import { HeaderWrap } from "./Header";

export const GoBackToUserView = (	logged_in_user: UserStats,
	setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
	setSwitch: React.Dispatch<React.SetStateAction<number>>,
	input_field1:	React.MutableRefObject<string>,
	input_field2:	React.MutableRefObject<string>  ) => {
setSwitch(2);
setLoaded(false);
input_field1 = "";
input_field2 = "";
}

export const GoBackToFriendsView = (	logged_in_user: UserStats,
setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
setSwitch: React.Dispatch<React.SetStateAction<number>>,
input_field1:	React.MutableRefObject<string>,
input_field2:	React.MutableRefObject<string> ) => {
setSwitch(6);
setLoaded(false);
input_field1 = "";
input_field2 = "";
}

export const EditView: React.FC<EditViewProps> = ({ logged_in_user, setLoaded, setSwitch, requestedUserInfo, navigate, modal, invite, input_field1, input_field2 }) => {
	if (!logged_in_user.user)
		throw new Error("No user");

	function reload(): void
	{
		setLoaded(false);
	}

	function alert_setting(username: string, action: string, minutes:string): void
	{
		if (!minutes || minutes === "0")
			alert(username + " got un" + action + ".");
		else if (minutes === "-1")
			alert(username + " got " + action + " indefintely.");
		else
			alert(username + " got " + action + " for: " + minutes + " minutes.");
		reload();
	}

	const addMute = async (username: string, minutes: string): Promise<boolean> => {
		try {
			await axios.post('/api/messages/add_mute',
				{chatname: logged_in_user.chatname, add_user: username,  creator: logged_in_user.username, minutes: minutes});
			alert_setting(username, "muted", minutes);
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
			await axios.post('/api/messages/add_block',
				{add_user: username,  creator: logged_in_user.username, minutes: minutes});
			alert_setting(username, "blocked", minutes);
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
			await axios.post('/api/messages/remove_user',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: username});
			reload();
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
			await axios.post('/api/messages/add_admin',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: username});
			reload();
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

	const banUser = async (username: string): Promise<boolean> => {
		try {
			await axios.post('/api/messages/ban_user',
				{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: username});
			reload();
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

	// @mhaan handle to go to invite player for game. Invite can be pushed as an message?
	const  inviteforgame = async () => {
		const invited = await axios.post('/api/messages/invite_friend',
			{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: requestedUserInfo.username});
		// console.log("invited hwats happenibg is istr goerhf to shuret rhert e?", invited.data.d);
		if (logged_in_user && invited.data.invited)
		{
			setSwitch(9);
			navigate('/game', {state: {user: logged_in_user, requestedUser: requestedUserInfo} });
		}
	};

	const Unfriend = async (remove_user_name: string): Promise<boolean> => {
			try {
				await axios.post('/api/messages/remove_friend', //has to be added
					{chatname: logged_in_user.chatname,  creator: logged_in_user.username, add_user: remove_user_name});
				GoBackToFriendsView(logged_in_user, setLoaded, setSwitch, input_field1, input_field2);
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

	// console.log("friend_view:\n", logged_in_user.friend_view);
	const self_view : boolean = logged_in_user.selected_user === logged_in_user.username;

	const JSX_content = (
		<>
		<p>Viewing profile: {requestedUserInfo?.username || "user name not loaded"}</p>
		<h1>aka: {requestedUserInfo?.displayName || "display name not set loaded"}</h1>
		{requestedUserInfo?.imageName ? (
            <img
				src={"data:image/png;base64, " + requestedUserInfo.imageString} // Assuming the backend serves the avatar image, don't like this
              alt={requestedUserInfo.imageName}
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          ) : (
            <p>No avatar set</p>
          )}
		{!self_view && <button onClick={inviteforgame}>Invite for match, and wait in lobby till accepted.</button>}
		<h3>Mute or block: {logged_in_user.selected_user}</h3>
			<p>For amount of minutes. (-1 for indefinite, 0 to revoke block)</p>
			{!logged_in_user.friend_view && <button onClick={() => GoBackToUserView(logged_in_user, setLoaded, setSwitch, input_field1, input_field2)} className={"App-chat_name_button"}> Go to chat. </button>}
			{logged_in_user.friend_view && <button onClick={() => GoBackToFriendsView(logged_in_user, setLoaded, setSwitch, input_field1, input_field2)} className={"App-chat_name_button"}> Go to friends. </button>}
			<input
				type="number"
				placeholder="Enter minutes"
				ref={input_field1}
				onChange={(e) => input_field1.current.value=e.target.value}
			/>
			{!self_view && <button onClick={() => addBlock(logged_in_user.selected_user, input_field1.current.value)}> Block user. </button>}
			{!self_view && !logged_in_user.friend_view && logged_in_user.page_admin && <button onClick={() => addMute(logged_in_user.selected_user, input_field1.current.value)}> Mute user. </button>}
			{!self_view && !logged_in_user.friend_view && logged_in_user.page_admin && <button onClick={() => removeUser(logged_in_user.selected_user)}> Remove user. </button>}
			{!self_view && !logged_in_user.friend_view && logged_in_user.page_admin && <button onClick={() => addNewAdmin(logged_in_user.selected_user)}> Make admin. </button>}
			{!self_view && !logged_in_user.friend_view && logged_in_user.page_admin && <button onClick={() => banUser(logged_in_user.selected_user)}> Ban user. </button>}
			{!self_view && logged_in_user.friend_view && <button onClick={() => Unfriend(logged_in_user.selected_user)} className={"App-chat_name_button"}> Unfriend user. </button>} 
		</>
	)

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
		</div>
	); 
}
