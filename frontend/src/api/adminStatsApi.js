import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const adminStatsApi = {
  async getOverview() {
    const response = await axiosClient.get('/admin/stats/overview', {
      headers: authHeaders(),
    });
    return response.data;
  },

  async getMonthlyRevenue() {
    const response = await axiosClient.get('/admin/stats/monthly-revenue', {
      headers: authHeaders(),
    });
    return response.data;
  },
};