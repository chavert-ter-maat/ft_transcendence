import { useState } from "react";
import PopUpModal from '../PopUpModal/PopUpModal';
import './TwoFASetup.css'; // Import external CSS
import axios from '../../axios';

function TwoFASetup({ tokenContent, setCurrentTwoFAItem }) {
	const [twoFAData, setTwoFASetupData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState({ show: false, content: "", isError: false });

	async function generateQRCode() {
		setLoading(true);
		try {
			const response = await axios.get(`/api/auth/twofa/generate`);
			setTwoFASetupData(response.data);
		} catch (e) {
			setModal({ show: true, content: e.response?.data?.message || "An error occurred while generating the QR code. Try again.", isError: true });
		} finally {
			setLoading(false);
		}
	}

	async function saveSecretKeyToDatabase() {
		try {
			const response = await axios.post(`/api/auth/twofa/save`, {
				secretKey: twoFAData.secretKey,
				email: tokenContent.email
			})
			setModal({ show: true, content: "2FA is successfully set up", isError: false });
			return response?.data;
		} catch (e) {
			setModal({ show: true, content: e.response?.data?.message || "Failed to save secret key", isError: true });
		};
	}

	async function saveTwoFASetup(e) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);
		try {
			const response = await axios.post("/api/auth/twofa/setup/validate", {
				...formFields,
				secretKey: twoFAData?.secretKey,
			})
			const savedItem = await saveSecretKeyToDatabase();
			setModal({ show: true, content: "2FA is successfully validated", isError: false });
			setCurrentTwoFAItem(savedItem)
		} catch (e) {
			setModal({ show: true, content: e.response?.data?.message || "Verification failed", isError: true });
		};
	}

	return (
		<div className="twofa-setup-container">
			<h2 className="twofa-setup-title">Add Two Factor Authentication</h2>
			{!twoFAData && <button className="generate-qr-btn" onClick={generateQRCode}>Add 2FA</button>}

			{twoFAData && (
				<>
					<p>Scan the QR code with your authenticator app</p>
					{loading && <p>Loading QR Code...</p>}
					<img className="qr-code" src={twoFAData.qrCodeUrl} alt="QR Code" /> <br />

					<button className="generate-qr-btn" onClick={generateQRCode}>Regenerate QR</button>
					<form className="twofa-form" onSubmit={saveTwoFASetup}>
						<input id="2fa-verification" className="twofa-input" name="token" placeholder="Enter token" type="text" required />
						<br />
						<button className="submit-btn" type="submit">Setup</button>
					</form>
					{modal.show && <PopUpModal modal={modal} setModal={setModal} />}
				</>
			)}
		</div>
	);
}

export default TwoFASetup;
