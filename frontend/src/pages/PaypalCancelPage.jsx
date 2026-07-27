import { useSearchParams, Link } from 'react-router-dom';

const PaypalCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <section style={{ padding: '24px', textAlign: 'center' }}>
      <h2 style={{ color: '#c00' }}>PayPal payment canceled</h2>
      <p>You canceled the PayPal checkout. No charge was made.</p>

      {orderId && (
        <p style={{ marginTop: '16px' }}>
          <Link to={`/orders/${orderId}/payment`}>← Back to Payment Page</Link>
        </p>
      )}
    </section>
  );
};

export default PaypalCancelPage;