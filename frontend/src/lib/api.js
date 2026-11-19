import axios from 'axios';

const mode = import.meta.env.MODE;

const api = axios.create({
    baseURL: mode === 'development' ? 'http://localhost:5001' : '',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            originalRequest._retry = true;
            try {
                await api.post('/api/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
