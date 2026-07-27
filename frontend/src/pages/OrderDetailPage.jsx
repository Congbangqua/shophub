import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';

const ALLOWED_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const updated = await ordersApi.adminUpdateStatus(order.id, newStatus);
      setOrder(updated);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleAdminUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return;
    try {
      const updated = await ordersApi.adminUpdateItemQuantity(order.id, itemId, newQty);
      setOrder(updated);
    } catch {
      alert('Failed to update quantity');
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Loading order...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!order) return <p style={{ padding: '24px' }}>Order not found.</p>;

  return (
    <section style={{ padding: '24px' }}>
      <Link to={isAdmin ? '/admin/orders' : '/orders'} style={{ display: 'inline-block', marginBottom: '16px' }}>
        ← Back to Orders
      </Link>
      <h2>Order #{order.id}</h2>

      <p>
        Status:{' '}
        {isAdmin ? (
          <select value={order.status} onChange={handleStatusChange}>
            {ALLOWED_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        ) : (
          order.status
        )}
      </p>
      <p>Total: ${order.total_amount.toFixed(2)}</p>
      {order.status !== 'PAID' && !isAdmin && (
      <p>
        <Link to={`/orders/${order.id}/payment`}>Pay Now</Link>
      </p>
      )}
      <p>Date: {new Date(order.created_at).toLocaleString()}</p>

      <h3 style={{ marginTop: '16px' }}>Items</h3>
      <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Product</th>
            <th align="center">Price</th>
            <th align="center">Quantity</th>
            <th align="center">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.product_name}</td>
              <td align="center">${item.product_price.toFixed(2)}</td>
              <td align="center">
                {isAdmin ? (
                  <>
                    <button onClick={() => handleAdminUpdateQuantity(item.id, item.quantity - 1)} style={{ padding: '2px 8px', marginRight: '4px' }}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleAdminUpdateQuantity(item.id, item.quantity + 1)} style={{ padding: '2px 8px', marginLeft: '4px' }}>
                      +
                    </button>
                  </>
                ) : (
                  item.quantity
                )}
              </td>
              <td align="center">${item.line_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default OrderDetailPage;