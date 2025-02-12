import { useState } from "react";
import axios from 'axios';

function Signup() {

	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	function validateUserSignup(fields: object): void {
		axios.post('http://localhost:3000/auth/signup', {
			...fields
		}).then(function (response) {
			console.log(response)
			setSuccess("Account created")
			setError("")
		}).catch(function (error) {
			setSuccess("")

			console.log(error)
			let errorMessage = error.response.data.message
			if (typeof (errorMessage) === typeof []) {
				setError(errorMessage[0])
			}
			else if (typeof (errorMessage) === typeof "") {
				setError(errorMessage)
			}
			else {
				setError("Unknown error")
			}
		});
	}

	function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const fields = Object.fromEntries(formData) as Record<string, string>;

		validateUserSignup(fields);
	}

	return (
		<div>
			<div>Signup</div>
			<form onSubmit={handleFormSubmit}>
				<label htmlFor="field-username">
					Username
				</label>
				<br />
				<input id='field-username' type="text" name='username' placeholder="username" />
				<br />
				<label htmlFor='field-email'>
					Email Address
				</label><br />
				<input id='field-email' type="text" name='email' placeholder="email address" />
				<br />
				<label htmlFor="field-password">
					Password
				</label>
				<br />
				<input id='field-password' type="password" name='password' placeholder="password" />
				<br />
				<button type="submit" >Sign up</button>
			</form>
			{error && <p>{error}</p>}
			{success && <p>{success}</p>}
		</div >
	)
}
export default Signup 