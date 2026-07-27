import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalQuantity, totalPrice, clearCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setPlacingOrder(true);
    setError('');

    try {
      const order = await ordersApi.checkout(items);
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <section style={{ padding: '24px' }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty. Start adding somae products!</p>
      </section>
    );
  }

  return (
    <section style={{ padding: '24px' }}>
      <h2>Your Cart</h2>
      <p>
        Total items: <strong>{totalQuantity}</strong> | Total price:{' '}
        <strong>${totalPrice.toFixed(2)}</strong>
      </p>

      <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Product</th>
            <th align="center">Price</th>
            <th align="center">Quantity</th>
            <th align="center">Subtotal</th>
            <th align="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <span>{item.name}</span>
                </div>
              </td>
              <td align="center">${item.price.toFixed(2)}</td>
              <td align="center">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 8px', marginRight: '4px' }}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px', marginLeft: '4px' }}>
                  +
                </button>
              </td>
              <td align="center">${(item.price * item.quantity).toFixed(2)}</td>
              <td align="center">
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ padding: '4px 8px', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button onClick={clearCart} style={{ padding: '8px 16px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Clear Cart
        </button>
        <button
          onClick={handleCheckout}
          disabled={placingOrder}
          style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          {placingOrder ? 'Placing Order...' : 'Checkout'}
        </button>
      </div>
    </section>
  );
};

export default CartPage;