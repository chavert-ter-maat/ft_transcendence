// import { useState } from "react";
// import axios from 'axios';

function TwoFAMain() {

	// const [error, setError] = useState("")
	// const [success, setSuccess] = useState("")

	// function validateUserLogin(username: string, password: string): void {
	// 	axios.post('http://localhost:3000/auth/login', {
	// 		username: username,
	// 		password: password
	// 	})
	// 		.then(function (response) {
	// 			console.log(response)
	// 			setSuccess("Successful login")
	// 		}).catch(function (error) {
	// 			setError(error.message)
	// 		});
	// }

	// function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
	// 	e.preventDefault();
	// 	const formData = new FormData(e.currentTarget);
	// 	const fields = Object.fromEntries(formData) as Record<string, string>;

	// 	validateUserLogin(fields.username, fields.password);
	// }

	return (
		<div>
			<div>Two Factor Authentication</div>
			<form >
				<input id='two-fa-enabled' type="checkbox" checked />
				<label htmlFor='two-fa-enabled'>Enabled</label>
			</form>

			{/* <form onSubmit={handleFormSubmit}>
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
			{success && <p>{success}</p>} */}
		</div >
	)
}
export default TwoFAMain 