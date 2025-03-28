import React, { useState } from 'react';
import './App.css';
import { User } from '../../global.interface';
import { booleanState } from './Chat.interface';

interface ChildProps {
	user:	User;
	insert:	React.JSX.Element;
	modal:	booleanState;
	invite:	booleanState;
	invited_by:	string;
  }

  const Modal = ({ isOpen, onAccept, onDecline, message }) => {
	if (!isOpen) return null;
  
	return (
	  <div>
		<div>Do you wanna join a game with: {message}</div>
		<button onClick={onAccept}>Accept</button>
		<button onClick={onDecline}>Decline</button>
	  </div>
	);
  };

export const HeaderWrap: React.FC<ChildProps> = ({ user, insert, modal, invite, invited_by }) =>  {
	return (
		<div className="App">
			<Modal isOpen={modal.state} onAccept={() => {modal.setState(false), invite.setState(true) }} onDecline={() => {modal.setState(false), invite.setState(false) }} message={invited_by} />
		<header className="App-header">
		<img	src={"data:image/png;base64, " + user.imageString}
		  alt={user.imageName} className="App-logo"	/>
		<h2>{user.username + "}aka{" + user.displayName}</h2>
		<>{insert}</>
		</header>
		</div>
	);
}