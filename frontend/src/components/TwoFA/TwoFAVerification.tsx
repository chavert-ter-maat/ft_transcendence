import { useEffect, useState } from "react";
import axios from "axios";

function VerifyTwoFA() {
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [verifiedUser, setVerifiedUser] = useState(null);

	useEffect(() => {
		const fetchVerifiedUser = async () => {
			try {
				const response = await axios.get("http://localhost:3000/auth/twofa/item", {
					params: { email: "test@testmail.com" }
				});
				setVerifiedUser(response.data);
			} catch (error) {
				setErrorMessage(error.response?.data?.message || "Failed to fetch user");
			}
		};

		fetchVerifiedUser();
	}, []);

	const handleVerification = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formFields = Object.fromEntries(formData);

		try {
			await axios.post("http://localhost:3000/auth/twofa/verify", {
				...verifiedUser,
				...formFields,
			});
			setSuccessMessage("Token verified successfully");
			setErrorMessage("");
		} catch (error) {
			setSuccessMessage("");
			setErrorMessage(error.response?.data?.message || "Verification failed");
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
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			{successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
		</div>
	);
}

export default VerifyTwoFA;