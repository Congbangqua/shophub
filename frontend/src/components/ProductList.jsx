import { ProductCard } from './ProductCard';

export const ProductList = ({ products, onDelete }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          category={product.category}
          imageUrl={product.imageUrl}
          stock={product.stock}
          discount_percent={product.discount_percent}
          discounted_price={product.discounted_price}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
