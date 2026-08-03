import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';
import { shippingApi } from '../api/shippingApi';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalQuantity, totalPrice, clearCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState('IN_HOUSE');
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [address, setAddress] = useState({
    to_name: '',
    to_phone: '',
    to_address: '',
    to_district_id: '',
    to_ward_code: '',
  });

  const handleMethodChange = (value) => {
    setShippingMethod(value);
    setShippingFee(0);
    setError('');
  };

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCalculateFee = async () => {
    if (!address.to_district_id || !address.to_ward_code) {
      setError('Vui lòng nhập đủ mã quận/huyện và mã phường/xã.');
      return;
    }
    setCalculatingFee(true);
    setError('');
    try {
      const weight = totalQuantity * 200;
      const { fee } = await shippingApi.calculateFee({
        to_district_id: parseInt(address.to_district_id, 10),
        to_ward_code: address.to_ward_code,
        weight,
      });
      setShippingFee(fee);
    } catch (err) {
      setError('Không tính được phí ship. Kiểm tra lại mã quận/huyện, phường/xã.');
    } finally {
      setCalculatingFee(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (shippingMethod === 'GHN') {
      if (!address.to_name || !address.to_phone || !address.to_address || shippingFee === 0) {
        setError('Vui lòng điền địa chỉ và tính phí ship trước khi đặt hàng.');
        return;
      }
    }

    setPlacingOrder(true);
    setError('');

    try {
      const order = await ordersApi.checkout({
        items,
        shippingProvider: shippingMethod,
        shippingFee,
        address,
      });
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
        <p>Your cart is empty. Start adding some products!</p>
      </section>
    );
  }

  const grandTotal = totalPrice + shippingFee;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Your Cart</h2>
      <p>
        Total items: <strong>{totalQuantity}</strong> | Subtotal:{' '}
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

      <div style={{ marginTop: '24px', maxWidth: '480px' }}>
        <h3>Phương thức vận chuyển</h3>

        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="radio"
            name="shippingMethod"
            value="IN_HOUSE"
            checked={shippingMethod === 'IN_HOUSE'}
            onChange={() => handleMethodChange('IN_HOUSE')}
          />{' '}
          Giao hàng hoả tốc (Cửa hàng tự giao) — miễn phí ship
        </label>

        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="radio"
            name="shippingMethod"
            value="GHN"
            checked={shippingMethod === 'GHN'}
            onChange={() => handleMethodChange('GHN')}
          />{' '}
          Giao hàng tiết kiệm (GHN)
        </label>

        {shippingMethod === 'GHN' && (
          <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label>Họ tên người nhận</label>
              <input
                type="text"
                name="to_name"
                value={address.to_name}
                onChange={handleAddressChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label>Số điện thoại</label>
              <input
                type="text"
                name="to_phone"
                value={address.to_phone}
                onChange={handleAddressChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label>Địa chỉ</label>
              <input
                type="text"
                name="to_address"
                value={address.to_address}
                onChange={handleAddressChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label>Mã quận/huyện (GHN district_id)</label>
              <input
                type="number"
                name="to_district_id"
                value={address.to_district_id}
                onChange={handleAddressChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label>Mã phường/xã (GHN ward_code)</label>
              <input
                type="text"
                name="to_ward_code"
                value={address.to_ward_code}
                onChange={handleAddressChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <button
              onClick={handleCalculateFee}
              disabled={calculatingFee}
              style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              {calculatingFee ? 'Đang tính...' : 'Tính phí ship'}
            </button>

            {shippingFee > 0 && (
              <p style={{ marginTop: '8px', color: '#2e7d32' }}>
                Phí ship: <strong>{shippingFee.toLocaleString()} VND</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <p style={{ marginTop: '16px', fontSize: '1.2rem' }}>
        Tổng cộng: <strong>${grandTotal.toFixed(2)}</strong>
      </p>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
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
