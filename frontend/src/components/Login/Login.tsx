// import { useState } from "react";
import axios from 'axios';

function Login() {
	function validateUserLogin(username: string, password: string): void {
		axios.post('http://localhost:3000/auth/login', {
			username: username,
			password: password
		}).then(function (response) {
			console.log(response);
		}).catch(function (error) {
			console.log(error);
		});
	}

	function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const fields = Object.fromEntries(formData) as Record<string, string>;

		validateUserLogin(fields.username, fields.password);
	}

	return (
		<div>
			<div>Login</div>
			<form onSubmit={handleFormSubmit}>
				<label>
					Username <br />
					<input type="text" name='username' placeholder="username" />
				</label>
				<br />
				<label>
					Password
					<br />
				</label>
				<input type="text" name='password' placeholder="password" />
				<br />
				<button type="submit" >Log in</button>

			</form>
		</div >
	)
}
export default Login