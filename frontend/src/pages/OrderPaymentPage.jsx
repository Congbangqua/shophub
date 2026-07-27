import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { paymentsApi } from '../api/paymentsApi';

const OrderPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('stripe');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ordersApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    setError('');

    try {
      if (method === 'stripe') {
        const { url } = await paymentsApi.createStripeSession(order.id);
        window.location.href = url;
      } else if (method === 'paypal') {
        const { approve_url } = await paymentsApi.createPaypalOrder(order.id);
        window.location.href = approve_url;
       } else if (method === 'vnpay') {
        const { url } = await paymentsApi.createVnpayUrl(order.id);
        window.location.href = url;
      }
    } catch (err) {
      setError('Failed to start payment. Please try again.');
      setPaying(false);
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Loading order...</p>;
  if (error && !order) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!order) return <p style={{ padding: '24px' }}>Order not found.</p>;

  if (order.status === 'PAID') {
    return (
      <section style={{ padding: '24px' }}>
        <h2>Order #{order.id}</h2>
        <p style={{ color: 'green', fontWeight: 'bold' }}>Order already paid.</p>
        <Link to={`/orders/${order.id}`}>← Back to Order Details</Link>
      </section>
    );
  }

  return (
    <section style={{ padding: '24px', maxWidth: '480px' }}>
      <h2>Pay for Order #{order.id}</h2>
      <p>Total: <strong>${order.total_amount.toFixed(2)}</strong></p>
      <p>Status: {order.status}</p>

      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="radio"
            name="method"
            value="stripe"
            checked={method === 'stripe'}
            onChange={(e) => setMethod(e.target.value)}
          />{' '}
          Stripe
        </label>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="radio"
            name="method"
            value="paypal"
            checked={method === 'paypal'}
            onChange={(e) => setMethod(e.target.value)}
          />{' '}
          PayPal
        </label>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="radio"
            name="method"
            value="vnpay"
            checked={method === 'vnpay'}
            onChange={(e) => setMethod(e.target.value)}
          />{' '}
          VNPay
        </label>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handlePayNow}
        disabled={paying}
        style={{
          padding: '10px 20px',
          backgroundColor: '#635bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {paying ? 'Redirecting...' : 'Pay Now'}
      </button>

      <div style={{ marginTop: '16px' }}>
        <Link to={`/orders/${order.id}`}>← Back to Order Details</Link>
      </div>
    </section>
  );
};

export default OrderPaymentPage;