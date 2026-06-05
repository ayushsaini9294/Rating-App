import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
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

  const columns = [
    { key: 'name',       label: 'Customer Name' },
    { key: 'email',      label: 'Email' },
    { key: 'rating',     label: 'Rating Given' },
    { key: 'created_at', label: 'Date' },
  ];

  const renderRow = (r) => (
    <tr key={r.id}>
      <td style={{ fontWeight: 600 }}>{r.name}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{r.email}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating value={r.rating} readonly size="sm" />
          <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{r.rating}</span>
        </div>
      </td>
      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        {new Date(r.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
      </td>
    </tr>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h2>🏪 {data?.store?.name ?? 'My Store'} — Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {data?.store?.address}
          </p>
        </div>

        {!data?.store ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p>No store is currently linked to your account. Contact an admin.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Average rating hero */}
            <div className="avg-rating-hero">
              <div className="avg-rating-number">
                {data.avgRating ?? '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
                <StarRating
                  value={data.avgRating ? Math.round(data.avgRating) : 0}
                  readonly
                />
              </div>
              <div className="avg-rating-label">
                Average rating from {data.raters.length} customer{data.raters.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Raters table */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customer Reviews</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {data.raters.length} rating{data.raters.length !== 1 ? 's' : ''} total
                </span>
              </div>
              <SortableTable
                columns={columns}
                data={data.raters}
                renderRow={renderRow}
                emptyMsg="No ratings received yet."
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
