import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LogoutConfirm from './LogoutConfirm';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showLogout, setShowLogout] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/shop?search=${query.trim()}` : '/shop');
  }

  function confirmLogout() {
    setShowLogout(false);
    logout();
    navigate('/');
  }

  return (
    <>

      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">Techtide</Link>

          <form className="nav-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>

            {user ? (
              <>
                <NavLink to="/orders">Orders</NavLink>
                {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                <button
                  className="nav-link-btn"
                  onClick={() => {
                    console.log('LOG OUT CLICKED');
                    setShowLogout(true);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <NavLink to="/register" className="btn btn-outline btn-sm">
                  Sign up
                </NavLink>
              </>
            )}

            <NavLink to="/cart" className="nav-cart">
              Cart
              {itemCount > 0 && <span className="nav-cart-count">{itemCount}</span>}
            </NavLink>
          </nav>
        </div>
      </header>

      <LogoutConfirm
        open={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}