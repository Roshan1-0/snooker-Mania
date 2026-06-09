import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Home, Settings, X } from 'lucide-react';
import useGameStore from '../store/gameStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchConfig, frameState, resetAll } = useGameStore();
  const hasActiveGame = matchConfig && frameState && !frameState.frameOver;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'rgba(5,17,10,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="navbar-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #dc2626 50%, #7f1d1d)',
            boxShadow: '0 0 12px rgba(220,38,38,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold)', letterSpacing: '-0.01em' }}>
            SNOOKE<span style={{ color: 'white' }}>R</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/" label="Home" icon={<Home size={14} />} active={location.pathname === '/'} />
          {hasActiveGame && (
            <NavLink to="/live" label="Live Game" active={location.pathname === '/live'}
              highlight />
          )}
          <NavLink to="/setup" label="New Match" icon={<Settings size={14} />} active={location.pathname === '/setup'} />
          {hasActiveGame && (
            <button
              onClick={() => { if (confirm('Abandon current match?')) { resetAll(); navigate('/'); } }}
              style={{
                background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                color: '#fca5a5', borderRadius: 8, padding: '4px 10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.75rem', fontWeight: 600,
              }}
            >
              <X size={12} /> Abandon
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, label, icon, active, highlight }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 8, textDecoration: 'none',
        fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
        background: active ? (highlight ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.08)') : 'transparent',
        color: active ? (highlight ? 'var(--gold)' : 'white') : 'var(--text-secondary)',
        border: active ? `1px solid ${highlight ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.12)'}` : '1px solid transparent',
      }}
    >
      {icon}<span className="navbar-label">{label}</span>
    </Link>
  );
}
