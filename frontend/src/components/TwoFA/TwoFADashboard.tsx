import axios from 'axios';
import { useEffect, useState } from 'react';
import TwoFASetup from './TwoFASetup';
import CurrentTwoFASetup from './TwoFAItem';

function TwoFADashboard() {
	const [currentTwoFAItem, setCurrentTwoFAItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState(null)

	useEffect(() => {
		setLoading(true)
		async function fetchData() {
			try {
				const response = await axios.get(`${process.env.FRONTEND_URL}/auth/twofa/item`, { authToken: localStorage.getItem("authToken") });
				console.log("raw response:", response.data);
				setCurrentTwoFAItem(response.data);
			} catch (error) {
				console.error("TwoFAItems error:", error);
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
		</div>
	);
}

export default TwoFADashboard;
