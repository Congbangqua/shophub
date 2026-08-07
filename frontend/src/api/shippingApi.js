import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const shippingApi = {
  async getProvinces() {
    const response = await axiosClient.get('/shipping/provinces', {
      headers: authHeaders(),
    });
    return response.data;
  },

  async getDistricts(provinceId) {
    const response = await axiosClient.get('/shipping/districts', {
      params: { province_id: provinceId },
      headers: authHeaders(),
    });
    return response.data;
  },

  async getWards(districtId) {
    const response = await axiosClient.get('/shipping/wards', {
      params: { district_id: districtId },
      headers: authHeaders(),
    });
    return response.data;
  },

  async calculateFee({ to_district_id, to_ward_code, weight, insurance_value = 0 }) {
    const response = await axiosClient.post(
      '/shipping/calculate-fee',
      { to_district_id, to_ward_code, weight, insurance_value },
      { headers: authHeaders() },
    );
    return response.data;
  },
};
