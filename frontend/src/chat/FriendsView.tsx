import logo from './8589-screaming-cat.png';
import './App.css';
import React, {useRef} from 'react';
import axios from '../axios';
import { UserStats, friend_stamp, FriendsViewProps } from './Chat.interface';
import { HeaderWrap } from "./Header";
import { GoToChatOverview } from './MessageView';

interface FriendStamp_int {
	usery:			friend_stamp;
	logged_in_user:	UserStats;
  }

// interface	UserStampList_int {
// 	users:			user_stamp[];
// 	logged_in_user:	UserStats;
// }

interface	FriendStampList_int {
	users:			friend_stamp[];
	logged_in_user:	UserStats;
}

// duplicated from MessageView
export const goToFriends = (	logged_in_user: UserStats,
		setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
		setSwitch: React.Dispatch<React.SetStateAction<number>>) => {
	logged_in_user.chatname = "";
	setSwitch(6);
	setLoaded(false);
}

export const FriendsView: React.FC<FriendsViewProps> = ({ logged_in_user, friends_input, setLoaded, setSwitch, modal, invite, input_field1 }) => {
	if (!logged_in_user.user)
		throw new Error("No user");
	
	function FRIENDSTAMP_RENDER({usery, logged_in_user}: FriendStamp_int ): React.ReactElement {
		if (usery.stamp_.name_ !== logged_in_user.username)
			return (
				<div>
					<li className={"App-chat_name"}>{usery.stamp_.name_ + " : " + usery.status}</li>
					<button onClick={() => ButtonGoAddMuteOrBlock(usery.stamp_.name_)} className={"App-chat_name_button"}> Go to user. </button>
					{/* <button onClick={() => Unfriend(usery.name_)} className={"App-chat_name_button"}> Unfriend user. </button> */}
				</div>
			)
		else
			return (
				<div>
					<li className={"App-chat_name"}>{usery.stamp_.name_}</li>
					<button onClick={() => ButtonGoAddMuteOrBlock(usery.stamp_.name_)} className={"App-chat_name_button"}> Go to my page. </button>
				</div>
		)
	}

	function FRIENDSTAMP_LIST( {users, logged_in_user} : FriendStampList_int ) {
		console.log("who gives a shit if its empty", users);
		if (!users)
			return (
				<section>
			</section>
		)
		return (
			<section>
				<h2>{"All friends:"}</h2>
				{users.map(user =>
					<FRIENDSTAMP_RENDER key={user.stamp_.name_} usery={user} logged_in_user={logged_in_user}/>
				).reverse()}
			</section>
		);
	}

	function ButtonGoAddMuteOrBlock(username: string) {
		logged_in_user.selected_user = username;
		logged_in_user.friend_view = true;
		setLoaded(false);
		setSwitch(5);
		logged_in_user.loaded = false;
		logged_in_user.loading = false;
	}

	const addNewFriend = async (): Promise<boolean> => {
		try {
			await axios.post('/api/messages/add_friend', //has to be added
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

	async function	addFriend(event: any) {
		if (input_field1.current.value !== "")
		{
			addNewFriend();
			input_field1.current.value = "";
		}
		event.preventDefault();
	}

	const JSX_content = (
		<>
			<h2>Editing: {logged_in_user.chatname}</h2>
			<button onClick={() => GoToChatOverview(logged_in_user, setLoaded, setSwitch)} className={"App-chat_name_button"}> Go to chat overview. </button>
			{logged_in_user.page_admin && <form onSubmit={addFriend}>
				<input type="text" placeholder="Enter username to add to chat" ref={input_field1} onChange={(e) => input_field1.current.value=e.target.value} />
				<input type="submit" value="Add friend" />
			</form>}
		</>
	);

	console.log("FRIENDSTAMP_LIST users=", friends_input);
	return (
		<div className="App">
			<HeaderWrap user={logged_in_user.user} insert={JSX_content} modal={modal} invite={invite} invited_by={logged_in_user.invited_by}/>
			<form onSubmit={addFriend}>
				<input type="text" placeholder="Enter username to add as a friend" ref={input_field1} onChange={(e) => input_field1.current.value=e.target.value} />
				<input type="submit" value="Add user" />
			</form>
			<ol>
				<FRIENDSTAMP_LIST users={friends_input} logged_in_user={logged_in_user}/>
			</ol>
		</div>
	);
}