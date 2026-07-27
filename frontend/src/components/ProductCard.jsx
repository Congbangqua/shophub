import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ id, name, price, category, imageUrl, warranty, onDelete }) => {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, name, price, imageUrl }, 1);
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
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>${price}</p>
      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#555' }}>{warranty}</p>

      <button
        onClick={handleAddToCart}
        style={{
          padding: '8px 12px',
          backgroundColor: '#2e7d32',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Add to Cart
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