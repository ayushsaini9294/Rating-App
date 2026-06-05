import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (!pwRegex.test(form.newPassword))
      e.newPassword = '8-16 chars, must have one uppercase and one special character';
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, placeholder) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`pw-${key}`}>{label}</label>
      <input
        id={`pw-${key}`}
        type="password"
        className={`form-control${errors[key] ? ' error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => {
          setForm({ ...form, [key]: e.target.value });
          setErrors({ ...errors, [key]: '' });
        }}
      />
      {errors[key] && <p className="form-error">⚠ {errors[key]}</p>}
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="change-pw-page">
          <div className="page-header">
            <h2>🔒 Change Password</h2>
            <p>Keep your account secure with a strong password.</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              {field('currentPassword', 'Current Password', 'Enter your current password')}
              {field('newPassword', 'New Password', '8-16 chars, uppercase + special char')}
              {field('confirmPassword', 'Confirm New Password', 'Repeat new password')}
              <button id="btn-change-pw" type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Updating…</> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
