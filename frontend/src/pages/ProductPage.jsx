import { useEffect, useState } from 'react';
import { ProductList } from '../components/ProductList';
import { useAuth } from '../auth/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

export const ProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortOption, setSortOption] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productsApi.getAll();
        setProducts(data);
        setFilteredProducts(data);
      } catch (_err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    let updated = [...products];

    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      updated = updated.filter((p) => p.name.toLowerCase().includes(lower));
    }

    if (selectedCategory !== 'All') {
      updated = updated.filter((p) => p.category === selectedCategory);
    }

    if (sortOption === 'price-asc') {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      updated.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updated);
  }, [searchTerm, selectedCategory, sortOption, products]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete product.';
      alert(message);
    }
  };

  const categories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  if (loading) {
    return <p style={{ padding: '24px' }}>Loading products...</p>;
  }

  if (error) {
    return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  }

  return (
    <section style={{ padding: '24px' }}>
      <h2>Product Catalog</h2>
      {isAdmin && (
        <button
          style={{ marginBottom: '16px' }}
          onClick={() => navigate('/admin/products/new')}
        >
          + Create Product
        </button>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '16px',
        }}
      >
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', minWidth: '200px' }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{ padding: '8px' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="none">Sort by price (none)</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            handleCategoryChange('All');
            setSortOption('none');
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#eeeeee',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      <p style={{ marginBottom: '8px', color: '#555' }}>
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <ProductList products={filteredProducts} onDelete={handleDelete} />
    </section>
  );
};
