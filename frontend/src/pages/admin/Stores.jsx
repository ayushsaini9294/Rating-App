import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import SortableTable from '../../components/SortableTable';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const BLANK_STORE = { name: '', email: '', address: '', owner_id: '' };

const AdminStores = () => {
  const [stores, setStores]   = useState([]);
  const [owners, setOwners]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(BLANK_STORE);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/admin/stores', { params });
      setStores(data);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  // Load store owners for dropdown
  useEffect(() => {
    api.get('/admin/users', { params: { role: 'owner' } })
      .then(({ data }) => setOwners(data))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name)             e.name = 'Name is required';
    if (!form.email)            e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.address)          e.address = 'Address is required';
    else if (form.address.length > 400) e.address = 'Max 400 characters';
    return e;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setSaving(true);
    try {
      await api.post('/admin/stores', { ...form, owner_id: form.owner_id || null });
      toast.success('Store added successfully!');
      setModal(false);
      setForm(BLANK_STORE);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add store');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name',       label: 'Store Name' },
    { key: 'email',      label: 'Email' },
    { key: 'address',    label: 'Address' },
    { key: 'avg_rating', label: 'Rating' },
  ];

  const renderRow = (s) => (
    <tr key={s.id}>
      <td style={{ fontWeight: 600 }}>{s.name}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
      <td>
        {s.avg_rating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating value={Math.round(s.avg_rating)} readonly size="sm" />
            <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{s.avg_rating}</span>
          </div>
        ) : (
          <span className="text-muted">Not rated</span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2>🏪 Stores</h2>
            <p>Manage all registered stores on the platform.</p>
          </div>
          <button
            id="btn-add-store"
            className="btn btn-primary"
            onClick={() => { setModal(true); setForm(BLANK_STORE); setErrors({}); }}
          >
            + Add Store
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          {['name', 'email', 'address'].map((f) => (
            <div className="form-group" key={f}>
              <label className="form-label">{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input
                className="form-control"
                placeholder={`Filter by ${f}`}
                value={filters[f]}
                onChange={(e) => setFilters({ ...filters, [f]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-secondary" onClick={fetchStores}>Search</button>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /> Loading stores…</div>
        ) : (
          <SortableTable columns={columns} data={stores} renderRow={renderRow} emptyMsg="No stores found." />
        )}

        {/* Add Store Modal */}
        <Modal
          isOpen={modal}
          onClose={() => setModal(false)}
          title="Add New Store"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button
                id="btn-save-store"
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={saving}
              >
                {saving ? <><span className="spinner" /> Saving…</> : 'Add Store'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAdd} noValidate>
            {[
              { key: 'name',  label: 'Store Name', placeholder: 'Full store name' },
              { key: 'email', label: 'Store Email', placeholder: 'store@example.com' },
            ].map(({ key, label, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label" htmlFor={`store-${key}`}>{label}</label>
                <input
                  id={`store-${key}`}
                  type={key === 'email' ? 'email' : 'text'}
                  className={`form-control${errors[key] ? ' error' : ''}`}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
                />
                {errors[key] && <p className="form-error">⚠ {errors[key]}</p>}
              </div>
            ))}

            <div className="form-group">
              <label className="form-label" htmlFor="store-address">Address</label>
              <textarea
                id="store-address"
                className={`form-control${errors.address ? ' error' : ''}`}
                rows={2}
                placeholder="Store location address"
                value={form.address}
                onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }}
              />
              {errors.address && <p className="form-error">⚠ {errors.address}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="store-owner">Owner (optional)</label>
              <select
                id="store-owner"
                className="form-control"
                value={form.owner_id}
                onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
              >
                <option value="">— No owner assigned —</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminStores;
