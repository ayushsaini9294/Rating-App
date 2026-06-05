import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = {
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Stores', to: '/admin/stores' },
  ],
  user: [
    { label: 'Browse Stores', to: '/stores' },
    { label: 'Change Password', to: '/change-password' },
  ],
  owner: [
    { label: 'My Store', to: '/owner' },
    { label: 'Change Password', to: '/change-password' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = links[user?.role] || [];

  const initials = user?.name
    ? user.name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">⭐</div>
          <span>RateMyStore</span>
        </Link>

        <div className="navbar-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${pathname === to ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <span className={`role-chip ${user?.role}`}>{user?.role}</span>
          </div>
          <button id="btn-logout" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
