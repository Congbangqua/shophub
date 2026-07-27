import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const ordersApi = {
  async checkout(cartItems) {
    const payload = {
      items: cartItems.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };
    const response = await axiosClient.post('/orders/checkout', payload, {
      headers: authHeaders(),
    });
    return response.data;
  },

  async getMyOrders() {
    const response = await axiosClient.get('/orders/my', {
      headers: authHeaders(),
    });
    return response.data;
  },

  async getOrderById(id) {
    const response = await axiosClient.get(`/orders/${id}`, {
      headers: authHeaders(),
    });
    return response.data;
  },

  async getAllForAdmin() {
    const response = await axiosClient.get('/orders/admin/all', {
      headers: authHeaders(),
    });
    return response.data;
  },

  async adminUpdateStatus(orderId, status) {
    const response = await axiosClient.patch(
      `/orders/${orderId}/status`,
      { status },
      { headers: authHeaders() },
    );
    return response.data;
  },

  async adminUpdateItemQuantity(orderId, itemId, quantity) {
    const response = await axiosClient.patch(
      `/orders/${orderId}/items/quantity`,
      { item_id: itemId, quantity },
      { headers: authHeaders() },
    );
    return response.data;
  },
};