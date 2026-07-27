import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ordersApi.getAllForAdmin();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading orders...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Admin – Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
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
                  <Link to={`/admin/orders/${o.id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default AdminOrdersPage;