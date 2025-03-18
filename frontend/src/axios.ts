import axios from "axios";

const hostname = import.meta.env.VITE_HOSTNAME || "localhost";
const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;
console.log("Axios API URL:", apiUrl);

const instance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
