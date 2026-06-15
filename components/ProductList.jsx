import products from '../data/products.json';
import { ProductCard } from './ProductCard';

export const ProductList = () => {
  return (
    <section style={{ padding: '24px' }}>
      <h2>Product Catalog</h2>
      <p>Browse our sample products below.</p>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id} // key is important for React list rendering
            name={product.name}
            price={product.price}
            category={product.category}
            imageUrl={product.imageUrl}
            description={product.description}
          />
        ))}
      </div>
    </section>
  );
};

