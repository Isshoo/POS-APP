import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  accessToken = storedToken;
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});


