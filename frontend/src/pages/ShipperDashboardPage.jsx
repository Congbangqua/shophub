import { useEffect, useState } from 'react';
import { shipperApi } from '../api/shipperApi';

const ShipperDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await shipperApi.getQueue();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (orderId, newStatus) => {
    try {
      await shipperApi.updateStatus(orderId, newStatus);
      fetchQueue();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Loading...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Shipper Dashboard</h2>
      <p>Đơn hàng cần giao (đội xe nội bộ):</p>

      {orders.length === 0 ? (
        <p>Không có đơn nào cần giao.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                width: '260px',
              }}
            >
              <h3>Đơn #{order.id}</h3>
              <p>Trạng thái: {order.status}</p>
              <p>Tổng tiền: ${order.total_amount.toFixed(2)}</p>

              {order.status === 'PROCESSING' && (
                <button
                  onClick={() => handleAction(order.id, 'SHIPPING')}
                  style={{ padding: '8px 12px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                  Nhận giao đơn
                </button>
              )}

              {order.status === 'SHIPPING' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAction(order.id, 'DELIVERED')}
                    style={{ padding: '8px 12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px' }}
                  >
                    Giao thành công
                  </button>
                  <button
                    onClick={() => handleAction(order.id, 'FAILED')}
                    style={{ padding: '8px 12px', backgroundColor: '#c00', color: '#fff', border: 'none', borderRadius: '4px' }}
                  >
                    Giao thất bại
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ShipperDashboardPage;
