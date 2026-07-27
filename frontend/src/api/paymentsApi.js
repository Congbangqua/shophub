import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const paymentsApi = {
  async createStripeSession(orderId) {
    const response = await axiosClient.post(
      '/payments/stripe/create-session',
      { order_id: orderId },
      { headers: authHeaders() },
    );
    return response.data;
  },

  async createPaypalOrder(orderId) {
    const response = await axiosClient.post(
      '/payments/paypal/create-order',
      { order_id: orderId },
      { headers: authHeaders() },
    );
    return response.data;
  },

  async createVnpayUrl(orderId) {
    const response = await axiosClient.post(
      '/payments/vnpay/create-url',
      { order_id: orderId },
      { headers: authHeaders() },
    );
    return response.data;
  },

  async confirm(orderId, provider, paypalOrderId = null) {
    const response = await axiosClient.post(
      '/payments/confirm',
      { order_id: orderId, provider, paypal_order_id: paypalOrderId },
      { headers: authHeaders() },
    );
    return response.data;
  },
};