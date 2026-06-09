import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, User, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useGameStore from '../store/gameStore';

const FRAME_OPTIONS = [1, 3, 5, 7, 9];

export default function MatchSetupPage() {
  const navigate = useNavigate();
  const { startMatch } = useGameStore();

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [totalFrames, setTotalFrames] = useState(1);
  const [customFrames, setCustomFrames] = useState('');
  const [startingPlayer, setStartingPlayer] = useState('player1');
  const [useCustom, setUseCustom] = useState(false);

  const effectiveFrames = useCustom ? (parseInt(customFrames) || 1) : totalFrames;

  const handleStart = () => {
    const p1 = player1Name.trim() || 'Player 1';
    const p2 = player2Name.trim() || 'Player 2';
    if (p1 === p2) {
      toast.error('Players must have different names!');
      return;
    }
    if (effectiveFrames < 1 || effectiveFrames > 99) {
      toast.error('Frames must be between 1 and 99');
      return;
    }
    startMatch({ player1Name: p1, player2Name: p2, totalFrames: effectiveFrames, startingPlayer });
    navigate('/live');
    toast.success('Match started! Good luck! 🎱', { duration: 3000 });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', marginBottom: 24, fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card"
          style={{ padding: 'clamp(16px, 5vw, 32px)' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎱</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.7rem', color: 'white', marginBottom: 6 }}>
              Match Setup
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Standard 15-red snooker</p>
          </div>

          {/* Player Names */}
          <div className="setup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <PlayerInput
              label="Player 1"
              value={player1Name}
              onChange={setPlayer1Name}
              placeholder="Enter name"
              color="#dc2626"
            />
            <PlayerInput
              label="Player 2"
              value={player2Name}
              onChange={setPlayer2Name}
              placeholder="Enter name"
              color="#2563eb"
            />
          </div>

          {/* Frames selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
              Best Of Frames
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FRAME_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => { setTotalFrames(f); setUseCustom(false); }}
                  style={{
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${!useCustom && totalFrames === f ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    background: !useCustom && totalFrames === f ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                    color: !useCustom && totalFrames === f ? 'var(--gold)' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                style={{
                  padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${useCustom ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background: useCustom ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                  color: useCustom ? 'var(--gold)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
                }}
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 40 }}
                type="number"
                min={1} max={99}
                value={customFrames}
                onChange={e => setCustomFrames(e.target.value)}
                placeholder="Number of frames..."
                style={{
                  marginTop: 10, width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8,
                  color: 'white', padding: '8px 12px', fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            )}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
              First to win {Math.ceil(effectiveFrames / 2)} frame{Math.ceil(effectiveFrames / 2) > 1 ? 's' : ''} wins the match
            </p>
          </div>

          {/* Starting player */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
              Who Breaks First?
            </label>
            <div className="setup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'player1', label: player1Name || 'Player 1', color: '#dc2626' },
                { key: 'player2', label: player2Name || 'Player 2', color: '#2563eb' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setStartingPlayer(p.key)}
                  style={{
                    padding: '12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${startingPlayer === p.key ? p.color + '60' : 'rgba(255,255,255,0.1)'}`,
                    background: startingPlayer === p.key ? p.color + '20' : 'rgba(255,255,255,0.04)',
                    color: startingPlayer === p.key ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600,
                  }}
                >
                  <User size={14} style={{ color: startingPlayer === p.key ? p.color : 'inherit' }} />
                  {p.label}
                  {startingPlayer === p.key && <span style={{ fontSize: '0.65rem', color: p.color }}>🎱 breaks</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
            fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.8,
          }}>
            <strong style={{ color: 'var(--gold)' }}>{player1Name || 'Player 1'}</strong> vs{' '}
            <strong style={{ color: 'var(--gold)' }}>{player2Name || 'Player 2'}</strong>
            {' · '}Best of <strong style={{ color: 'white' }}>{effectiveFrames}</strong> frames
            {' · '}Standard 15-red snooker
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="btn-gold"
            style={{
              width: '100%', padding: '16px 0', borderRadius: 14,
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Play size={18} fill="currentColor" />
            Start Match
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function PlayerInput({ label, value, onChange, placeholder, color }) {
  return (
    <div>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 6 }} />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={20}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${value ? color + '50' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, color: 'white', padding: '10px 14px',
          fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s',
          fontFamily: 'Inter, sans-serif',
        }}
        onFocus={e => { e.target.style.border = `1px solid ${color}80`; e.target.style.boxShadow = `0 0 0 3px ${color}15`; }}
        onBlur={e => { e.target.style.border = `1px solid ${value ? color + '50' : 'rgba(255,255,255,0.1)'}`; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
