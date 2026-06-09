import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import useGameStore from '../store/gameStore';
import { ACTION_TYPES } from '../engine/scoringEngine';

const FILTERS = [
  { key: 'all',   label: 'All' },
  { key: 'pots',  label: 'Pots' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'misses',label: 'Misses' },
];

const BALL_COLORS = {
  red:'#dc2626',yellow:'#eab308',green:'#16a34a',
  brown:'#92400e',blue:'#2563eb',pink:'#ec4899',black:'#555',
};

export default function ShotHistory() {
  const { frameState, historyFilter, setHistoryFilter, doUndo, matchConfig } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  if (!frameState) return null;

  const history = [...frameState.history].reverse(); // newest first

  const filtered = history.filter(shot => {
    if (historyFilter === 'all')   return true;
    if (historyFilter === 'pots')  return shot.actionType === ACTION_TYPES.POT || shot.actionType === ACTION_TYPES.FREE_BALL;
    if (historyFilter === 'fouls') return shot.actionType === ACTION_TYPES.FOUL || shot.actionType === ACTION_TYPES.MISS || shot.actionType === ACTION_TYPES.SAFETY;
    if (historyFilter === 'misses')return shot.actionType === ACTION_TYPES.MISS || shot.actionType === ACTION_TYPES.SAFETY;
    return true;
  });

  const displayList = expanded ? filtered : filtered.slice(0, 8);

  const handleUndo = () => {
    doUndo();
    toast('Last shot undone', { icon: '↩️', duration: 2000 });
  };

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>
          Shot History
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
            ({frameState.history.length} shots)
          </span>
        </h3>
        {frameState.history.length > 0 && (
          <button
            onClick={handleUndo}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <RotateCcw size={12} /> Undo Last
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setHistoryFilter(f.key)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', border: 'none',
              background: historyFilter === f.key ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
              color: historyFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
              outline: historyFilter === f.key ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {displayList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
            No shots recorded yet
          </p>
        ) : (
          <AnimatePresence>
            {displayList.map((shot, idx) => (
              <ShotRow
                key={shot.id}
                shot={shot}
                matchConfig={matchConfig}
                isLatest={idx === 0 && historyFilter === 'all'}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Show more */}
      {filtered.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', marginTop: 10, padding: '8px 0',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.75rem',
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          {expanded ? '▲ Show less' : `▼ Show all ${filtered.length} shots`}
        </button>
      )}
    </div>
  );
}

function ShotRow({ shot, matchConfig, isLatest }) {
  const playerName = shot.actionType !== ACTION_TYPES.FOUL
    ? (matchConfig?.[shot.pointsTo === 'player1' ? 'player1Name' : 'player2Name'] ?? 'Player')
    : (matchConfig?.[(shot.pointsTo === 'player1' ? 'player2Name' : 'player1Name')] ?? 'Player');

  // Determine who did the action
  const actorName = matchConfig ? (
    shot.scoreBefore
      ? (shot.phaseBefore && shot.scoreAfter?.player1 !== shot.scoreBefore?.player1 && shot.actionType !== ACTION_TYPES.FOUL
          ? matchConfig.player1Name
          : matchConfig.player2Name)
      : 'Player'
  ) : 'Player';

  const isFoul  = shot.actionType === ACTION_TYPES.FOUL;
  const isPot   = shot.actionType === ACTION_TYPES.POT || shot.actionType === ACTION_TYPES.FREE_BALL;
  const isMiss  = shot.actionType === ACTION_TYPES.MISS || shot.actionType === ACTION_TYPES.SAFETY;

  const rowClass = (isFoul || shot.actionType === ACTION_TYPES.MISS) ? 'history-foul' : isPot ? 'history-pot' : 'history-miss';
  const scoreColor = isFoul ? '#fca5a5' : isPot ? '#86efac' : 'var(--text-muted)';

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      className={rowClass}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 8,
        fontSize: '0.75rem',
      }}
    >
      {/* Shot number */}
      <span style={{ color: 'var(--text-muted)', minWidth: 22, fontWeight: 700 }}>#{shot.id}</span>

      {/* Ball dot */}
      {shot.selectedBall && (
        <div style={{
          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
          background: BALL_COLORS[shot.selectedBall] ?? '#555',
          boxShadow: `0 0 6px ${BALL_COLORS[shot.selectedBall] ?? '#555'}`,
        }} />
      )}

      {/* Action */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: isFoul ? '#fca5a5' : isPot ? '#86efac' : 'var(--text-secondary)', fontWeight: 600 }}>
          {shot.actionType}
        </span>
        {shot.selectedBall && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
            {shot.selectedBall.charAt(0).toUpperCase() + shot.selectedBall.slice(1)}
          </span>
        )}
        {shot.foulReason && (
          <span style={{ color: '#fca5a5', marginLeft: 4, fontSize: '0.65rem' }}>
            — {shot.foulReason}
          </span>
        )}
      </div>

      {/* Points */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {shot.points > 0 && (
          <span style={{ color: scoreColor, fontWeight: 700 }}>+{shot.points}</span>
        )}
        {shot.foulPenalty > 0 && (
          <span style={{ color: '#fca5a5', fontWeight: 700 }}>+{shot.foulPenalty}⚠️</span>
        )}
        {shot.breakAfter > 0 && isPot && (
          <span style={{ color: 'var(--gold)', fontSize: '0.65rem', marginLeft: 4 }}>
            [{shot.breakAfter}]
          </span>
        )}
      </div>

      {/* Score */}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: 50, textAlign: 'right' }}>
        {shot.scoreAfter?.player1 ?? 0}–{shot.scoreAfter?.player2 ?? 0}
      </div>
    </motion.div>
  );
}
