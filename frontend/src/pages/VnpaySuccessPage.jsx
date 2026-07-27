import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentsApi } from '../api/paymentsApi';

const VnpaySuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const responseCode = searchParams.get('vnp_ResponseCode');

  const [status, setStatus] = useState('confirming');

  useEffect(() => {
    const confirm = async () => {
      if (!orderId) {
        setStatus('error');
        return;
      }
      if (responseCode !== '00') {
        setStatus('failed');
        return;
      }
      try {
        await paymentsApi.confirm(orderId, 'vnpay');
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    confirm();
  }, [orderId, responseCode]);

  return (
    <section style={{ padding: '24px', textAlign: 'center' }}>
      {status === 'confirming' && <p>Confirming your payment...</p>}

      {status === 'success' && (
        <>
          <h2 style={{ color: 'green' }}>VNPay payment successful</h2>
          <p>Your order has been marked as paid.</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <h2 style={{ color: 'red' }}>Payment failed</h2>
          <p>VNPay reported an unsuccessful transaction (code: {responseCode}).</p>
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

export default VnpaySuccessPage;