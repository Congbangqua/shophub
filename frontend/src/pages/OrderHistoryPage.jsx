import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ordersApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading orders...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  if (orders.length === 0) {
    return (
      <section style={{ padding: '24px' }}>
        <h2>Order History</h2>
        <p>You have not placed any orders yet.</p>
      </section>
    );
  }

  return (
    <section style={{ padding: '24px' }}>
      <h2>Order History</h2>
      <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Order #</th>
            <th align="center">Status</th>
            <th align="center">Total</th>
            <th align="center">Date</th>
            <th align="center">Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>#{o.id}</td>
              <td align="center">{o.status}</td>
              <td align="center">${o.total_amount.toFixed(2)}</td>
              <td align="center">{new Date(o.created_at).toLocaleString()}</td>
              <td align="center">
                <Link to={`/orders/${o.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default OrderHistoryPage;