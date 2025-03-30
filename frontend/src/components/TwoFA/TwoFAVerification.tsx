import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import PopUpModal from '../PopUpModal/PopUpModal'

function VerifyTwoFA() {
	const [modal, setModal] = useState({ show: false, content: "", isError: false })

	const navigate = useNavigate();

	const handleVerification = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);

		try {
			const url = new URL(document.URL)
			const sessionId = url.searchParams.get("sessionId")
			const response = await axios.post(`http://localhost:3000/api/auth/twofa/validate`, {
				...formFields,
				sessionId
			});
			console.log(response)
			const accessToken = response.data.accessToken;
			localStorage.setItem("authToken", accessToken)
			setModal({ show: true, content: "Successful validation", isError: false });
			setTimeout(() => navigate('/userpage'), 3000);
		} catch (error) {
			console.log(error)
			setModal({ show: true, content: error.response?.data?.message || `Validation failed: ${error}`, isError: true });
		}
	};

	return (
		<div>
			<h2>Verify Your Token</h2>
			<form onSubmit={handleVerification}>
				<input id="2fa-verification" name="token" placeholder="Enter token" type="text" required />
				<br />
				<button type="submit">Verify</button>
			</form>
			{modal.show && <PopUpModal modal={modal} setModal={setModal} />}
		</div>
	);
}

export default VerifyTwoFA;