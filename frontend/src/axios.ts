// axios.ts
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5001', // backend URL
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true, // Ensures cookies are included if needed
});

export default instance;
