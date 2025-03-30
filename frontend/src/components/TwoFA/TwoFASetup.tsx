import { useState } from "react";
import axios from "axios";
import PopUpModal from '../PopUpModal/PopUpModal'

function TwoFASetup({ tokenContent, setCurrentTwoFAItem }) {
	const [twoFAData, setTwoFASetupData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState({ show: false, content: "", isError: false })

	async function generateQRCode() {
		setLoading(true)
		try {
			const response = await axios.get(`http://localhost:3000/api/auth/twofa/generate`);
			console.log("response:", response.data);
			setTwoFASetupData(response.data);
		} catch (e) {
			setModal({ show: true, content: e.response?.data?.message || "An error occurred while generating the QR code. Try again.", isError: true });
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
			setModal({ show: true, content: "2FA is successfully set up", isError: false });
			console.log("response", response)
			return response?.data;
		}
		catch (e) {
			console.log(e);
			setModal({ show: true, content: e.response?.data?.message || "Failed to save secret key", isError: true });
		};
	}


	async function saveTwoFASetup(e) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);
		try {
			const response = await axios.post("http://localhost:3000/api/auth/twofa/setup/validate", {
				...formFields,
				secretKey: twoFAData?.secretKey,
			})
			console.log("twoFA verification response: ", response);
			const savedItem = await saveSecretKeyToDatabase();
			console.log("saved item", savedItem)
			setModal({ show: true, content: "2FA is successfully validated", isError: false });
			setCurrentTwoFAItem(savedItem)
		}
		catch (e) {
			console.log("error occurred: ", e);
			setModal({ show: true, content: e.response?.data?.message || "Verification failed", isError: true });
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
					{modal.show && <PopUpModal modal={modal} setModal={setModal} />}
				</>
			)}

		</div>
	);
}

export default TwoFASetup;
