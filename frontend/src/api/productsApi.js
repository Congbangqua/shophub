import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

export const productsApi = {
  async getAll(params = {}) {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product details');
      throw error;
    }
  },

  async create(payload) {
    try {
      const token = getToken();
      const response = await axiosClient.post('/products', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create product');
      throw error;
    }
  },

  async delete(id) {
    try {
      const token = getToken();
      await axiosClient.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleApiError(error, 'Failed to delete product');
      throw error;
    }
  },
};