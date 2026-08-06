import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken } from '../auth/token';
import { clearUserInfo } from '../auth/userInfo';
const Header = () => {
  const { totalQuantity } = useCart();
  const { isAuthenticated, user, role } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
  clearToken();
  clearUserInfo();
  setMenuOpen(false);
  navigate('/login');
};

  return (
    <header
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h1 style={{ margin: 0 }}>ShopHUB</h1>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart ({totalQuantity})</Link>

        {isAuthenticated ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              title={user?.full_name || user?.email || 'Account'}
            >
              <svg width="36" height="36" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <circle cx="256" cy="256" r="256" fill="#29b6f6" />
                <circle cx="256" cy="196" r="70" fill="#fff" />
                <path
                  d="M128 400c0-60 60-100 128-100s128 40 128 100"
                  stroke="#fff"
                  strokeWidth="34"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  background: '#fff',
                  color: '#000',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {role === 'Admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: '#000',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
                {role === 'Shipper' && (
                <Link
                  to="/shipper/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: '#000',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  Shipper Dashboard
                </Link>
              )}

                {role === 'Shipper' && (
              <>
                <Link
                  to="/shipper/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#000', borderBottom: '1px solid #eee' }}
                >
                  Shipper Dashboard
                </Link>
                <Link
                  to="/shipper/history"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#000', borderBottom: '1px solid #eee' }}
                >
                  Delivery History
                </Link>
              </>
            )}

                  {role === 'Admin' && (
                    <>
                      <Link
                        to="/admin/orders"
                        onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#000', borderBottom: '1px solid #eee' }}
                      >
                        All Orders (Admin)
                      </Link>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#000', borderBottom: '1px solid #eee' }}
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: '#000',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  Order History
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#c00',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
