import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const UserStoreList = () => {
  const [stores, setStores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ name: '', address: '' });
  const [rateModal, setRateModal] = useState(null); // { storeId, storeName, isUpdate, currentRating }
  const [ratingVal, setRatingVal] = useState(0);
  const [saving, setSaving]       = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/user/stores', { params });
      setStores(data);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRateModal = (store, isUpdate = false) => {
    setRatingVal(isUpdate ? store.user_rating : 0);
    setRateModal({
      storeId:       store.id,
      storeName:     store.name,
      isUpdate,
      currentRating: store.user_rating,
    });
  };

  const handleSubmitRating = async () => {
    if (!ratingVal) return toast.error('Please select a rating');
    setSaving(true);
    try {
      if (rateModal.isUpdate) {
        await api.put(`/user/ratings/${rateModal.storeId}`, { rating: ratingVal });
      } else {
        await api.post('/user/ratings', { store_id: rateModal.storeId, rating: ratingVal });
      }
      toast.success(rateModal.isUpdate ? 'Rating updated!' : 'Rating submitted!');
      setRateModal(null);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save rating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h2>🏪 Browse Stores</h2>
          <p>Discover stores and share your experience by leaving a rating.</p>
        </div>

        {/* Search */}
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              className="form-control"
              placeholder="Search by name…"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-control"
              placeholder="Search by address…"
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchStores}>Search</button>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /> Loading stores…</div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p>No stores found. Try a different search.</p>
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map((s) => (
              <div key={s.id} className="store-card">
                <div className="store-card-name">{s.name}</div>
                <div className="store-card-address">
                  📍 {s.address}
                </div>

                <div className="store-rating-row">
                  <div className="rating-info">
                    <span className="rating-label">Overall Rating</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={s.avg_rating ? Math.round(s.avg_rating) : 0} readonly size="sm" />
                      <span className="avg-value" style={{ fontSize: 18 }}>
                        {s.avg_rating ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="rating-info" style={{ alignItems: 'flex-end' }}>
                    <span className="rating-label">Your Rating</span>
                    {s.user_rating ? (
                      <StarRating value={s.user_rating} readonly size="sm" />
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not rated</span>
                    )}
                  </div>
                </div>

                <div className="store-card-actions">
                  {s.user_rating ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openRateModal(s, true)}
                      style={{ flex: 1 }}
                    >
                      ✏️ Edit Rating
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openRateModal(s, false)}
                      style={{ flex: 1 }}
                    >
                      ⭐ Rate This Store
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        <Modal
          isOpen={!!rateModal}
          onClose={() => setRateModal(null)}
          title={rateModal?.isUpdate ? 'Update Your Rating' : 'Rate This Store'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setRateModal(null)}>Cancel</button>
              <button
                id="btn-submit-rating"
                className="btn btn-primary"
                onClick={handleSubmitRating}
                disabled={saving || !ratingVal}
              >
                {saving ? <><span className="spinner" /> Saving…</> : rateModal?.isUpdate ? 'Update' : 'Submit Rating'}
              </button>
            </>
          }
        >
          <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
            How would you rate <strong style={{ color: 'var(--text-primary)' }}>{rateModal?.storeName}</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ transform: 'scale(1.8)', transformOrigin: 'center' }}>
              <StarRating value={ratingVal} onChange={setRatingVal} />
            </div>
          </div>
          {ratingVal > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 24, fontSize: 14 }}>
              You selected: <strong style={{ color: 'var(--warning)' }}>{ratingVal} / 5</strong>
            </p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UserStoreList;
