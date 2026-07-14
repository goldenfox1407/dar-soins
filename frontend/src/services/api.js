import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        if (status === 401) {
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        } else if (status === 403) {
            const user = JSON.parse(sessionStorage.getItem('user') || 'null');
            window.location.href = user ? `/${user.role}` : '/';
        }
        return Promise.reject(error);
    }
);

export default api;
