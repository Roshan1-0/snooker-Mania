import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createInitialFrameState,
  processPot,
  processFoul,
  processMiss,
  processSafety,
  processFreeBall,
  processConcede,
  undoShot,
  PHASES,
} from '../engine/scoringEngine';

const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Match Config ──────────────────────────────────────
      matchConfig: null,        // { player1Name, player2Name, totalFrames, startingPlayer }
      frameScores: { player1: 0, player2: 0 },  // frames won per player
      highestBreaksAll: { player1: 0, player2: 0 }, // across all frames
      frameNumber: 1,

      // ── Current Frame State (the engine operates on this) ─
      frameState: null,

      // ── UI State ──────────────────────────────────────────
      lastExplanation: '',
      showFoulPanel: false,
      showFreeBallPanel: false,
      showMatchSummary: false,
      historyFilter: 'all',   // 'all' | 'pots' | 'fouls' | 'misses'
      matchOver: false,
      matchWinner: null,

      // ── Actions ───────────────────────────────────────────

      startMatch: (config) => {
        const { player1Name, player2Name, totalFrames, startingPlayer } = config;
        const fs = createInitialFrameState(player1Name, player2Name, startingPlayer);
        set({
          matchConfig: config,
          frameScores: { player1: 0, player2: 0 },
          highestBreaksAll: { player1: 0, player2: 0 },
          frameNumber: 1,
          frameState: fs,
          lastExplanation: `Frame 1 started. ${startingPlayer === 'player1' ? player1Name : player2Name} breaks first. Ball on: Red.`,
          showFoulPanel: false,
          showFreeBallPanel: false,
          showMatchSummary: false,
          matchOver: false,
          matchWinner: null,
        });
      },

      startNextFrame: () => {
        const { matchConfig, frameScores, frameNumber, highestBreaksAll, frameState } = get();
        if (!matchConfig) return;

        // Who starts next frame — alternate
        const lastStarter = matchConfig.startingPlayer;
        const nextStarter = frameState?.currentPlayer === 'player1' ? 'player2' : 'player1';

        // Update highest breaks across frames
        const newHighestBreaksAll = {
          player1: Math.max(highestBreaksAll.player1, frameState?.highestBreak?.player1 ?? 0),
          player2: Math.max(highestBreaksAll.player2, frameState?.highestBreak?.player2 ?? 0),
        };

        const newFs = createInitialFrameState(
          matchConfig.player1Name,
          matchConfig.player2Name,
          nextStarter
        );

        set({
          frameNumber: frameNumber + 1,
          frameState: newFs,
          highestBreaksAll: newHighestBreaksAll,
          lastExplanation: `Frame ${frameNumber + 1} started. ${nextStarter === 'player1' ? matchConfig.player1Name : matchConfig.player2Name} breaks. Ball on: Red.`,
          showMatchSummary: false,
          showFoulPanel: false,
          showFreeBallPanel: false,
        });
      },

      _afterFrameEnd: (newState) => {
        const { matchConfig, frameScores, frameNumber, highestBreaksAll } = get();
        const winner = newState.winner;
        const newFrameScores = { ...frameScores };
        if (winner) newFrameScores[winner] += 1;

        const newHighestBreaksAll = {
          player1: Math.max(highestBreaksAll.player1, newState.highestBreak?.player1 ?? 0),
          player2: Math.max(highestBreaksAll.player2, newState.highestBreak?.player2 ?? 0),
        };

        // Check match winner
        const winTarget = Math.ceil(matchConfig.totalFrames / 2);
        let matchOver = false;
        let matchWinner = null;
        if (newFrameScores.player1 >= winTarget) { matchOver = true; matchWinner = 'player1'; }
        if (newFrameScores.player2 >= winTarget) { matchOver = true; matchWinner = 'player2'; }

        set({
          frameState: newState,
          frameScores: newFrameScores,
          highestBreaksAll: newHighestBreaksAll,
          showMatchSummary: true,
          matchOver,
          matchWinner,
          lastExplanation: newState.history[newState.history.length - 1]?.explanation ?? '',
        });
      },

      doPot: (ball) => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = {
          player1: matchConfig.player1Name,
          player2: matchConfig.player2Name,
        };
        const { newState, shot } = processPot(frameState, ball, playerNames);
        if (newState.frameOver) {
          get()._afterFrameEnd(newState);
        } else {
          set({ frameState: newState, lastExplanation: shot.explanation, showFoulPanel: false });
        }
      },

      doFoul: (selectedBall, foulReason, options = {}) => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = {
          player1: matchConfig.player1Name,
          player2: matchConfig.player2Name,
        };
        const { newState, shot } = processFoul(frameState, selectedBall, foulReason, playerNames, options);
        if (newState.frameOver) {
          get()._afterFrameEnd(newState);
        } else {
          set({ frameState: newState, lastExplanation: shot.explanation, showFoulPanel: true });
        }
      },

      doMiss: () => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = { player1: matchConfig.player1Name, player2: matchConfig.player2Name };
        const { newState, shot } = processMiss(frameState, playerNames);
        if (newState.frameOver) {
          get()._afterFrameEnd(newState);
        } else {
          set({ frameState: newState, lastExplanation: shot.explanation, showFoulPanel: false, showFreeBallPanel: false });
        }
      },

      doSafety: () => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = { player1: matchConfig.player1Name, player2: matchConfig.player2Name };
        const { newState, shot } = processSafety(frameState, playerNames);
        set({ frameState: newState, lastExplanation: shot.explanation, showFoulPanel: false, showFreeBallPanel: false });
      },

      doFreeBall: (nominatedBall) => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = { player1: matchConfig.player1Name, player2: matchConfig.player2Name };
        const { newState, shot } = processFreeBall(frameState, nominatedBall, playerNames);
        set({ frameState: newState, lastExplanation: shot.explanation, showFoulPanel: false, showFreeBallPanel: false });
      },

      doConcede: () => {
        const { frameState, matchConfig } = get();
        if (!frameState || frameState.frameOver) return;
        const playerNames = { player1: matchConfig.player1Name, player2: matchConfig.player2Name };
        const { newState, shot } = processConcede(frameState, playerNames);
        get()._afterFrameEnd(newState);
      },

      doUndo: () => {
        const { frameState } = get();
        if (!frameState) return;
        const { newState, undone } = undoShot(frameState);
        if (undone) {
          set({
            frameState: newState,
            lastExplanation: newState.history.length > 0
              ? newState.history[newState.history.length - 1].explanation
              : 'Shot undone. Ready to continue.',
            showFoulPanel: false,
            showFreeBallPanel: false,
            showMatchSummary: false,
            matchOver: false,
            matchWinner: null,
          });
        }
      },

      // Post-foul options
      closeFoulPanel: () => set({ showFoulPanel: false }),
      setFreeBallAvailable: (val) =>
        set((s) => ({ frameState: s.frameState ? { ...s.frameState, freeBallAvailable: val } : s.frameState })),
      openFreeBallPanel: () => set({ showFreeBallPanel: true }),
      closeFreeBallPanel: () => set({ showFreeBallPanel: false }),
      closeMatchSummary: () => set({ showMatchSummary: false }),

      setHistoryFilter: (filter) => set({ historyFilter: filter }),

      resetAll: () =>
        set({
          matchConfig: null, frameScores: { player1: 0, player2: 0 },
          highestBreaksAll: { player1: 0, player2: 0 }, frameNumber: 1,
          frameState: null, lastExplanation: '', showFoulPanel: false,
          showFreeBallPanel: false, showMatchSummary: false,
          matchOver: false, matchWinner: null, historyFilter: 'all',
        }),
    }),
    {
      name: 'snooker-game',
      partialize: (state) => ({
        matchConfig: state.matchConfig,
        frameScores: state.frameScores,
        highestBreaksAll: state.highestBreaksAll,
        frameNumber: state.frameNumber,
        frameState: state.frameState,
        lastExplanation: state.lastExplanation,
        matchOver: state.matchOver,
        matchWinner: state.matchWinner,
      }),
    }
  )
);

export default useGameStore;
