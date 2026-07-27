import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setToken } from '../auth/token';
import { setUserInfo } from '../auth/userInfo';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
      };
      const result = await authApi.login(payload);
      setToken(result.access_token);
      setUserInfo(result.user);
      navigate('/products');
    } catch (_err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{ padding: '8px 16px' }}
        >
          Register
        </button>
        </div>
      </form>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
    </section>
  );
};

export default LoginPage;
