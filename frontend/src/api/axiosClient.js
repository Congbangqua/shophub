import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://shophub-api-8rdi.onrender.com',
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;