import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const shipperApi = {
  async getQueue() {
    const response = await axiosClient.get('/orders/shipper/queue', {
      headers: authHeaders(),
    });
    return response.data;
  },

  async updateStatus(orderId, status) {
    const response = await axiosClient.patch(
      `/orders/${orderId}/shipper-status`,
      { status },
      { headers: authHeaders() },
    );
    return response.data;
  },
};
