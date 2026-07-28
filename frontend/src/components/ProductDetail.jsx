import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (_err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      1,
    );
  };

  if (loading) return <p style={{ padding: '24px' }}>Loading product details...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!product) return <p style={{ padding: '24px' }}>Product not found.</p>;

  const outOfStock = product.stock <= 0;

  return (
    <section style={{ padding: '24px' }}>
      <Link to="/products" style={{ display: 'inline-block', marginBottom: '16px' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '280px',
            height: '280px',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
        <div>
          <h2>{product.name}</h2>
          <p style={{ color: '#757575' }}>{product.category}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${product.price}
          </p>
          <p style={{ marginTop: '12px' }}>{product.description}</p>
          <p style={{ color: outOfStock ? '#c00' : '#999', marginTop: '8px' }}>
            {outOfStock ? 'Out of stock' : `Stock: ${product.stock} left`}
          </p>
          <button
            style={{
              marginTop: '16px',
              padding: '10px 16px',
              backgroundColor: outOfStock ? '#bbb' : '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </section>
  );
};
