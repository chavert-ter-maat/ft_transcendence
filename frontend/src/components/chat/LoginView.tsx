import './App.css';
import React from 'react';
import { LoginViewProps } from './Chat.interface';
import { GoToChatOverview } from './MessageView';
import { addNewChat } from './OverView';
import { HeaderWrap } from "./Header";

export const LoginView: React.FC<LoginViewProps> = ({ logged_in_user, messages_input, setLoaded, setSwitch, input1, password1 }) => {
	if (!logged_in_user.user)
		throw new Error("No user");
	async function	LoginToChat(event: any) {
		//console.log("log into selected:" + logged_in_user.chatname + "}_{" + logged_in_user.username);
		logged_in_user.chat_password = password1.state;
		addNewChat(logged_in_user, false).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
		event.preventDefault();
	}

	const JSX_content = (
		<>
			<h2>Log into: {logged_in_user.chatname}</h2>
			<button onClick={() => GoToChatOverview(logged_in_user, setLoaded, setSwitch, messages_input, input1.setState)} className={"App-chat_name_button"}> Go to chat overview. </button>
			<form onSubmit={LoginToChat}>
				<input type="password" placeholder="Enter password" value={password1.state} onChange={(e) => password1.setState(e.target.value)} />
				<input type="submit" value="Login to chat." />
			</form>
		</>
	);

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content}/>
		</div>
	);
}