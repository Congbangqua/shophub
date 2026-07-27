import { useState } from 'react';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        email: form.email,
        full_name: form.fullName,
        password: form.password,
      };
      await authApi.register(payload);
      setSuccessMessage('Registration successful! You can now log in.');
      setForm({ email: '', fullName: '', password: '' });
    } catch (_err) {
      setError('Registration failed. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Register</h2>
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
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
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
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      {successMessage && (
        <p style={{ color: 'green', marginTop: '12px' }}>{successMessage}</p>
      )}
    </section>
  );
};

export default RegisterPage;
