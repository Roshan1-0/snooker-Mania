import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useGameStore from '../store/gameStore';
import { getLegalBalls, BALL_VALUES, FOUL_REASONS } from '../engine/scoringEngine';

const BALL_CONFIG = {
  red:    { label: 'Red',    pts: 1, cls: 'ball-red',    glow: 'rgba(220,38,38,0.6)',   textColor: 'white',   tileBg: 'rgba(220,38,38,0.18)',   tileBorder: 'rgba(220,38,38,0.45)' },
  yellow: { label: 'Yellow', pts: 2, cls: 'ball-yellow', glow: 'rgba(234,179,8,0.6)',   textColor: '#1a0a00', tileBg: 'rgba(234,179,8,0.18)',   tileBorder: 'rgba(234,179,8,0.45)' },
  green:  { label: 'Green',  pts: 3, cls: 'ball-green',  glow: 'rgba(22,163,74,0.6)',   textColor: 'white',   tileBg: 'rgba(22,163,74,0.18)',   tileBorder: 'rgba(22,163,74,0.45)' },
  brown:  { label: 'Brown',  pts: 4, cls: 'ball-brown',  glow: 'rgba(146,64,14,0.6)',   textColor: 'white',   tileBg: 'rgba(146,64,14,0.25)',   tileBorder: 'rgba(146,64,14,0.55)' },
  blue:   { label: 'Blue',   pts: 5, cls: 'ball-blue',   glow: 'rgba(37,99,235,0.6)',   textColor: 'white',   tileBg: 'rgba(37,99,235,0.18)',   tileBorder: 'rgba(37,99,235,0.45)' },
  pink:   { label: 'Pink',   pts: 6, cls: 'ball-pink',   glow: 'rgba(236,72,153,0.6)',  textColor: 'white',   tileBg: 'rgba(236,72,153,0.18)',  tileBorder: 'rgba(236,72,153,0.45)' },
  black:  { label: 'Black',  pts: 7, cls: 'ball-black',  glow: 'rgba(80,80,80,0.6)',    textColor: 'white',   tileBg: 'rgba(80,80,80,0.22)',    tileBorder: 'rgba(130,130,130,0.4)' },
};

export default function BallSelectionPanel() {
  const { frameState, doPot, doFoul, matchConfig } = useGameStore();
  const [confirmBall, setConfirmBall] = useState(null);

  if (!frameState || frameState.frameOver) return null;

  const legalBalls = getLegalBalls(frameState);

  const handleBallClick = (ball) => {
    const isLegal = legalBalls.includes(ball);
    if (isLegal) {
      doPot(ball);
      toast.success(`${BALL_CONFIG[ball].label} potted! +${BALL_VALUES[ball]}`, {
        icon: '🎱',
        duration: 2000,
      });
    } else {
      setConfirmBall(ball);
    }
  };

  const handleConfirmFoul = () => {
    if (!confirmBall) return;
    doFoul(confirmBall, FOUL_REASONS.WRONG_BALL);
    toast.error(`Foul! Wrong ball — ${matchConfig?.['player2Name'] ?? 'Opponent'} gets penalty points.`, {
      icon: '⚠️', duration: 3000,
    });
    setConfirmBall(null);
  };

  return (
    <div>
      {/* Ball Grid */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '10px 0 6px',
      }}>
        {/* Red balls row */}
        <div>
          <BallButton ball="red" legalBalls={legalBalls} onClick={handleBallClick} size={62} />
        </div>

        {/* Yellow Green Brown */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['yellow', 'green', 'brown'].map(b => (
            <BallButton key={b} ball={b} legalBalls={legalBalls} onClick={handleBallClick} size={56} />
          ))}
        </div>

        {/* Blue Pink Black */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['blue', 'pink', 'black'].map(b => (
            <BallButton key={b} ball={b} legalBalls={legalBalls} onClick={handleBallClick} size={56} />
          ))}
        </div>
      </div>

      {/* Foul Confirmation Modal */}
      <AnimatePresence>
        {confirmBall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: 16,
            }}
            onClick={() => setConfirmBall(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card"
              style={{ maxWidth: 380, width: '100%', padding: 24, textAlign: 'center' }}
            >
              {/* Ball preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div
                  className={`snooker-ball ${BALL_CONFIG[confirmBall]?.cls}`}
                  style={{ width: 64, height: 64, fontSize: '1rem' }}
                >
                  {BALL_CONFIG[confirmBall]?.pts}
                </div>
              </div>

              <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                ⚠️ Illegal Ball Selected
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
                <strong style={{ color: 'white' }}>{BALL_CONFIG[confirmBall]?.label}</strong> is not the ball on.
                Selecting this will register a <strong style={{ color: '#fca5a5' }}>foul</strong> and give{' '}
                <strong style={{ color: 'var(--gold)' }}>{Math.max(4, BALL_VALUES[confirmBall] ?? 4)} penalty points</strong> to the opponent.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirmBall(null)}
                  className="btn-felt"
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmFoul}
                  className="btn-danger"
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: '0.85rem' }}
                >
                  Confirm Foul
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BallButton({ ball, legalBalls, onClick, size = 68 }) {
  const cfg = BALL_CONFIG[ball];
  const isLegal = legalBalls.includes(ball);

  return (
    <motion.div
      whileHover={{ scale: isLegal ? 1.1 : 1.04, y: isLegal ? -4 : 0 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onClick(ball)}
      title={`${cfg.label} (${cfg.pts} pts)${isLegal ? '' : ' — FOUL if selected'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '14px 18px 12px',
        borderRadius: 16,
        background: cfg.tileBg,
        border: `1.5px solid ${isLegal ? cfg.tileBorder : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isLegal
          ? `0 0 16px ${cfg.tileBg}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : 'none',
        opacity: isLegal ? 1 : 0.45,
        filter: isLegal ? 'none' : 'grayscale(35%)',
        minWidth: size + 24,
        transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
        '--glow-color': cfg.glow,
      }}
    >
      {/* The actual ball */}
      <div
        className={`snooker-ball ${cfg.cls} ${isLegal ? 'ball-legal' : ''}`}
        style={{
          width: size,
          height: size,
          border: isLegal ? `3px solid rgba(255,255,255,0.35)` : '2px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: size > 60 ? '0.9rem' : '0.7rem', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.9)', color: cfg.textColor }}>
          {cfg.pts}
        </span>
      </div>

      {/* Label */}
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        color: isLegal ? cfg.tileBorder.replace('0.45', '1').replace('0.55', '1').replace('0.4', '1') : 'var(--text-muted)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        filter: isLegal ? 'brightness(1.4)' : 'none',
      }}>
        {cfg.label}
      </span>

      {/* Foul indicator */}
      {!isLegal && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: '#dc2626', color: 'white',
          fontSize: '0.5rem', fontWeight: 700,
          borderRadius: 4, padding: '1px 4px',
          border: '1px solid #ef4444',
        }}>
          FOUL
        </span>
      )}
    </motion.div>
  );
}
