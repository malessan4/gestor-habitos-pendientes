import axios from 'axios';

const api = axios.create({
    // Cuando subas a Render, cambiaremos esto por tu URL de Render
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000',
});

// Agrega el token a CADA petición que hagamos
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Maneja errores (por ejemplo, si el token expira)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Si el servidor nos dice "No autorizado", limpiamos y al login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;