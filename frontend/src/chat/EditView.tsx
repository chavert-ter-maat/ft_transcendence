import logo from './8589-screaming-cat.png';
import './App.css';
import React from 'react';
import { EditViewProps } from './Chat.interface';
import axios from '../axios';
import { GoBackToChat } from './UsersView';
import { HeaderWrap } from "./Header";
// import { useNavigate } from 'react-router-dom';

export const EditView: React.FC<EditViewProps> = ({ logged_in_user, setLoaded, setSwitch, requestedUserInfo, navigate, input1, password1 }) => {
	if (!logged_in_user.user)
		throw new Error("No user");

	function reload(): void
	{
		setLoaded(false);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
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
			//console.log("Mute added:" + response.data.message);
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
			//console.log("Mute added:" + response.data.message);
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
			//console.log("User removed:" + response.data.message);
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
			//console.log("Admin added:" + response.data.message);
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
			//console.log("User banned:" + response.data.message);
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
	const inviteforgame = () => {
		if (logged_in_user)
			navigate('/game', {state: {user: logged_in_user, requestedUser: requestedUserInfo} });
	};

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
		<button onClick={inviteforgame}>Go to game.</button>
		<h3>Mute or block: {logged_in_user.selected_user}</h3>
			<p>For amount of minutes. (-1 for indefinite, 0 to revoke block)</p>
			<button onClick={() => GoBackToChat(logged_in_user, setLoaded, setSwitch, input1.setState, password1.setState)} className={"App-chat_name_button"}> Go to chat. </button>
			<input
				type="number"
				placeholder="Enter minutes"
				value={input1.state}
				onChange={(e) => input1.setState(e.target.value)}
			/>
			<button onClick={() => addBlock(logged_in_user.selected_user, input1.state)}> Block user. </button>
			{logged_in_user.page_admin && <button onClick={() => addMute(logged_in_user.selected_user, input1.state)}> Mute user. </button>}
			{logged_in_user.page_admin && <button onClick={() => removeUser(logged_in_user.selected_user)}> Remove user. </button>}
			{logged_in_user.page_admin && <button onClick={() => addNewAdmin(logged_in_user.selected_user)}> Make admin. </button>}
			{logged_in_user.page_admin && <button onClick={() => banUser(logged_in_user.selected_user)}> Ban user. </button>}
		</>
	)

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content}/>
		</div>
	); 
}
