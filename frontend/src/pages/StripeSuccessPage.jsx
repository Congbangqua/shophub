import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentsApi } from '../api/paymentsApi';

const StripeSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('confirming'); // confirming | success | error

  useEffect(() => {
    const confirm = async () => {
      if (!orderId) {
        setStatus('error');
        return;
      }
      try {
        await paymentsApi.confirm(orderId, 'stripe');
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    confirm();
  }, [orderId]);

  return (
    <section style={{ padding: '24px', textAlign: 'center' }}>
      {status === 'confirming' && <p>Confirming your payment...</p>}

      {status === 'success' && (
        <>
          <h2 style={{ color: 'green' }}>Stripe payment successful</h2>
          <p>Your order has been marked as paid.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h2 style={{ color: 'red' }}>Could not confirm payment</h2>
          <p>Please check your order status or try again.</p>
        </>
      )}

      {orderId && (
        <p style={{ marginTop: '16px' }}>
          <Link to={`/orders/${orderId}`}>View Order Details</Link>
        </p>
      )}
    </section>
  );
};

export default StripeSuccessPage;