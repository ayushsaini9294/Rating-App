import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import SortableTable from '../../components/SortableTable';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const PW_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/;

const BLANK = { name: '', email: '', password: '', address: '', role: 'user' };

const AdminUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/admin/users', { params });
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const validate = () => {
    const e = {};
    if (!form.name)             e.name = 'Name is required';
    else if (form.name.length < 20) e.name = 'Min 20 characters';
    else if (form.name.length > 60) e.name = 'Max 60 characters';
    if (!form.email)            e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)         e.password = 'Password is required';
    else if (!PW_REGEX.test(form.password)) e.password = '8–16 chars, uppercase + special char';
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
      await api.post('/admin/users', form);
      toast.success('User added successfully!');
      setModal(false);
      setForm(BLANK);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add user');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name',    label: 'Name' },
    { key: 'email',   label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'role',    label: 'Role' },
    { key: '_actions', label: 'Actions', sortable: false },
  ];

  const renderRow = (u) => (
    <tr key={u.id}>
      <td style={{ fontWeight: 500 }}>{u.name}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
      <td style={{ color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
      <td>
        <Link to={`/admin/users/${u.id}`} className="btn btn-secondary btn-sm">View</Link>
      </td>
    </tr>
  );

  const inputField = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={`add-user-${key}`}>{label}</label>
      <input
        id={`add-user-${key}`}
        type={type}
        className={`form-control${errors[key] ? ' error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
      />
      {errors[key] && <p className="form-error">⚠ {errors[key]}</p>}
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2>👥 Users</h2>
            <p>Manage all platform users.</p>
          </div>
          <button id="btn-add-user" className="btn btn-primary" onClick={() => { setModal(true); setForm(BLANK); setErrors({}); }}>
            + Add User
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
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={fetchUsers}>Search</button>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /> Loading users…</div>
        ) : (
          <SortableTable columns={columns} data={users} renderRow={renderRow} emptyMsg="No users found." />
        )}

        {/* Add User Modal */}
        <Modal
          isOpen={modal}
          onClose={() => setModal(false)}
          title="Add New User"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button
                id="btn-save-user"
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={saving}
              >
                {saving ? <><span className="spinner" /> Saving…</> : 'Add User'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAdd} noValidate>
            {inputField('name',     'Full Name',  'text',     'Min 20 characters')}
            {inputField('email',    'Email',      'email',    'user@example.com')}
            {inputField('password', 'Password',   'password', '8–16 chars, uppercase + special char')}
            <div className="form-group">
              <label className="form-label" htmlFor="add-user-address">Address</label>
              <textarea
                id="add-user-address"
                className={`form-control${errors.address ? ' error' : ''}`}
                rows={2}
                placeholder="Full address"
                value={form.address}
                onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }}
              />
              {errors.address && <p className="form-error">⚠ {errors.address}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="add-user-role">Role</label>
              <select
                id="add-user-role"
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">Normal User</option>
                <option value="admin">Administrator</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;
