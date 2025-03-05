import React from 'react';
import './App.css';
import { User } from '../global.interface';

interface ChildProps {
	user:	User;
	insert:	React.JSX.Element;
  }

export const HeaderWrap: React.FC<ChildProps> = ({ user, insert }) =>  {
	return (
		<div className="App">
		<header className="App-header">
		<img	src={"data:image/png;base64, " + user.imageString}
		  alt={user.imageName} className="App-logo"	/>
		<h2>{user.username + "}aka{" + user.displayName}</h2>
		<>{insert}</>
		</header>
		</div>
	);
}