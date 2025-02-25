import { useEffect, useState } from "react";
import axios from "axios";

function VerifyTwoFA() {
	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")
	const [verifiedUser, setVerifiedUser] = useState()

	useEffect(() => {
	}, []);

	useEffect(() => {
		axios.get("http://localhost:3000/auth/twofa/item", { params: { email: "test@testmail.com" } })
			.then((response) => {
				console.log("verified user", response)
				setVerifiedUser(response.data)
			})
			.catch((e) => {
				setErrorMessage(e.message)
			});
	}, []);

	function handleVerification(e) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData) as Record<string, string>;

		axios.post("http://localhost:3000/auth/twofa/verify", { ...verifiedUser, ...formFields })
			.then((response) => {
				setSuccessMessage("Token verified")
				setErrorMessage("")
			})
			.catch((e) => {
				console.log("error msg", e)
				setSuccessMessage("")
				setErrorMessage(e.response.data.message)
			});
	}


	return (
		<div>
			<p>Verify your Token</p>
			<form onSubmit={handleVerification}>
				<label htmlFor="2fa-verification">
				</label> <br />
				<input id="2fa-verification" name="token" placeholder="Enter token" type="text" required />
				<br />
				<button type="submit">Verify</button>
			</form>
			{errorMessage && <p>{errorMessage}</p>}
			{successMessage && <p>{successMessage}</p>}
		</div>
	);
}

export default VerifyTwoFA;
