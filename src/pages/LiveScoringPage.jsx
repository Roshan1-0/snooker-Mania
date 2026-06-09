import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import useGameStore from '../store/gameStore';
import Scoreboard from '../components/Scoreboard';
import GameStatePanel from '../components/GameStatePanel';
import BallSelectionPanel from '../components/BallSelectionPanel';
import FoulPanel from '../components/FoulPanel';
import PointExplanationBox from '../components/PointExplanationBox';
import ShotHistory from '../components/ShotHistory';
import MatchSummary from '../components/MatchSummary';

export default function LiveScoringPage() {
  const navigate = useNavigate();
  const { matchConfig, frameState, showFoulPanel, showMatchSummary, closeFoulPanel } = useGameStore();
  const [foulPanelOpen, setFoulPanelOpen] = useState(false);

  // Redirect if no active match
  if (!matchConfig || !frameState) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>🎱</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No active match found.</p>
        <button onClick={() => navigate('/setup')} className="btn-gold" style={{ padding: '12px 28px', borderRadius: 12 }}>
          Start New Match
        </button>
      </div>
    );
  }

  const openFoulPanel = () => setFoulPanelOpen(true);
  const closeFP = () => { setFoulPanelOpen(false); closeFoulPanel(); };

  // After a foul registered via BallSelectionPanel, showFoulPanel in store becomes true
  // Sync that to local state
  if (showFoulPanel && !foulPanelOpen) setFoulPanelOpen(true);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Sticky Scoreboard */}
      <Scoreboard />

      {/* Main Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 12px 120px' }}>
        <div className="live-grid" style={{ display: 'grid', gap: 16, alignItems: 'start' }}>
          {/* Left column: balls + state */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Ball selection */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              style={{ padding: '16px 12px', borderRadius: 16 }}
            >
              <h2 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 3, textAlign: 'center',
              }}>
                Select Ball to Pot
              </h2>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>
                Legal balls glow · Illegal balls trigger foul confirmation
              </p>
              <BallSelectionPanel />
            </motion.div>

            {/* Game state & actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <GameStatePanel onOpenFoulPanel={openFoulPanel} />
            </motion.div>

            {/* Explanation box */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <PointExplanationBox />
            </motion.div>

            {/* History — mobile only (shown below on small screens) */}
            <motion.div
              className="history-panel-mobile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <ShotHistory />
            </motion.div>
          </div>

          {/* Right column: history — desktop only */}
          <motion.div
            className="history-panel-desktop"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ShotHistory />
          </motion.div>
        </div>
      </div>

      {/* Foul Panel */}
      <FoulPanel isOpen={foulPanelOpen} onClose={closeFP} />

      {/* Match/Frame Summary Modal */}
      <MatchSummary isOpen={showMatchSummary} onClose={() => {}} />
    </div>
  );
}
