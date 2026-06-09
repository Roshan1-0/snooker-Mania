import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { FOUL_REASONS, getLegalBalls, BALL_VALUES, calculateFoulPenalty } from '../engine/scoringEngine';

const FOUL_LIST = [
  { key: 'WRONG_BALL',      label: 'Wrong ball hit/potted',        icon: '🎱' },
  { key: 'CUE_BALL_POTTED', label: 'Cue ball potted (in-off)',     icon: '⚪' },
  { key: 'NO_CONTACT',      label: 'No contact with object ball',  icon: '💨' },
  { key: 'PUSH_STROKE',     label: 'Push stroke',                  icon: '👋' },
  { key: 'JUMP_SHOT',       label: 'Jump shot',                    icon: '⬆️' },
  { key: 'BALL_OFF_TABLE',  label: 'Ball forced off table',        icon: '🚀' },
  { key: 'WRONG_CUE_BALL',  label: 'Wrong ball used as cue ball',  icon: '❌' },
  { key: 'MANUAL',          label: 'Other foul (manual)',          icon: '📋' },
];

export default function FoulPanel({ isOpen, onClose }) {
  const { frameState, matchConfig, doFoul, closeFoulPanel } = useGameStore();
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedBall, setSelectedBall] = useState(null);

  if (!frameState || !isOpen) return null;

  const legalBalls = getLegalBalls(frameState);
  const ballOnValue = BALL_VALUES[legalBalls[0]] ?? 4;
  const ballInvolvedValue = selectedBall ? (BALL_VALUES[selectedBall] ?? 4) : 4;
  const penalty = calculateFoulPenalty(ballOnValue, ballInvolvedValue);
  const opponentName = matchConfig?.[frameState.currentPlayer === 'player1' ? 'player2Name' : 'player1Name'] ?? 'Opponent';

  const handleConfirmFoul = () => {
    if (!selectedReason) return;
    doFoul(selectedBall, FOUL_REASONS[selectedReason], { ballOnValue, ballInvolvedValue });
    toast.error(`Foul! ${opponentName} gets ${penalty} points.`, { icon: '⚠️', duration: 3000 });
    setSelectedReason(null);
    setSelectedBall(null);
    closeFoulPanel();
    onClose();
  };

  const balls = ['red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  const ballColors = { red: '#dc2626', yellow: '#eab308', green: '#16a34a', brown: '#92400e', blue: '#2563eb', pink: '#ec4899', black: '#333' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #0d2416 0%, #060f06 100%)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: '20px 20px 0 0',
              width: '100%',
              maxWidth: 600,
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '20px 16px 32px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <AlertTriangle color="#dc2626" size={20} />
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'white', flex: 1 }}>
                Register Foul
              </h3>
              <div style={{
                background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700,
              }}>
                Penalty: {penalty} pts → {opponentName}
              </div>
            </div>

            {/* Foul reason */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Foul Type
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7, marginBottom: 16 }}>
              {FOUL_LIST.map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedReason(f.key)}
                  style={{
                    background: selectedReason === f.key ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedReason === f.key ? 'rgba(220,38,38,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, padding: '9px 10px', cursor: 'pointer',
                    color: selectedReason === f.key ? '#fca5a5' : 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 600, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
                  }}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>

            {/* Ball involved */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ball Involved <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — affects penalty)</span>
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {balls.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBall(selectedBall === b ? null : b)}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: ballColors[b],
                    border: selectedBall === b ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', fontSize: '0.62rem', fontWeight: 700,
                    color: b === 'yellow' ? '#000' : 'white',
                    boxShadow: selectedBall === b ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  {BALL_VALUES[b]}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} className="btn-felt" style={{ flex: 1, padding: '12px 0', borderRadius: 10 }}>
                Cancel
              </button>
              <button
                onClick={handleConfirmFoul}
                disabled={!selectedReason}
                className="btn-danger"
                style={{ flex: 2, padding: '12px 0', borderRadius: 10, opacity: selectedReason ? 1 : 0.5 }}
              >
                Confirm Foul — {penalty} pts to {opponentName}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
