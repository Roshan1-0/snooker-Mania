import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { ACTION_TYPES } from '../engine/scoringEngine';

export default function PointExplanationBox() {
  const { lastExplanation, frameState } = useGameStore();
  if (!frameState) return null;

  const lastShot = frameState.history[frameState.history.length - 1];
  const isFoul = lastShot?.actionType === ACTION_TYPES.FOUL;
  const isPot  = lastShot?.actionType === ACTION_TYPES.POT;
  const isMiss = lastShot?.actionType === ACTION_TYPES.MISS || lastShot?.actionType === ACTION_TYPES.SAFETY;

  const color = isFoul ? '#dc2626' : isPot ? '#16a34a' : '#6b7280';
  const borderColor = isFoul ? 'rgba(220,38,38,0.3)' : isPot ? 'rgba(22,163,74,0.3)' : 'rgba(107,114,128,0.2)';
  const bgColor = isFoul ? 'rgba(220,38,38,0.05)' : isPot ? 'rgba(22,163,74,0.05)' : 'rgba(107,114,128,0.03)';
  const icon = isFoul ? '⚠️' : isPot ? '✅' : isMiss ? '↩️' : 'ℹ️';

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        padding: '14px 16px',
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
            {isFoul ? 'Foul' : isPot ? 'Point Scored' : isMiss ? 'No Score' : 'Game Info'}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={lastExplanation}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
              }}
            >
              {lastExplanation || 'Game started. Select a ball to begin scoring.'}
            </motion.p>
          </AnimatePresence>

          {/* Score delta badges */}
          {lastShot && (lastShot.points > 0 || lastShot.foulPenalty > 0) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {lastShot.points > 0 && (
                <span style={{
                  background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
                  color: '#86efac', fontSize: '0.7rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 20,
                }}>
                  +{lastShot.points} pts scored
                </span>
              )}
              {lastShot.foulPenalty > 0 && (
                <span style={{
                  background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                  color: '#fca5a5', fontSize: '0.7rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 20,
                }}>
                  +{lastShot.foulPenalty} foul pts awarded
                </span>
              )}
              {lastShot.breakAfter > 0 && isPot && (
                <span style={{
                  background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                  color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 20,
                }}>
                  Break: {lastShot.breakAfter}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
