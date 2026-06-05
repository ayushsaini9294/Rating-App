import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PW_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/;

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', address: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name)                   e.name = 'Name is required';
    else if (form.name.trim().length < 20) e.name = 'Name must be at least 20 characters';
    else if (form.name.length > 60)   e.name = 'Name cannot exceed 60 characters';

    if (!form.email)            e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';

    if (!form.password)         e.password = 'Password is required';
    else if (!PW_REGEX.test(form.password))
      e.password = '8–16 chars, must include one uppercase letter and one special character';

    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    if (!form.address)          e.address = 'Address is required';
    else if (form.address.length > 400) e.address = 'Address cannot exceed 400 characters';

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        address: form.address.trim(),
      });
      login(data.user, data.token);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/stores');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const textField = (key, label, placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={`signup-${key}`}>{label}</label>
      <input
        id={`signup-${key}`}
        type="text"
        className={`form-control${errors[key] ? ' error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
      />
      {errors[key] && <p className="form-error">⚠ {errors[key]}</p>}
    </div>
  );

  const passwordField = (key, label, placeholder, show, toggleShow) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`signup-${key}`}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={`signup-${key}`}
          type={show ? 'text' : 'password'}
          className={`form-control${errors[key] ? ' error' : ''}`}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={toggleShow}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {errors[key] && <p className="form-error">⚠ {errors[key]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-icon">⭐</div>
          <h1>Create Account</h1>
          <p>Join RateMyStore today</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {textField('name', 'Full Name', 'Your full name')}

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className={`form-control${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
            />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          {passwordField('password', 'Password', '8–16 chars, uppercase + special char', showPw, () => setShowPw(v => !v))}
          {passwordField('confirmPassword', 'Confirm Password', 'Repeat your password', showConfirm, () => setShowConfirm(v => !v))}

          <div className="form-group">
            <label className="form-label" htmlFor="signup-address">Address</label>
            <textarea
              id="signup-address"
              className={`form-control${errors.address ? ' error' : ''}`}
              placeholder="Your full address"
              rows={3}
              value={form.address}
              onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }}
              style={{ resize: 'vertical' }}
            />
            {errors.address && <p className="form-error">⚠ {errors.address}</p>}
          </div>

          <button
            id="btn-signup"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
