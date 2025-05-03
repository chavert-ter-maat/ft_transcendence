import { useEffect, useState } from "react";
import axios from "../../axios"
import './TwoFAItem.css';

function CurrentTwoFASetup({ currentTwoFAItem, setCurrentTwoFAItem }) {

	async function handleDeleteTwoFA() {
		const isConfirmed = confirm("Are you sure you want to delete 2FA?");
		if (isConfirmed) {
			try {
				const response = await axios.delete(`/api/auth/twofa/item`, {
					data: { email: currentTwoFAItem.email, secretKey: currentTwoFAItem.twoFASecretKey },
				});
				console.log(response);
				setCurrentTwoFAItem(null);
			} catch (error) {
				console.error("TwoFAItems deletion error:", error);
			}
		}
	}

	return (
		<div className="twofa-setup-container">
			<h2 className="twofa-setup-title">TwoFA Item</h2>
			<table className="twofa-table">
				<thead>
					<tr>
						<th>Secret Key</th>
						<th>Creation date</th>
						<th>Delete</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{currentTwoFAItem.twoFASecretKey.substr(0, 5) + "*****" + currentTwoFAItem.twoFASecretKey.substr(-5)}</td>
						<td>{currentTwoFAItem.createdAt || "N/A"}</td>
						<td>
							<button className="delete-button" onClick={handleDeleteTwoFA}>X</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export default CurrentTwoFASetup;
