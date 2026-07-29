import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const products = await productsApi.getAll();
        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category)),
        );
        setCategories(uniqueCategories);
      } catch (_err) {
        setError('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section style={{ padding: '24px', textAlign: 'center' }}>
      <h2>Shop by Category</h2>

      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p>No categories available yet.</p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '24px',
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/products?category=${encodeURIComponent(cat)}`}
            style={{
              display: 'block',
              width: '200px',
              padding: '32px 16px',
              backgroundColor: '#f7f7f7',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.15s ease',
            }}
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
};

export const NotFound = () => {
  return (
    <>
      <h2>404 PAGE</h2>
      <h3>Your request page doesn't exist.</h3>
    </>
  );
};
