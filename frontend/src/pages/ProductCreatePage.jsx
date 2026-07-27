import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useAuth } from '../auth/useAuth';

const ProductCreatePage = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { role } = useAuth();
  

  // Bảo vệ route: nếu không phải admin thì không cho vào
  if (role !== 'Admin') {
    return (
      <section style={{ padding: '24px' }}>
        <p>You do not have permission to access this page.</p>
      </section>
    );
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        stock: parseInt(form.stock, 10),
      };
      await productsApi.create(payload);
      navigate('/products');
    } catch (err) {
      setError('Failed to create product. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h2>Create New Product</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Image URL</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Stock Quantity</label>
          <input
            type="number"
            name="stock"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
    </section>
  );
};

export default ProductCreatePage;