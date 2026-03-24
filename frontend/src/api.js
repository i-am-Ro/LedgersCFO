import axios from 'axios';

const API_URL = `https://ledgerscfo-3.onrender.com/api/`;

// Axios instance with interceptor
const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
};

export const getClients = async () => {
    const response = await api.get('/clients');
    return response.data;
};

export const createClient = async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
};

export const updateClient = async (clientId, clientData) => {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
};

export const deleteClient = async (clientId) => {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
};

export const getTasks = async (clientId = null) => {
    const url = clientId ? `/tasks?clientId=${clientId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
    const response = await api.put(`/tasks/${taskId}`, { status });
    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
};

export default api;
