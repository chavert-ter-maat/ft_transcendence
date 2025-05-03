import a from './talking_cat_d.jpeg';
import b from './talking_cat_ab.jpeg';
import './App.css';
import React, {useRef} from 'react';
import axios from '../../axios';
import { UserStats, MessagesViewProps, message_stamp } from './Chat.interface';
import { HeaderWrap } from "./Header";

export const GoToChatOverview = (	logged_in_user: UserStats,
		setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
		setSwitch: React.Dispatch<React.SetStateAction<number>>) => {
	logged_in_user.chatname = "";
	setSwitch(0);
	setLoaded(false);
}

interface MessageStamp_int { 
	messagey:		message_stamp;
	logged_in_user:	UserStats;
  }

function MESSAGE_RENDER({messagey, logged_in_user}: MessageStamp_int ): React.ReactElement {
	let	style:	string;
	let img:	string;

	if (logged_in_user.username === messagey.name_)
	{
		style = "App-message_Jojo";
		img = a;
	}
	else
	{
		style = "App-message_someone_else";
		img = b;
	}
	return (
		<div>
			<li className={style + "_user"}>{messagey.name_}</li>
			<img src={img} className={style +"_pic"} alt={""}/>
			<li className={style}>{messagey.message_}</li>
			<li className={style + "_timestamp"}>{messagey.timestamp}</li>
		</div>
	);
}

interface MessageList_int {
	messages:		message_stamp[];
	logged_in_user:	UserStats;
}

function MESSAGE_LIST( {messages, logged_in_user} : MessageList_int ) {
	return (
		<section>
			<h2>{"All messages:"}</h2>
			{messages.map(message =>
				<MESSAGE_RENDER key={message.key_} messagey={message} logged_in_user={logged_in_user} />
			).reverse()}
		</section>
	);
}

export const MessagesView: React.FC<MessagesViewProps> = ({ logged_in_user, messages_input, setLoaded, setSwitch, modal, invite, input_field1 }) => {
	if (!logged_in_user.user)
		throw new Error("No user");
	
	const addNewMessage = async (): Promise<boolean> => {
		try {
			await axios.post('/api/messages/new_message',
				{username: logged_in_user.username,  password: logged_in_user.chat_password, chatname: logged_in_user.chatname,
					message_: input_field1.current.value, name_: logged_in_user.username,
					user_: "App-message_" + logged_in_user.username, timestamp: Date(), pic_: "a", key_: 0});
			return true;
		} catch (err: any) {
			if (!err?.response) {
				console.log('No server response.');
			} else if (err.response?.status === 409) {
				console.log('Chat exists, please login.');
			} else {
				console.log('This is a private chat.');
			}
			return false;
		}
	}

	function	enterOnMessage(event: any) {
		if (input_field1.current.value !== "")
			addNewMessage();
		input_field1.current.value = "";
		event.preventDefault();
	}

	function GoToPrevPage() {
		setLoaded(false);
		if (logged_in_user.page_offset > 0)
		{
			logged_in_user.page_offset -= 20;
			logged_in_user.end_reached = false;
		}
	}

	function GoToNextPage() {
		setLoaded(false);
		if (!logged_in_user.end_reached)
			logged_in_user.page_offset += 20;
	}

	function GoToEditChat() {
		setSwitch(2);
		setLoaded(false);
		input_field1.current.value = "";
	}

	const JSX_content = (
		<>
			<h2>{logged_in_user.chatname}</h2>
			<button onClick={() => GoToChatOverview(logged_in_user, setLoaded, setSwitch, messages_input)} className={"App-chat_name_button"}> Go to chat overview. </button>
			<form onSubmit={enterOnMessage}>
			<input type="text" ref={input_field1} onChange={(e) => input_field1.current.value=e.target.value} />
			<input type="submit" value="Message" />
			</form>
			<button onClick={() => GoToPrevPage()}> Go to previous page. </button>
			<button onClick={() => GoToEditChat()}> Edit this chat: {logged_in_user.chatname}. </button>
			<button onClick={() => GoToNextPage()}> Go to next page. </button>
		</>
	);

	return (
		<div className="App">
		<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
		<ol>
				<MESSAGE_LIST messages={messages_input} logged_in_user={logged_in_user}/>
			</ol>
		</div>
	);
}