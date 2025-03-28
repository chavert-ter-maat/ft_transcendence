import './App.css';
import React, {useRef} from 'react';
import axios from '../../axios';
import { UserStats, ChatOverviewProps, chat_stamp } from './Chat.interface';
import { HeaderWrap } from "./Header";
import { goToFriends } from './FriendsView';

interface ChatStamp_int {
	chatey:			chat_stamp;
	logged_in_user:	UserStats;
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
  }

function CHATSTAMP_RENDER({chatey, logged_in_user, setLoaded, setSwitch}: ChatStamp_int ): React.ReactElement {
	let buttonname: string = chatey.name_;
	// console.log(chatey.name_);
	if (chatey.DM)
		buttonname = chatey.name_.replace("_" + logged_in_user.username, "");
	return (
		<div>
			<li className={"App-chat_name"}>{buttonname}</li>
			<button onClick={() => GoToChat(logged_in_user, setLoaded, setSwitch, chatey.name_)} className={"App-chat_name_button"}> Go to </button>
			<li className={"App-chat_name_timestamp"}>{chatey.timestamp}</li>
		</div>
	);
}

interface	ChatStampList_int {
	chats:			chat_stamp[];
	logged_in_user:	UserStats;
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
}

function CHATSTAMP_LIST( {chats, logged_in_user, setLoaded, setSwitch} : ChatStampList_int ) {
	return (
		<section>
			<h2>{"All chats:"}</h2>
			{chats.map(chat =>
				<CHATSTAMP_RENDER key={chat.name_} chatey={chat} logged_in_user={logged_in_user} setLoaded={setLoaded} setSwitch={setSwitch}/>
			).reverse()}
		</section>
	);
}


export const addNewChat = async (	logged_in_user: UserStats, DM: boolean,
									setLoaded: React.Dispatch<React.SetStateAction<boolean>>): Promise<number> => {
	try {
		const response = await axios.post('/api/messages/new',
			{chatname: logged_in_user.chatname, creator: logged_in_user.username, password: logged_in_user.chat_password, DM:DM});
		if (DM)
			logged_in_user.chatname = response.data.message;
		setLoaded(false);
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

const GoToChat = (	logged_in_user: UserStats,
					setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
					setSwitch: React.Dispatch<React.SetStateAction<number>>,
					button_chat_name: string) => {
	logged_in_user.chatname = button_chat_name;
	setSwitch(1);
	logged_in_user.page_offset = 0;
	logged_in_user.page_admin = false;
	logged_in_user.page_creator = false;
	logged_in_user.end_reached = false;
	setLoaded(false);
}

export const ChatOverviewPage: React.FC<ChatOverviewProps> = ({ logged_in_user, chats_input, setLoaded, setSwitch, modal, invite, input_field1, input_field2 }) => {
	// const navigate = useNavigate();
	if (!logged_in_user.user)
		throw new Error("No user");

	async function	addChat(event: any) {
		if (input_field1.current.value !== "")
		{
			logged_in_user.chatname = input_field1.current.value;
			addNewChat(logged_in_user, false, setLoaded).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
			input_field1.current.value = "";
		}
		event.preventDefault();
	}

	async function	addDM(event: any) {
		if (input_field2.current.value !== "")
		{
			logged_in_user.chatname = input_field2.current.value;
			addNewChat(logged_in_user, true, setLoaded).then(x => {if (x === 1) {setSwitch(1);} else if (x === 2) {setSwitch(4)} else {setSwitch(0);}});
			input_field2.current.value = "";
		}
		event.preventDefault();
	}

	const handleGoBack = () => {
		setSwitch(9);
		window.history.back();
	  };

	const JSX_content = (
		<>
			<form onSubmit={addChat}>
			<input type="text" ref={input_field1} onChange={(e) => input_field1.current.value=e.target.value} />
			<input type="submit" value="Add chat" />
			</form>
			<form onSubmit={addDM}>
				<input type="text" ref={input_field2} onChange={(e) => input_field2.current.value=e.target.value} />
				<input type="submit" value="Add direct message to user" />
			</form>
		</>
	);

	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
			<button onClick={handleGoBack}>Go Back</button>
			<button onClick={() => goToFriends(logged_in_user, setLoaded, setSwitch)}> Go to friends. </button>
			<ol>
				<CHATSTAMP_LIST chats={chats_input} logged_in_user={logged_in_user} setSwitch={setSwitch} setLoaded={setLoaded}/>
			</ol>
		</div>
	);
}
