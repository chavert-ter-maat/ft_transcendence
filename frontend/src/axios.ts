import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000', // Use the same port for backend, magic value
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
