import { useState } from "react";
import axios from 'axios';

function Login() {

	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	function validateUserLogin(username: string, password: string): void {
		axios.post('http://localhost:3000/auth/login', {
			username: username,
			password: password
		})
			.then(function (response) {
				console.log(response)
				setSuccess("Successful login")
			}).catch(function (error) {
				console.log(error)
				setError(error.response.data.message)
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
				<label htmlFor="field-username">
					Username
				</label><br />
				<input id='field-username' type="text" name='username' placeholder="username" />
				<br />
				<label htmlFor="field-password">
					Password
				</label>
				<br />
				<input id='field-password' type="password" name='password' placeholder="password" />
				<br />
				<button type="submit" >Log in</button>
			</form>
			{error && <p>{error}</p>}
			{success && <p>{success}</p>}
		</div >
	)
}
export default Login