import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ id, name, price, category, imageUrl, stock, discount_percent, discounted_price, onDelete }) => {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const { addToCart } = useCart();
  const outOfStock = stock <= 0;
  const hasDiscount = discount_percent > 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({ id, name, price: discounted_price, imageUrl, stock }, 1);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <img
        src={imageUrl}
        alt={name}
        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px' }}
      />
      <h3 style={{ margin: '4px 0' }}>{name}</h3>
      <p style={{ margin: '4px 0', color: '#757575' }}>{category}</p>

      {hasDiscount ? (
        <div style={{ margin: '4px 0' }}>
          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
            ${price.toFixed(2)}
          </span>
          <span style={{ fontWeight: 'bold', color: '#c00' }}>
            ${discounted_price.toFixed(2)}
          </span>
          <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#c00' }}>
            -{discount_percent}%
          </span>
        </div>
      ) : (
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>${price.toFixed(2)}</p>
      )}

      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: outOfStock ? '#c00' : '#555' }}>
        {outOfStock ? 'Out of stock' : `In stock: ${stock}`}
      </p>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        style={{
          padding: '8px 12px',
          backgroundColor: outOfStock ? '#bbb' : '#2e7d32',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: outOfStock ? 'not-allowed' : 'pointer',
        }}
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>

      <Link
        to={`/products/${id}`}
        style={{
          padding: '8px 12px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        View Details
      </Link>

      {isAdmin && (
        <button
          style={{
            backgroundColor: 'red',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      )}
    </div>
  );
};
