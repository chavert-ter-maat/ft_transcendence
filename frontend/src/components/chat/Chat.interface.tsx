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
	user?:			User;
}

export interface StringState {
	state:		string;
	setState:	React.Dispatch<React.SetStateAction<string>>;
}

export interface ChatOverviewProps {
	logged_in_user:	UserStats;
	chats_input:	chat_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	input1:			StringState;
	input2:			StringState;
}

export interface MessagesViewProps {
	logged_in_user:	UserStats;
	messages_input:	message_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	input1:			StringState;
}

export interface UsersViewProps {
	logged_in_user:	UserStats;
	users_input:	user_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	input1:			StringState;
	password1:		StringState;
}

export interface LoginViewProps {
	logged_in_user:	UserStats;
	messages_input:	message_stamp[];
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	input1:			StringState;
	password1:		StringState;
}

export interface EditViewProps {
	logged_in_user:	UserStats;
	setLoaded:		React.Dispatch<React.SetStateAction<boolean>>;
	setSwitch:		React.Dispatch<React.SetStateAction<number>>;
	requestedUserInfo:	User;
	naviagte:		ReturnType<typeof useNavigate>;
	input1:			StringState;
	password1:		StringState;
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