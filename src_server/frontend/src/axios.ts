// src/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000', // Use the same port for backend
  headers: {
    'Content-Type': 'application/json',
  },
//   withCredentials: true, // Ensures cookies are included if needed // not there in my main
});

// also new, what does this do?  probably doesn't know how to go through FortyTwoAuthGuard. Or FortyTwoGuard is half setup
instance.interceptors.request.use(
	async (config) => {
		const token = localStorage.getItem('authToken');
		console.log("got token: " + token);
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	}
);

export default instance;
