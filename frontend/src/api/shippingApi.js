import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const shippingApi = {
  async calculateFee({ to_district_id, to_ward_code, weight, insurance_value = 0 }) {
    const response = await axiosClient.post(
      '/shipping/calculate-fee',
      { to_district_id, to_ward_code, weight, insurance_value },
      { headers: authHeaders() },
    );
    return response.data;
  },
};
