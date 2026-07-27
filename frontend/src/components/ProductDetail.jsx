import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';

export const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            // ✅ Find product from local JSON instead of axios
            const found = productsData.find(p => p.id === parseInt(id));

            if (!found) {
                setError('Product not found.');
            } else {
                setProduct(found);
            }
        } catch (_err) {
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    }, [id]);
    const { addToCart } = useCart();
     const handleAddToCart = () => {
        if (!product) return;
        addToCart(
            {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
            },
            1,
        );
    };

    if (loading) return <p style={{ padding: '24px' }}>Loading product details...</p>;
    if (error)   return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
    if (!product) return <p style={{ padding: '24px' }}>Product not found.</p>;

    return (
        <section style={{ padding: '24px' }}>
            <Link to="/products" style={{ display: 'inline-block', marginBottom: '16px' }}>
                ← Back to Products
            </Link>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <img
                    src={product.imageUrl}      // ✅ your field name
                    alt={product.name}
                    style={{
                        width: '280px',
                        height: '280px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                    }}
                />
                <div>
                    <h2>{product.name}</h2>           {/* ✅ "name" not "title" */}
                    <p style={{ color: '#757575' }}>{product.category}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ${product.price}
                    </p>
                    <p style={{ marginTop: '12px' }}>{product.description}</p>
                    <p style={{ color: '#999', marginTop: '8px' }}>
                        Stock: {product.stock} left
                    </p>
                    <button
                        style={{
                            marginTop: '16px',
                            padding: '10px 16px',
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                         onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </section>
    );
};