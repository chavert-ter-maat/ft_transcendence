// src/axios/axios.ts

import axios from 'axios';

// Function to handle OAuth token exchange
export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await axios.post<{ access_token: string }>(`${process.env.REACT_APP_API_URL}/auth/token`, { code });
    return response.data.access_token;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
};
