import axios from 'axios';
import { useEffect, useState } from 'react';
import TwoFASetup from './TwoFASetup';
import CurrentTwoFASetup from './TwoFAItem';
import VerifyTwoFA from './TwoFAVerification';

function TwoFADashboard() {
	const [currentTwoFAItem, setCurrentTwoFAItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState(null)

	useEffect(() => {
		setLoading(true)
		async function fetchData() {
			try {
				const response = await axios.get("http://localhost:3000/auth/twofa/item", {
					params: { email: "test@testmail.com" },
				});
				console.log("raw response:", response.data);
				setCurrentTwoFAItem(response.data);
			} catch (error) {
				console.error("TwoFAItems error:", error);
			} finally {
				setLoading(false); // Stop loading once request completes
			}
		};
		fetchData();
	}, []);

	return (
		<div>
			<h1>2FA Dashboard</h1>
			{loading ? (
				<p>Loading...</p> // Show loading message
			) : currentTwoFAItem ? (
				<CurrentTwoFASetup
					secretKey={currentTwoFAItem.secretKey}
					createdAt={currentTwoFAItem.createdAt}
					setCurrentTwoFAItem={setCurrentTwoFAItem}
				/>
			) : (
				<TwoFASetup setCurrentTwoFAItem={setCurrentTwoFAItem} />
			)}
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			{/* <VerifyTwoFA /> */}
		</div>
	);
}

export default TwoFADashboard;
