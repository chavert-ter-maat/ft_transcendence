import { useEffect, useState } from "react";
import axios from "axios";

function TwoFAItem() {
	const [listItem, setListItem] = useState(null);
	const [isActive, setIsActive] = useState(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get("http://localhost:3000/auth/twofa/item", {
					params: { email: "test@testmail.com" },
				});
				console.log("raw response:", response.data);
				setListItem(response.data); // Update state
				setIsActive(response.data.isActive)
			} catch (error) {
				console.error("TwoFAItems error:", error);
			}
		};

		fetchData();
	}, [isActive, listItem]);


	async function handleCheckboxClickEvent() {
		try {
			if (isActive) {
				await axios.post("http://localhost:3000/auth/twofa/disable", { email: "test@testmail.com" },
				);
			}
			else {
				await axios.post("http://localhost:3000/auth/twofa/enable", { email: "test@testmail.com" });
			}
			setIsActive(!isActive)
			setListItem(null)
		} catch (error) {
			console.error("TwoFAItems error:", error);
		}
	}

	async function handleDeleteTwoFA() {
		const isConfirmed = confirm("Are you sure you want to delete 2FA?")
		if (isConfirmed) {
			try {
				await axios.delete("http://localhost:3000/auth/twofa/item", { data: { email: "test@testmail.com" } });
			} catch (error) {
				console.error("TwoFAItems deletion error:", error);
			}
		}
	}

	return (
		<div>
			<h2>TwoFA Item</h2>
			{listItem ? (
				<table border="1">
					<thead>
						<tr>
							<th>Secret Key</th>
							<th>Creation date</th>
							<th>Last updated date</th>
							<th>Activate</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{listItem.secretKey.substr(0, 5) + "*****" + listItem.secretKey.substr(-5)}</td>
							<td>{listItem.createdAt || "N/A"}</td>
							<td>
								{listItem.updatedAt || "N/A"}
							</td>
							<td>
								<input onChange={handleCheckboxClickEvent} type="checkbox" id="activate-btn" name="activate-2fa" defaultChecked={listItem.isActive}></input>
							</td>
							<td>
								<button onClick={handleDeleteTwoFA}>❌</button>
							</td>
						</tr>
					</tbody>
				</table>
			) : (
				<p>No Two Factor Authentication is set up yet</p>
			)
			}
		</div >
	);
}

export default TwoFAItem;
