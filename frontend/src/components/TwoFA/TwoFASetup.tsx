import { useEffect, useState } from "react";
import axios from "axios";

function TwoFASetup({ tokenContent, setCurrentTwoFAItem }) {
	const [twoFAData, setTwoFASetupData] = useState(null);
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(true);

	async function generateQRCode() {
		setLoading(true)
		try {
			const response = await axios.get(`http://localhost:3000/api/auth/twofa/generate`);
			console.log("response:", response.data);
			setTwoFASetupData(response.data);
			setErrorMessage("");
		} catch (e) {
			setErrorMessage(e.response?.data?.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	}

	async function saveSecretKeyToDatabase() {
		try {
			const response = await axios.post(`http://localhost:3000/api/auth/twofa/save`, {
				secretKey: twoFAData.secretKey,
				email: tokenContent.email
			})
			setErrorMessage("");
			console.log("repsonse", response)
			return response?.data;
		}
		catch (e) {
			console.log(e);
			setErrorMessage(e.response?.data?.message || "Failed to save secret key");
		};
	}


	async function saveTwoFASetup(e) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);
		try {
			const response = await axios.post("http://localhost:3000/api/auth/twofa/verify", {
				...formFields,
				secretKey: twoFAData?.secretKey,
			})
			console.log("twoFA verification response: ", response);
			setErrorMessage("");
			const savedItem = await saveSecretKeyToDatabase();
			console.log("saved item", savedItem)
			setCurrentTwoFAItem(savedItem)

		}
		catch (e) {
			console.log("error occurred: ", e);
			setErrorMessage(e.response?.data?.message || "Verification failed");
		};
	}

	return (
		<div>
			<h2>Add Two Factor Authentication</h2>
			{!twoFAData && <button onClick={generateQRCode}>Add 2FA</button>}

			{twoFAData && (
				<>
					<p>Scan the QR code with your authenticator app</p>
					{loading && <p>Loading QR Code...</p>}
					<img src={twoFAData.qrCodeUrl} alt="QR Code" /> <br />

					<button onClick={generateQRCode}>🔁 Regenerate QR</button>
					<br />
					<br />
					<form onSubmit={saveTwoFASetup}>
						<input id="2fa-verification" name="token" placeholder="Enter token" type="text" required />
						<br />
						<button type="submit">Setup☑️</button>
					</form>
					{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
				</>
			)}

		</div>
	);
}

export default TwoFASetup;
