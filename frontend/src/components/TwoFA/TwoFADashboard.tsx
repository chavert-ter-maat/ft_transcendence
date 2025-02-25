import axios from 'axios';
import { useEffect, useState } from 'react'
import TwoFASetup from './TwoFASetup'
import TwoFAItem from './TwoFAItem';
import VerifyTwoFA from './TwoFAVerification';

function TwoFADashboard() {

	const [showTwoFaSetup, setShowTwoFASetup] = useState(false)
	// const [showTwoFaItems, setShowTwoFAItems] = useState([])


	function handleOnClickEvent() {
		setShowTwoFASetup(false)
		setShowTwoFASetup(true)
	}

	return (
		<div>
			<h1>2FA Dashboard</h1>
			<button onClick={handleOnClickEvent}>Add 2fa</button>
			{showTwoFaSetup && <TwoFASetup />}
			{/* <VerifyTwoFA /> */}
			<TwoFAItem />

		</div >
	)
}
export default TwoFADashboard