import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import useGameStore from '../store/gameStore';

const RULES = [
  { icon: '🔴', title: 'Red On', body: 'Player must pot a red ball first. Potting a colour without a red is a foul.' },
  { icon: '🟡', title: 'Colour On', body: 'After potting red, pot any colour. Colour is re-spotted if reds remain.' },
  { icon: '📋', title: 'Sequence', body: 'Once all reds are gone, pot colours in order: Yellow → Green → Brown → Blue → Pink → Black.' },
  { icon: '⚫', title: 'Final Black', body: 'Last ball. Pot it to win, or foul — opponent may win. Tied scores trigger re-spotted black.' },
  { icon: '⚠️', title: 'Fouls', body: 'Minimum 4 penalty points to opponent. Penalty = max(4, ball on value, ball involved value).' },
  { icon: '🎯', title: 'Free Ball', body: 'After a foul leaving a snooker, opponent may nominate any ball as the ball on.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { matchConfig, frameState, resetAll } = useGameStore();
  const hasActiveGame = matchConfig && frameState && !frameState.frameOver;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '72vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Decorative balls */}
        <DecorativeBalls />

        <motion.div {...fadeUp(0)}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 30, padding: '6px 18px', marginBottom: 24,
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Live Snooker Scoring
          </div>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 900, lineHeight: 1.05, marginBottom: 20, color: 'white',
          letterSpacing: '-0.02em',
        }}>
          Score Your<br />
          <span style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Snooker Match
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)',
          maxWidth: 520, lineHeight: 1.7, marginBottom: 36,
        }}>
          Professional shot-by-shot snooker scoring. Tracks every pot, foul, and break
          automatically — with full undo support and rule enforcement.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {hasActiveGame ? (
            <>
              <button
                onClick={() => navigate('/live')}
                className="btn-gold"
                style={{ padding: '14px 32px', borderRadius: 14, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Play size={18} fill="currentColor" /> Continue Match
              </button>
              <button
                onClick={() => { resetAll(); navigate('/setup'); }}
                className="btn-felt"
                style={{ padding: '14px 28px', borderRadius: 14, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                New Match <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/setup')}
              className="btn-gold"
              style={{ padding: '14px 36px', borderRadius: 14, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Play size={18} fill="currentColor" /> Start New Match
            </button>
          )}
        </motion.div>

        {hasActiveGame && (
          <motion.div {...fadeUp(0.4)} style={{
            marginTop: 20,
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 12, padding: '10px 20px',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-glow 1.5s infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Active match: <strong style={{ color: 'white' }}>{matchConfig.player1Name}</strong> vs <strong style={{ color: 'white' }}>{matchConfig.player2Name}</strong>
              {' — '}Score: <strong style={{ color: 'var(--gold)' }}>{frameState.scores.player1} – {frameState.scores.player2}</strong>
            </span>
          </motion.div>
        )}

        {/* Ball value cheatsheet */}
        <motion.div {...fadeUp(0.5)} style={{
          display: 'flex', gap: 10, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { ball: 'Red', pts: 1, cls: 'ball-red', tc: 'white' },
            { ball: 'Yellow', pts: 2, cls: 'ball-yellow', tc: '#1a0a00' },
            { ball: 'Green', pts: 3, cls: 'ball-green', tc: 'white' },
            { ball: 'Brown', pts: 4, cls: 'ball-brown', tc: 'white' },
            { ball: 'Blue', pts: 5, cls: 'ball-blue', tc: 'white' },
            { ball: 'Pink', pts: 6, cls: 'ball-pink', tc: 'white' },
            { ball: 'Black', pts: 7, cls: 'ball-black', tc: 'white' },
          ].map(({ ball, pts, cls, tc }) => (
            <div key={ball} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className={`snooker-ball ${cls}`} style={{ width: 40, height: 40, fontSize: '0.75rem', color: tc }}>
                {pts}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{ball}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Rules Section */}
      <section style={{ padding: '60px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <BookOpen size={16} color="var(--gold)" />
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Scoring Rules
            </span>
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'white' }}>
            How Scoring Works
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {RULES.map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-card"
              style={{ padding: '20px 22px' }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{rule.icon}</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold)', marginBottom: 6 }}>
                {rule.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.65 }}>{rule.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DecorativeBalls() {
  const balls = [
    { cls: 'ball-red',   size: 60, x: '10%', y: '20%', delay: 0 },
    { cls: 'ball-blue',  size: 45, x: '85%', y: '15%', delay: 0.5 },
    { cls: 'ball-pink',  size: 35, x: '90%', y: '70%', delay: 1 },
    { cls: 'ball-black', size: 50, x: '5%',  y: '75%', delay: 0.7 },
    { cls: 'ball-green', size: 28, x: '80%', y: '40%', delay: 1.2 },
  ];
  return (
    <>
      {balls.map((b, i) => (
        <motion.div
          key={i}
          className={`snooker-ball ${b.cls}`}
          animate={{ y: [0, -12, 0], rotate: [0, 360] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: b.size, height: b.size,
            left: b.x, top: b.y, opacity: 0.15, pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}
