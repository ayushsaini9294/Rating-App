import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id }                = useParams();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="page-loader"><div className="spinner" /> Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="main-content">
          <p className="text-muted">User not found.</p>
          <Link to="/admin/users" className="btn btn-secondary mt-2">← Back</Link>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Name',    value: user.name },
    { label: 'Email',   value: user.email },
    { label: 'Address', value: user.address },
    { label: 'Role',    value: <span className={`badge badge-${user.role}`}>{user.role}</span> },
  ];

  if (user.role === 'owner') {
    fields.push({
      label: 'Store Rating',
      value: user.store_rating
        ? <><StarRating value={Math.round(user.store_rating)} readonly size="sm" /> <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{user.store_rating}</span></>
        : <span className="text-muted">No ratings yet</span>,
    });
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content" style={{ maxWidth: 640 }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">← Back</Link>
          <div>
            <h2>👤 User Details</h2>
            <p>Viewing profile for {user.name.split(' ')[0]}</p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: 'white'
            }}>
              {user.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user.email}</div>
            </div>
          </div>

          {fields.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>{label}</span>
              <span style={{ fontWeight: 500, maxWidth: 380, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
