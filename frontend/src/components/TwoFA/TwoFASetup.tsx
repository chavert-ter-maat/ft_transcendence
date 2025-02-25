import { useEffect, useState } from "react";
import axios from "axios";

function TwoFASetup() {
	const [twoFAData, setTwoFAData] = useState({});
	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")

	useEffect(() => {
		axios.get("http://localhost:3000/auth/twofa/generate")
			.then((response) => {
				console.log("response:", response);
				setTwoFAData(response.data);
			})
			.catch((e) => {
				setSuccessMessage("")
				setErrorMessage(e.response.data)
			});
	}, []);

	function saveSecretKeyToDatabase(res: object) {
		axios.post("http://localhost:3000/auth/twofa/save", { secretKey: twoFAData.secretKey, email: "test@testmail.com" })
			.then((response) => {
				setSuccessMessage("Two Factor Authentication is successfully set up")
				setErrorMessage("")
			})
			.catch((e) => {
				console.log(e)
				setSuccessMessage("")
				setErrorMessage(e)
			});
	}


	function setTwoFA(e) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData) as Record<string, string>;

		axios.post("http://localhost:3000/auth/twofa/verify", { ...formFields, secretKey: twoFAData.secretKey, email: "test@testmail.com" })
			.then((response) => {
				console.log("twofadata: ", response)
				setErrorMessage("")
				saveSecretKeyToDatabase(response.data)
			})
			.catch((e) => {
				console.log("error occurred: ", e);
				setErrorMessage(e.response.data.message)
			});

	}

	return (
		<div>
			<h2>Add Two Factor Authentication</h2>

			<img src={twoFAData.qrCodeUrl} alt="QR Code" />
			<p>Scan the QR code with your authenticator app</p>
			<br />
			<form onSubmit={setTwoFA}>
				<label htmlFor="2fa-verification">
					Verify with your token
				</label> <br />
				<input id="2fa-verification" name="token" placeholder="Enter token" type="text" required />
				<br />
				<button type="submit">verify</button>
			</form>
			{errorMessage && <p>{errorMessage}</p>}
			{successMessage && <p>{successMessage}</p>}
		</div>
	);
}

export default TwoFASetup;
