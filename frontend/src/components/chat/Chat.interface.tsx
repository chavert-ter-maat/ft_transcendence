import React from 'react';
import { User } from '../../global.interface';
import { useNavigate } from 'react-router-dom'; 

export interface message_stamp	{
	message_:	string,
	name_:		string,
	user_ :		string,
	timestamp:	string,
	pic_:		string,
	key_:		number
};

export interface chat_stamp	{
	name_:		string,
	unread_:	number,
	timestamp:	string,
	users:		string[],
	index:		number,
	DM:			boolean
};

export interface user_stamp	{
	name_:		string,
	admin_:		boolean,
	timestamp:	string
};

export interface friend_stamp{
	stamp_:		user_stamp,
	status:		string
}

export interface UserStats {
	username:		string;
	password:		string;
	chatname:		string;
	chat_password:	string;
	state:			number; //unused
	loaded:			boolean;
	loading:		boolean;
	page_offset:	number;
	end_reached:	boolean;
	page_admin:		boolean;
	page_creator:	boolean;
	selected_user:	string;
	invited_by:		string;
	user?:			User;
	friend_view:	boolean;
}

export interface StringState {
	state:		string;
	setState:	React.Dispatch<React.SetStateAction<string>>;
}

export interface booleanState {
	state:		boolean;
	setState:	React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChatOverviewProps {
	logged_in_user:	UserStats;
	chats_input:	chat_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	modal:			booleanState;
	invite:			booleanState;
	input_field1:	React.MutableRefObject<string>;
	input_field2:	React.MutableRefObject<string>;
}

export interface MessagesViewProps {
	logged_in_user:	UserStats;
	messages_input:	message_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	modal:			booleanState;
	invite:			booleanState;
	input_field1:	React.MutableRefObject<string>;
}

export interface UsersViewProps {
	logged_in_user:	UserStats;
	users_input:	user_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	modal:			booleanState;
	invite:			booleanState;
	input_field1:	React.MutableRefObject<string>;
	password_field:	React.MutableRefObject<string>;
}

export interface FriendsViewProps {
	logged_in_user:	UserStats;
	friends_input:	friend_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	modal:			booleanState;
	invite:			booleanState;
	input_field1:	React.MutableRefObject<string>;
}

export interface LoginViewProps {
	logged_in_user:	UserStats;
	messages_input:	message_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	modal:			booleanState;
	invite:			booleanState;
	password_field:	React.MutableRefObject<string>;
}

export interface EditViewProps {
	logged_in_user:	UserStats;
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	requestedUserInfo:	User;
	naviagte:		ReturnType<typeof useNavigate>;
	modal:			booleanState;
	invite:			booleanState;
	input_field1:	React.MutableRefObject<string>;
	input_field2:	React.MutableRefObject<string>;
}

export interface UserName {
	username:	string;
	password:	string;
}

export interface NewChat {
	chatname:	string;
	creator:	string;
}

export interface newUser {
	username:	string;
	admin:		string;
}