import { useEffect, useState } from "react";
import axios from "axios";

function CurrentTwoFASetup({ currentTwoFAItem, setCurrentTwoFAItem }) {

	async function handleDeleteTwoFA() {
		const isConfirmed = confirm("Are you sure you want to delete 2FA?")
		if (isConfirmed) {
			try {
				const response = await axios.delete("http://localhost:3000/api/auth/twofa/item",
					{ data: { email: currentTwoFAItem.email, secretKey: currentTwoFAItem.twoFASecretKey } });
				console.log(response)
				setCurrentTwoFAItem(null)
			} catch (error) {
				console.error("TwoFAItems deletion error:", error);
			}
		}
	}

	return (
		<div>
			<h2>TwoFA Item</h2>
			<table border="1">
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
							<button onClick={handleDeleteTwoFA}>❌</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div >
	);
}

export default CurrentTwoFASetup;
