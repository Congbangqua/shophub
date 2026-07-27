import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminStatsApi } from '../api/adminStatsApi';

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  backgroundColor: '#f7f7f7',
  textAlign: 'center',
};

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewData, monthlyData] = await Promise.all([
          adminStatsApi.getOverview(),
          adminStatsApi.getMonthlyRevenue(),
        ]);

        setOverview(overviewData);

        const merged = monthlyData.months.map((month, i) => ({
          month,
          revenue: monthlyData.revenues[i],
        }));
        setChartData(merged);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading dashboard...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Admin Dashboard</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '20px',
          marginBottom: '32px',
        }}
      >
        <div style={cardStyle}>
          <h3>Total Products</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{overview.total_products}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{overview.total_orders}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>
            ${overview.total_revenue.toFixed(2)}
          </p>
        </div>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{overview.total_users}</p>
        </div>
      </div>

      <h3>Monthly Revenue</h3>
      {chartData.length === 0 ? (
        <p style={{ color: '#777' }}>No revenue data yet.</p>
      ) : (
        <div style={{ width: '100%', height: 320, marginTop: '16px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default AdminDashboardPage;