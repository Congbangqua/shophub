export const ProductCard = ({ name, price, category, imageUrl, description }) => {
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
      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#555' }}>{description}</p>
      <button
        style={{
          marginTop: 'auto',
          padding: '8px 12px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        View Details
      </button>
    </div>
  );
};

