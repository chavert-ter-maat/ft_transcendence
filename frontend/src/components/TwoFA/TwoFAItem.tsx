import { useEffect, useState } from "react";
import axios from "axios";

function CurrentTwoFASetup({ secretKey, createdAt, setCurrentTwoFAItem }) {

	async function handleDeleteTwoFA() {
		const isConfirmed = confirm("Are you sure you want to delete 2FA?")
		if (isConfirmed) {
			try {
				await axios.delete("http://localhost:3000/auth/twofa/item", { data: { email: "test@testmail.com" } });
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
						<td>{secretKey.substr(0, 5) + "*****" + secretKey.substr(-5)}</td>
						<td>{createdAt || "N/A"}</td>
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
