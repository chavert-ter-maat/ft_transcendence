import axios from 'axios';

const hostname = import.meta.env.VITE_HOSTNAME || 'localhost';
const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;
console.log('Axios API URL:', apiUrl); // Debug log

const instance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensures cookies are included if needed
});

instance.interceptors.request.use(
	async (config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`
		}
		return config;
	}
);

export default instance;
