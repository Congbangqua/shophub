import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';
import { productImages } from '../data/productImages';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startEdit = () => {
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      stock: product.stock,
      hasDiscount: product.discount_percent > 0,
      discountPercent: product.discount_percent > 0 ? product.discount_percent : 20,
    });
    setSaveError('');
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        category: editForm.category,
        description: editForm.description,
        imageUrl: editForm.imageUrl,
        stock: parseInt(editForm.stock, 10),
        discount_percent: editForm.hasDiscount ? parseInt(editForm.discountPercent, 10) : 0,
      };
      const updated = await productsApi.update(id, payload);
      setProduct(updated);
      setEditMode(false);
    } catch (err) {
      setSaveError('Failed to save changes. Please check your input.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.discounted_price,
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
  const hasDiscount = product.discount_percent > 0;

  // ---- CHẾ ĐỘ CHỈNH SỬA (chỉ admin) ----
  if (editMode) {
    return (
      <section style={{ padding: '24px', maxWidth: '480px' }}>
        <h2>Edit Product</h2>

        <div style={{ marginBottom: '12px' }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={editForm.price}
            onChange={handleEditChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={editForm.category}
            onChange={handleEditChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Description</label>
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Product Image</label>
          <select
            name="imageUrl"
            value={editForm.imageUrl}
            onChange={handleEditChange}
            style={{ width: '100%', padding: '8px' }}
          >
            {productImages.map((img) => (
              <option key={img.path} value={img.path}>
                {img.label}
              </option>
            ))}
          </select>
          {editForm.imageUrl && (
            <img
              src={editForm.imageUrl}
              alt="Preview"
              style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Stock Quantity</label>
          <input
            type="number"
            name="stock"
            min="0"
            value={editForm.stock}
            onChange={handleEditChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            <input
              type="checkbox"
              checked={editForm.hasDiscount}
              onChange={(e) => setEditForm((prev) => ({ ...prev, hasDiscount: e.target.checked }))}
            />{' '}
            Apply discount
          </label>

          {editForm.hasDiscount && (
            <select
              value={editForm.discountPercent}
              onChange={(e) => setEditForm((prev) => ({ ...prev, discountPercent: e.target.value }))}
              style={{ display: 'block', marginTop: '8px', padding: '8px' }}
            >
              <option value={20}>20%</option>
              <option value={25}>25%</option>
              <option value={30}>30%</option>
              <option value={35}>35%</option>
              <option value={40}>40%</option>
              <option value={45}>45%</option>
              <option value={50}>50%</option>
            </select>
          )}
        </div>

        {saveError && <p style={{ color: 'red' }}>{saveError}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setEditMode(false)}
            style={{ padding: '8px 16px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  // ---- CHẾ ĐỘ XEM BÌNH THƯỜNG ----
  return (
    <section style={{ padding: '24px' }}>
      <Link to="/products" style={{ display: 'inline-block', marginBottom: '16px' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '8px' }}
        />
        <div>
          <h2>{product.name}</h2>
          <p style={{ color: '#757575' }}>{product.category}</p>

          {hasDiscount ? (
            <p style={{ fontSize: '1.5rem' }}>
              <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                ${product.price.toFixed(2)}
              </span>
              <span style={{ fontWeight: 'bold', color: '#c00' }}>
                ${product.discounted_price.toFixed(2)}
              </span>
              <span style={{ marginLeft: '8px', fontSize: '1rem', color: '#c00' }}>
                (-{product.discount_percent}%)
              </span>
            </p>
          ) : (
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
          )}

          <p style={{ marginTop: '12px' }}>{product.description}</p>
          <p style={{ color: outOfStock ? '#c00' : '#999', marginTop: '8px' }}>
            {outOfStock ? 'Out of stock' : `Stock: ${product.stock} left`}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              style={{
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

            {isAdmin && (
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={startEdit}
              >
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
