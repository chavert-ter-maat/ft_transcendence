import axios from 'axios';
import { useEffect, useState } from 'react';
import TwoFASetup from './TwoFASetup';
import CurrentTwoFASetup from './TwoFAItem';
import { jwtDecode } from "jwt-decode";

function TwoFADashboard() {
	const [currentTwoFAItem, setCurrentTwoFAItem] = useState(null);
	const [tokenContent, setTokenContent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState(null)

	useEffect(() => {
		setLoading(true)
		async function fetchData() {
			try {
				const token = localStorage.getItem("authToken")
				const decoded = jwtDecode(token)
				setTokenContent(decoded);
				const response = await axios.get("http://localhost:3000/api/auth/twofa/item",
					{ params: { email: decoded.email } }
				);

				console.log(response.data);
				setCurrentTwoFAItem(response.data);
				// console.log(currentTwoFAItem);
			} catch (error) {
				console.error("TwoFAItems error:", error);
				setErrorMessage(error?.message || "Error encountered while loading the page")
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div>
			<h1>2FA Dashboard</h1>
			{loading ? (
				<p>Loading...</p>
			) : (currentTwoFAItem && currentTwoFAItem?.twoFASecretKey) ? (
				<CurrentTwoFASetup
					currentTwoFAItem={currentTwoFAItem}
					setCurrentTwoFAItem={setCurrentTwoFAItem}
				/>
			) : (
				<TwoFASetup tokenContent={tokenContent} setCurrentTwoFAItem={setCurrentTwoFAItem} />
			)}
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
		</div>
	);
}

export default TwoFADashboard;
