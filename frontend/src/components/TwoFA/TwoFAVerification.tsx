import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import PopUpModal from '../PopUpModal/PopUpModal';
import './TwoFAVerificaiton.css';
import axios from '../../axios';

function VerifyTwoFA() {
	const [modal, setModal] = useState({ show: false, content: "", isError: false });
	const urlParams = new URLSearchParams(window.location.search);
	const sessionId = urlParams.get('sessionId');
	const navigate = useNavigate();

	useEffect(() => {
		if (!sessionId) {
			setModal({ show: true, content: "You don't have 2FA setup, redirecting to the 2FA dashboard", isError: true });
			setTimeout(() => navigate('/2fa-dashboard'), 3000);
		}
	}, [sessionId, navigate]);

	const handleVerification = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);

		try {
			const response = await axios.post(`/api/auth/twofa/validate`, {
				...formFields,
				sessionId
			});
			localStorage.setItem("authToken", response.data.accessToken);
			setModal({ show: true, content: "Successful validation", isError: false });
			setTimeout(() => navigate('/userpage'), 3000);
		} catch (error) {
			setModal({ show: true, content: error.response?.data?.message || `Validation failed: ${error}`, isError: true });
		}
	};

	return (
		<div className="verify-container">
			<h2 className="verify-title">Verify Your Token</h2>
			<form onSubmit={handleVerification} className="verify-form">
				<input id="2fa-verification" name="token" placeholder="Enter token" type="text" required className="verify-input" />
				<button type="submit" className="verify-button">Verify</button>
			</form>
			{modal.show && <PopUpModal modal={modal} setModal={setModal} />}
		</div>
	);
}

export default VerifyTwoFA;
