import axios from 'axios';

const mode = import.meta.env.MODE;

const api = axios.create({
    baseURL: mode === 'development' ? 'http://localhost:5000' : '',
    withCredentials: true,
});

export default api;
