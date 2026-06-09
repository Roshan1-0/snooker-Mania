import { motion } from 'framer-motion';
import { Trophy, Zap, Award } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { getBallOnLabel, PHASES } from '../engine/scoringEngine';

const PHASE_INFO = {
  RED_ON:         { label: 'Red On',      cls: 'phase-red-on' },
  COLOR_ON:       { label: 'Colour On',   cls: 'phase-color-on' },
  COLORS_SEQUENCE:{ label: 'Sequence',    cls: 'phase-sequence' },
  FINAL_BLACK:    { label: 'Final Black', cls: 'phase-final' },
  RESPOTTED_BLACK:{ label: 'Re-spotted',  cls: 'phase-respotted' },
  FRAME_OVER:     { label: 'Frame Over',  cls: 'phase-final' },
};

export default function Scoreboard() {
  const { matchConfig, frameState, frameScores, frameNumber, highestBreaksAll } = useGameStore();
  if (!matchConfig || !frameState) return null;

  const { player1Name, player2Name, totalFrames } = matchConfig;
  const { currentPlayer, scores, currentBreak, phase, redsRemaining, freeBallAvailable, cueBallInHand } = frameState;
  const ballOn = getBallOnLabel(frameState);
  const phaseInfo = PHASE_INFO[phase] ?? { label: phase, cls: 'phase-final' };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'rgba(5,17,10,0.98)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        padding: '12px 16px',
        position: 'sticky',
        top: 56,
        zIndex: 90,
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Players Row */}
        <div className="scoreboard-players" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
          {/* Player 1 */}
          <PlayerPanel
            name={player1Name}
            score={scores.player1}
            currentBreak={currentPlayer === 'player1' ? currentBreak : 0}
            highestBreak={Math.max(frameState.highestBreak?.player1 ?? 0, highestBreaksAll?.player1 ?? 0)}
            framesWon={frameScores.player1}
            isActive={currentPlayer === 'player1'}
            align="left"
          />

          {/* Center */}
          <div className="scoreboard-center-frames" style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Frame {frameNumber} of {totalFrames}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--gold)', lineHeight: 1 }}>
              {frameScores.player1} – {frameScores.player2}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>FRAMES</div>
          </div>

          {/* Player 2 */}
          <PlayerPanel
            name={player2Name}
            score={scores.player2}
            currentBreak={currentPlayer === 'player2' ? currentBreak : 0}
            highestBreak={Math.max(frameState.highestBreak?.player2 ?? 0, highestBreaksAll?.player2 ?? 0)}
            framesWon={frameScores.player2}
            isActive={currentPlayer === 'player2'}
            align="right"
          />
        </div>

        {/* Status Strip */}
        <div className="scoreboard-status-strip" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, marginTop: 10, flexWrap: 'wrap',
        }}>
          <StatusChip label="Ball On" value={ballOn} color="var(--gold)" />
          <StatusChip label="Reds Left" value={redsRemaining} />
          <span className={`phase-badge ${phaseInfo.cls}`}>{phaseInfo.label}</span>
          {freeBallAvailable && (
            <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              FREE BALL
            </span>
          )}
          {cueBallInHand && (
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#d4d4d4', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              BALL IN HAND
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PlayerPanel({ name, score, currentBreak, highestBreak, framesWon, isActive, align }) {
  return (
    <motion.div
      animate={{ scale: isActive ? 1.01 : 1 }}
      className={isActive ? 'player-active' : 'player-inactive'}
      style={{
        background: isActive ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
        borderRadius: 12, padding: '8px 10px',
        textAlign: align,
        transition: 'all 0.3s ease',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {isActive && align === 'left' && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />}
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--gold)' : 'var(--text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {name}
        </span>
        {isActive && align === 'right' && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />}
      </div>
      <div className="scoreboard-player-score" style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', lineHeight: 1, color: isActive ? 'white' : 'var(--text-secondary)', marginTop: 2 }}>
        {score}
      </div>
      <div className="scoreboard-mini-stats" style={{ display: 'flex', gap: 8, marginTop: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
        <MiniStat icon={<Zap size={10} />} label="Break" value={currentBreak} active={isActive && currentBreak > 0} />
        <MiniStat icon={<Award size={10} />} label="Best" value={highestBreak} />
        <MiniStat icon={<Trophy size={10} />} label="Frames" value={framesWon} />
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }}>{icon}</span>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{label}:</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: active ? 'var(--gold)' : 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

function StatusChip({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}:</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: color ?? 'white' }}>{value}</span>
    </div>
  );
}
