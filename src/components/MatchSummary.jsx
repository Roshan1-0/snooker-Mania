import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCw, X } from 'lucide-react';
import useGameStore from '../store/gameStore';

export default function MatchSummary({ isOpen, onClose }) {
  const {
    matchConfig, frameState, frameScores, frameNumber,
    matchOver, matchWinner, startNextFrame, resetAll,
    closeMatchSummary,
  } = useGameStore();

  if (!isOpen || !matchConfig || !frameState) return null;

  const { player1Name, player2Name, totalFrames } = matchConfig;
  const frameWinner = frameState.winner;
  const frameWinnerName = frameWinner === 'player1' ? player1Name : player2Name;
  const matchWinnerName = matchWinner === 'player1' ? player1Name : player2Name;

  const p1Score = frameState.scores.player1;
  const p2Score = frameState.scores.player2;
  const framesLeft = totalFrames - (frameScores.player1 + frameScores.player2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            style={{
              background: 'linear-gradient(160deg, #0d2416 0%, #060f06 100%)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 24,
              width: '100%', maxWidth: 480,
              padding: 28, textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 60px rgba(201,168,76,0.05)',
            }}
          >
            {/* Trophy animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: 12 }}
            >
              🏆
            </motion.div>

            {matchOver ? (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                  Match Complete
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: 4 }}>
                  {matchWinnerName} Wins!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Best of {totalFrames} · Final: {frameScores.player1} – {frameScores.player2}
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                  Frame {frameNumber} Complete
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: 4 }}>
                  {frameWinnerName} wins the frame!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Frames: {frameScores.player1} – {frameScores.player2} · {framesLeft} remaining
                </p>
              </>
            )}

            {/* Score breakdown */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              background: 'rgba(255,255,255,0.04)', borderRadius: 14,
              padding: 16, gap: 12, marginBottom: 24, alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{player1Name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: frameWinner === 'player1' ? 'var(--gold)' : 'var(--text-secondary)' }}>
                  {p1Score}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Best: {frameState.highestBreak?.player1 ?? 0}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>—</div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{player2Name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: frameWinner === 'player2' ? 'var(--gold)' : 'var(--text-secondary)' }}>
                  {p2Score}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Best: {frameState.highestBreak?.player2 ?? 0}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!matchOver && (
                <button
                  onClick={startNextFrame}
                  className="btn-gold"
                  style={{ padding: '14px 0', borderRadius: 12, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <RotateCw size={16} /> Play Frame {frameNumber + 1}
                </button>
              )}
              <button
                onClick={() => { closeMatchSummary(); }}
                className="btn-felt"
                style={{ padding: '12px 0', borderRadius: 12, fontSize: '0.85rem' }}
              >
                {matchOver ? 'View Final Scorecard' : 'Review This Frame'}
              </button>
              <button
                onClick={resetAll}
                style={{
                  padding: '10px 0', borderRadius: 12, fontSize: '0.8rem',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                New Match
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
