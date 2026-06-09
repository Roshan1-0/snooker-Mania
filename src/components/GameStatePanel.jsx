import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle, Flag, Shield, Target } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { getLegalBalls, getBallOnLabel, PHASES, COLOR_ORDER, BALL_VALUES } from '../engine/scoringEngine';

export default function GameStatePanel({ onOpenFoulPanel }) {
  const {
    frameState, matchConfig, doMiss, doSafety, doConcede,
    doFreeBall, showFreeBallPanel, openFreeBallPanel, closeFreeBallPanel,
  } = useGameStore();

  const [showConcede, setShowConcede] = useState(false);

  if (!frameState || frameState.frameOver) return null;

  const { currentPlayer, phase, redsRemaining, freeBallAvailable, cueBallInHand } = frameState;
  const playerName = matchConfig?.[currentPlayer === 'player1' ? 'player1Name' : 'player2Name'] ?? 'Current Player';
  const ballOn = getBallOnLabel(frameState);
  const legalBalls = getLegalBalls(frameState);

  const handleMiss = () => {
    const { phase, redsRemaining } = frameState;
    const legalBallsList = getLegalBalls(frameState);
    const ballOnVal = legalBallsList[0] ? (BALL_VALUES[legalBallsList[0]] ?? 4) : 4;
    const penalty = Math.max(4, ballOnVal);
    doMiss();
    toast.error(`Miss — Foul! ${matchConfig?.[frameState.currentPlayer === 'player1' ? 'player2Name' : 'player1Name'] ?? 'Opponent'} gets +${penalty} pts. Turn changes.`, { icon: '↩️', duration: 3000 });
  };

  const handleSafety = () => {
    doSafety();
    toast('Safety played. Break ends. Turn changes.', { icon: '🛡️', duration: 2000 });
  };

  const handleConcede = () => {
    doConcede();
    toast(`${playerName} conceded the frame.`, { icon: '🏳️', duration: 3000 });
    setShowConcede(false);
  };

  const colors = ['yellow','green','brown','blue','pink','black'];
  const ballColors = { red:'#dc2626',yellow:'#eab308',green:'#16a34a',brown:'#92400e',blue:'#2563eb',pink:'#ec4899',black:'#333' };

  return (
    <div>
      {/* Current player info bar */}
      <div className="gamestate-infobar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 12, padding: '10px 16px', marginBottom: 12, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }}
          />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Current Turn
            </div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{playerName}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ball On
          </div>
          <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>{ballOn}</div>
        </div>
        {cueBallInHand && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '4px 10px', fontSize: '0.7rem', color: '#d4d4d4', fontWeight: 600,
          }}>
            Ball in Hand
          </div>
        )}
      </div>

      {/* Phase-specific info */}
      {phase === PHASES.COLORS_SEQUENCE && (
        <div style={{
          background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600 }}>Sequence:</span>
          {COLOR_ORDER.map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: ballColors[c],
                opacity: i < frameState.nextColorIndex ? 0.25 : 1,
                border: i === frameState.nextColorIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
              }} />
              <span style={{ fontSize: '0.65rem', color: i < frameState.nextColorIndex ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </span>
              {i < COLOR_ORDER.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>→</span>}
            </div>
          ))}
        </div>
      )}

      {phase === PHASES.RESPOTTED_BLACK && (
        <div style={{
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12,
          fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600, textAlign: 'center',
        }}>
          ⚫ Re-spotted Black — Scores level! First pot or foul ends the frame.
        </div>
      )}

      {/* Free ball available notification */}
      {freeBallAvailable && (
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 2 }}>Free Ball Available</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Opponent was snookered after a foul</div>
          </div>
          <button
            onClick={openFreeBallPanel}
            className="btn-gold"
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem' }}
          >
            Claim Free Ball
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="action-btn-grid" style={{ marginBottom: 8 }}>
        <ActionBtn icon={<span>↩️</span>} label="Miss" sub="No pot" onClick={handleMiss} />
        <ActionBtn icon={<Shield size={14} />} label="Safety" sub="No score" onClick={handleSafety} color="rgba(37,99,235,0.15)" border="rgba(37,99,235,0.3)" textColor="#93c5fd" />
        <ActionBtn icon={<AlertTriangle size={14} />} label="Foul" sub="Penalty" onClick={onOpenFoulPanel} color="rgba(220,38,38,0.12)" border="rgba(220,38,38,0.3)" textColor="#fca5a5" />
        <ActionBtn icon={<Flag size={14} />} label="Concede" sub="Frame" onClick={() => setShowConcede(true)} color="rgba(107,114,128,0.1)" border="rgba(107,114,128,0.2)" textColor="var(--text-muted)" />
      </div>

      {/* Concede confirmation */}
      <AnimatePresence>
        {showConcede && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: 16,
            }}
            onClick={() => setShowConcede(false)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="glass-card"
              style={{ maxWidth: 360, width: '100%', padding: 24, textAlign: 'center' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏳️</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: 8, color: 'white' }}>
                Concede Frame?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                {playerName} will forfeit this frame. The opponent wins.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConcede(false)} className="btn-felt" style={{ flex: 1, padding: '10px 0', borderRadius: 10 }}>
                  Cancel
                </button>
                <button onClick={handleConcede} className="btn-danger" style={{ flex: 1, padding: '10px 0', borderRadius: 10 }}>
                  Concede Frame
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free ball panel */}
      <AnimatePresence>
        {showFreeBallPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-card-gold"
              style={{ maxWidth: 400, width: '100%', padding: 24 }}
            >
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--gold)', marginBottom: 6 }}>
                🎯 Free Ball — Nominate a Ball
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 16 }}>
                Ball on is <strong style={{ color: 'white' }}>{ballOn}</strong>.
                The nominated ball acts as the ball on. If potted, you receive <strong style={{ color: 'white' }}>{legalBalls[0] ? 1 : 1} point(s)</strong>.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => { doFreeBall(c); toast.success(`Free ball: ${c} potted as ${ballOn}!`, { icon: '🎯' }); }}
                    style={{
                      width: 50, height: 50, borderRadius: '50%',
                      background: ballColors[c], border: '2px solid rgba(255,255,255,0.3)',
                      cursor: 'pointer', fontWeight: 700, color: c === 'yellow' ? '#000' : 'white',
                      fontSize: '0.7rem', transition: 'all 0.15s',
                    }}
                  >
                    {c.slice(0,2).toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={closeFreeBallPanel} className="btn-felt" style={{ width: '100%', padding: '10px 0', borderRadius: 10 }}>
                Cancel (play normally)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({ icon, label, sub, onClick, color, border, textColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color ?? 'rgba(255,255,255,0.05)',
        border: `1px solid ${border ?? 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        transition: 'all 0.15s', color: textColor ?? 'var(--text-secondary)',
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{sub}</span>
    </button>
  );
}
