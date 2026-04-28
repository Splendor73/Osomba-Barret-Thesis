import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// Shared backend client: frontend pages call relative paths against the FastAPI /api/v1 base.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/support-api/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Each API request asks Amplify for the current Cognito ID token and sends it as Bearer auth.
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Public endpoints can still run without a token.
  }
  return config;
});

// A backend 401 means the session is missing/expired, so restart the login flow.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
