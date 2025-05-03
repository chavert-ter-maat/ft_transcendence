import { useEffect, useState } from 'react';
import TwoFASetup from './TwoFASetup';
import CurrentTwoFASetup from './TwoFAItem';
import { jwtDecode } from "jwt-decode";
import PopUpModal from '../PopUpModal/PopUpModal';
import axios from '../../axios';
import './TwoFADashboard.css';
import { useNavigate } from "react-router-dom";


function TwoFADashboard() {
	const navigate = useNavigate();
	const [currentTwoFAItem, setCurrentTwoFAItem] = useState(null);
	const [tokenContent, setTokenContent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState({ show: false, content: "", isError: false });

	useEffect(() => {
		setLoading(true);
		async function fetchData() {
			try {
				const token = localStorage.getItem("authToken");
				const decoded = jwtDecode(token);
				setTokenContent(decoded);
				const response = await axios.get(`/api/auth/twofa/item`, {
					params: { email: decoded.email }
				});

				console.log(response.data);
				setCurrentTwoFAItem(response.data);
			} catch (error) {
				console.error("TwoFAItems error:", error);
				setModal({ show: true, content: error?.message || "Error encountered while loading the page", isError: true });
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="twofa-dashboard-container">
			<h1 className="twofa-dashboard-title">2FA Dashboard</h1>
			
			{loading ? (
				<p className="loading-text">Loading...</p>
			) : (currentTwoFAItem && currentTwoFAItem?.twoFASecretKey) ? (
				<CurrentTwoFASetup
					currentTwoFAItem={currentTwoFAItem}
					setCurrentTwoFAItem={setCurrentTwoFAItem}
				/>
			) : (
				<TwoFASetup tokenContent={tokenContent} setCurrentTwoFAItem={setCurrentTwoFAItem} />
			)}
			{modal.show && <PopUpModal modal={modal} setModal={setModal} />}
			<button onClick={() => navigate(-1)}>Back</button>
		</div>
	);
}

export default TwoFADashboard;
