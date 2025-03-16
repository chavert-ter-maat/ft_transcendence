import { useEffect, useState } from "react";
import axios from "axios";

function VerifyTwoFA() {
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	// const [verifiedUser, setVerifiedUser] = useState(null);

	// useEffect(() => {
	// 	const fetchVerifiedUser = async () => {
	// 		try {
	// 			const url = new URL(document.URL)
	// 			const secretKey = url.searchParams.get("secretKey")
	// 			const response = await axios.get(`http://localhost:3000/api/auth/twofa/item`, {
	// 				params: { secretKey: secretKey }
	// 			});
	// 			setVerifiedUser(response.data);
	// 		} catch (error) {
	// 			setErrorMessage(error.response?.data?.message || "Failed to fetch user");
	// 		}
	// 	};

	// 	fetchVerifiedUser();
	// }, []);

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
			setSuccessMessage("Token validated successfully");
			setErrorMessage("");
		} catch (error) {
			setSuccessMessage("");
			console.log(error)
			setErrorMessage(error.response?.data?.message || "token validation failed");
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