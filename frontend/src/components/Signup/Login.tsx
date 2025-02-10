import { useState } from "react";
import axios from 'axios';

function Signup() {

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
				setError(error.message)
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
			<div>Signup</div>
			<form onSubmit={handleFormSubmit}>
				<label>
					Email Address
				</label><br />
				<input type="text" name='email' placeholder="email address" />
				<br />
				<label>
					Username
				</label><br />
				<input type="text" name='username' placeholder="username" />
				<br />
				<label>
					Password
				</label>
				<br />
				<input type="text" name='password' placeholder="password" />
				<br />
				<button type="submit" >Log in</button>
			</form>
			{error && <p>{error}</p>}
			{success && <p>{success}</p>}
		</div >
	)
}
export default Signup 