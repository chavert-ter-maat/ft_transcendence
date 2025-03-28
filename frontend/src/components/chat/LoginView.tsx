import './App.css';
import React from 'react';
import { LoginViewProps } from './Chat.interface';
import { GoToChatOverview } from './MessageView';
import { addNewChat } from './OverView';
import { HeaderWrap } from "./Header";

export const LoginView: React.FC<LoginViewProps> = ({ logged_in_user, messages_input, setLoaded, setSwitch, modal, invite, password_field }) => {
	if (!logged_in_user.user)
		throw new Error("No user");
	async function	LoginToChat(event: any) {
		logged_in_user.chat_password = password_field.current.value;
		password_field.current.value = "";
		addNewChat(logged_in_user, false).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
		event.preventDefault();
	}

	const JSX_content = (
		<>
			<h2>Log into: {logged_in_user.chatname}</h2>
			<button onClick={() => GoToChatOverview(logged_in_user, setLoaded, setSwitch, messages_input)} className={"App-chat_name_button"}> Go to chat overview. </button>
			<form onSubmit={LoginToChat}>
				<input type="password" placeholder="Enter password" ref={password_field} onChange={(e) => password_field.current.value=e.target.value} />
				<input type="submit" value="Login to chat." />
			</form>
		</>
	);

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
		</div>
	);
}