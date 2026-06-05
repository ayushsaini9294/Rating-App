import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="page-loader"><div className="spinner" /> Loading…</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h2>🏠 Admin Dashboard</h2>
          <p>Platform-wide overview at a glance.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo">👥</div>
            <div className="stat-body">
              <div className="stat-value">{stats?.totalUsers ?? 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🏪</div>
            <div className="stat-body">
              <div className="stat-value">{stats?.totalStores ?? 0}</div>
              <div className="stat-label">Total Stores</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald">⭐</div>
            <div className="stat-body">
              <div className="stat-value">{stats?.totalRatings ?? 0}</div>
              <div className="stat-label">Total Ratings</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="/admin/users"  className="btn btn-secondary">👥 Manage Users</a>
              <a href="/admin/stores" className="btn btn-secondary">🏪 Manage Stores</a>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Platform Health</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avg ratings per store</span>
                <span style={{ fontWeight: 600 }}>
                  {stats?.totalStores ? (stats.totalRatings / stats.totalStores).toFixed(1) : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total stores registered</span>
                <span style={{ fontWeight: 600 }}>{stats?.totalStores ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
