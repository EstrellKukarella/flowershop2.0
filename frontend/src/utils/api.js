import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
    if (WebApp.initData) {
        config.headers['x-telegram-init-data'] = WebApp.initData;
    }
    return config;
});

export default api;
