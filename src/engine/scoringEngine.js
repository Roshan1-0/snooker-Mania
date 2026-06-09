// ============================================================
// SNOOKER SCORING ENGINE
// Pure functions — no side effects, deterministic
// ============================================================

export const BALL_VALUES = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
};

export const PHASES = {
  RED_ON: 'RED_ON',
  COLOR_ON: 'COLOR_ON',
  COLORS_SEQUENCE: 'COLORS_SEQUENCE',
  FINAL_BLACK: 'FINAL_BLACK',
  RESPOTTED_BLACK: 'RESPOTTED_BLACK',
  FRAME_OVER: 'FRAME_OVER',
};

export const COLOR_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

export const ACTION_TYPES = {
  POT: 'POT',
  FOUL: 'FOUL',
  MISS: 'MISS',
  SAFETY: 'SAFETY',
  FREE_BALL: 'FREE_BALL',
  CONCEDE: 'CONCEDE',
  FRAME_END: 'FRAME_END',
  UNDO: 'UNDO',
};

export const FOUL_REASONS = {
  WRONG_BALL: 'Wrong ball potted/hit first',
  CUE_BALL_POTTED: 'Cue ball potted (in-off)',
  NO_CONTACT: 'Cue ball failed to contact object ball',
  PUSH_STROKE: 'Push stroke',
  JUMP_SHOT: 'Jump shot',
  BALL_OFF_TABLE: 'Ball forced off table',
  WRONG_CUE_BALL: 'Wrong ball used as cue ball',
  MANUAL: 'Manual foul',
};

// ── Initial frame state factory ──────────────────────────────
export function createInitialFrameState(player1Name, player2Name, startingPlayer = 'player1') {
  return {
    currentPlayer: startingPlayer,
    phase: PHASES.RED_ON,
    redsRemaining: 15,
    nextColorIndex: 0, // index into COLOR_ORDER for COLORS_SEQUENCE phase
    scores: { player1: 0, player2: 0 },
    currentBreak: 0,
    highestBreak: { player1: 0, player2: 0 },
    frameOver: false,
    winner: null,
    foulActive: false,
    freeBallAvailable: false,
    cueBallInHand: true,
    history: [],
    shotCount: 0,
  };
}

// ── Helper: opponent ─────────────────────────────────────────
export function opponent(player) {
  return player === 'player1' ? 'player2' : 'player1';
}

// ── Foul penalty calculation ─────────────────────────────────
export function calculateFoulPenalty(ballOnValue, ballInvolvedValue = 4) {
  return Math.max(4, ballOnValue ?? 4, ballInvolvedValue ?? 4);
}

// ── Legal balls for current phase ───────────────────────────
export function getLegalBalls(frameState) {
  const { phase, nextColorIndex } = frameState;
  switch (phase) {
    case PHASES.RED_ON:
      return ['red'];
    case PHASES.COLOR_ON:
      return ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
    case PHASES.COLORS_SEQUENCE:
      return [COLOR_ORDER[nextColorIndex]];
    case PHASES.FINAL_BLACK:
    case PHASES.RESPOTTED_BLACK:
      return ['black'];
    default:
      return [];
  }
}

// ── Ball on label (human readable) ──────────────────────────
export function getBallOnLabel(frameState) {
  const { phase, nextColorIndex } = frameState;
  switch (phase) {
    case PHASES.RED_ON:
      return 'Red';
    case PHASES.COLOR_ON:
      return 'Any Colour';
    case PHASES.COLORS_SEQUENCE:
      return COLOR_ORDER[nextColorIndex]
        ? COLOR_ORDER[nextColorIndex].charAt(0).toUpperCase() + COLOR_ORDER[nextColorIndex].slice(1)
        : 'None';
    case PHASES.FINAL_BLACK:
    case PHASES.RESPOTTED_BLACK:
      return 'Black';
    default:
      return '—';
  }
}

// ── Check if a ball is on the table ─────────────────────────
export function isBallOnTable(ball, frameState) {
  const { phase, redsRemaining, nextColorIndex } = frameState;
  if (ball === 'red') return redsRemaining > 0;
  if (['yellow', 'green', 'brown', 'blue', 'pink'].includes(ball)) {
    if (phase === PHASES.COLORS_SEQUENCE || phase === PHASES.FINAL_BLACK || phase === PHASES.RESPOTTED_BLACK) {
      const idx = COLOR_ORDER.indexOf(ball);
      return idx >= nextColorIndex;
    }
    return true; // respotted during red/colour phases
  }
  if (ball === 'black') return true;
  return false;
}

// ── Snapshot helper ──────────────────────────────────────────
function snapshot(frameState) {
  return JSON.parse(JSON.stringify({ ...frameState, history: [] }));
}

// ── Build natural-language explanation ───────────────────────
function buildExplanation(params) {
  const {
    actionType, playerName, opponentName, selectedBall, ballOn,
    isLegal, points, pointsTo, foulPenalty, foulReason,
    phaseBefore, phaseAfter, redsAfter, nextBallOn,
  } = params;

  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  if (actionType === ACTION_TYPES.POT && isLegal) {
    let lines = [
      `${playerName} potted ${cap(selectedBall)}.`,
      `${cap(selectedBall)} is worth ${BALL_VALUES[selectedBall]} point${BALL_VALUES[selectedBall] > 1 ? 's' : ''}.`,
      `${playerName} receives ${points} point${points > 1 ? 's' : ''}.`,
    ];
    if (phaseAfter === PHASES.FRAME_OVER) {
      lines.push(`Frame over! ${pointsTo} wins.`);
    } else {
      lines.push(`Next ball on: ${nextBallOn}.`);
      lines.push(`${playerName} continues.`);
      if (redsAfter !== undefined) lines.push(`Reds remaining: ${redsAfter}.`);
    }
    return lines.join(' ');
  }

  if (actionType === ACTION_TYPES.FOUL) {
    let lines = [
      `Ball on was ${cap(ballOn)}.`,
    ];
    if (foulReason === FOUL_REASONS.WRONG_BALL && selectedBall) {
      lines.push(`${playerName} selected ${cap(selectedBall)}.`);
      lines.push(`${cap(selectedBall)} cannot be played — ${foulReason}.`);
    } else {
      lines.push(`Foul: ${foulReason}.`);
    }
    lines.push(`This is a foul.`);
    lines.push(`${opponentName} receives ${foulPenalty} penalty point${foulPenalty > 1 ? 's' : ''}.`);
    lines.push(`Turn passes to ${opponentName}.`);
    return lines.join(' ');
  }

  if (actionType === ACTION_TYPES.MISS || actionType === ACTION_TYPES.SAFETY) {
    const shotDesc = actionType === ACTION_TYPES.SAFETY ? 'played a safety shot' : 'missed their ball';
    let lines = [`${playerName} ${shotDesc}.`];
    if (foulPenalty && foulPenalty > 0) {
      lines.push(`Foul — ${opponentName} receives ${foulPenalty} penalty point${foulPenalty > 1 ? 's' : ''}.`);
    }
    lines.push(`Break ends. Turn passes to ${opponentName}.`);
    if (nextBallOn) lines.push(`${opponentName} starts on: ${nextBallOn}.`);
    return lines.join(' ');
  }

  if (actionType === ACTION_TYPES.FREE_BALL) {
    return `Free ball awarded to ${playerName}. ${cap(selectedBall)} nominated as free ball (acts as ${cap(ballOn)}). Worth ${BALL_VALUES[ballOn]} point(s) if potted.`;
  }

  if (actionType === ACTION_TYPES.CONCEDE) {
    return `${playerName} has conceded the frame. ${opponentName} wins this frame.`;
  }

  return '';
}

// ── PROCESS POT ─────────────────────────────────────────────
export function processPot(frameState, ball, playerNames) {
  const snap = snapshot(frameState);
  const legalBalls = getLegalBalls(frameState);
  const isLegal = legalBalls.includes(ball);
  const currentPlayer = frameState.currentPlayer;
  const opp = opponent(currentPlayer);
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opp];

  if (!isLegal) {
    // Illegal pot → treat as foul
    const ballOnValue = BALL_VALUES[legalBalls[0]] ?? 4;
    const ballInvolvedValue = BALL_VALUES[ball] ?? 4;
    return processFoul(frameState, ball, FOUL_REASONS.WRONG_BALL, playerNames, { ballOnValue, ballInvolvedValue });
  }

  // Legal pot
  const pointsGained = BALL_VALUES[ball];
  const newScores = { ...frameState.scores };
  newScores[currentPlayer] += pointsGained;

  const newBreak = frameState.currentBreak + pointsGained;
  const newHighestBreak = { ...frameState.highestBreak };
  if (newBreak > newHighestBreak[currentPlayer]) {
    newHighestBreak[currentPlayer] = newBreak;
  }

  let newRedsRemaining = frameState.redsRemaining;
  let newPhase = frameState.phase;
  let newNextColorIndex = frameState.nextColorIndex;

  if (frameState.phase === PHASES.RED_ON) {
    newRedsRemaining -= 1;
    newPhase = PHASES.COLOR_ON;
  } else if (frameState.phase === PHASES.COLOR_ON) {
    // After colour, check if reds remain
    if (newRedsRemaining > 0) {
      newPhase = PHASES.RED_ON;
    } else {
      // All reds gone — move to colours sequence
      newNextColorIndex = 0;
      newPhase = PHASES.COLORS_SEQUENCE;
    }
  } else if (frameState.phase === PHASES.COLORS_SEQUENCE) {
    newNextColorIndex = frameState.nextColorIndex + 1;
    if (newNextColorIndex >= COLOR_ORDER.length - 1) {
      // Only black remains
      newPhase = PHASES.FINAL_BLACK;
    }
    // else stay in COLORS_SEQUENCE
  } else if (frameState.phase === PHASES.FINAL_BLACK || frameState.phase === PHASES.RESPOTTED_BLACK) {
    // Frame ends
    const p1 = newScores.player1;
    const p2 = newScores.player2;

    if (frameState.phase === PHASES.RESPOTTED_BLACK) {
      // First pot/foul ends it regardless of scores
      const w = newScores.player1 > newScores.player2 ? 'player1' : 'player2';
      const newState = {
        ...frameState,
        scores: newScores,
        currentBreak: newBreak,
        highestBreak: newHighestBreak,
        redsRemaining: newRedsRemaining,
        nextColorIndex: newNextColorIndex,
        phase: PHASES.FRAME_OVER,
        frameOver: true,
        winner: w,
        foulActive: false,
        freeBallAvailable: false,
        cueBallInHand: false,
      };
      const shot = buildShot({
        frameState, newState, snap, ball, actionType: ACTION_TYPES.POT, isLegal: true,
        points: pointsGained, pointsTo: currentPlayer, foulPenalty: 0,
        playerName, opponentName, newPhase: PHASES.FRAME_OVER, newRedsRemaining, newNextColorIndex,
        playerNames,
      });
      return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
    }

    if (p1 === p2) {
      // Tied — re-spot black
      newPhase = PHASES.RESPOTTED_BLACK;
      const newState = {
        ...frameState,
        scores: newScores,
        currentBreak: newBreak,
        highestBreak: newHighestBreak,
        redsRemaining: 0,
        nextColorIndex: newNextColorIndex,
        phase: newPhase,
        frameOver: false,
        winner: null,
        foulActive: false,
        freeBallAvailable: false,
        cueBallInHand: true,
      };
      const shot = buildShot({
        frameState, newState, snap, ball, actionType: ACTION_TYPES.POT, isLegal: true,
        points: pointsGained, pointsTo: currentPlayer, foulPenalty: 0,
        playerName, opponentName, newPhase, newRedsRemaining: 0, newNextColorIndex,
        playerNames,
      });
      return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
    }

    const w = p1 > p2 ? 'player1' : 'player2';
    const newState = {
      ...frameState,
      scores: newScores,
      currentBreak: newBreak,
      highestBreak: newHighestBreak,
      redsRemaining: 0,
      nextColorIndex: newNextColorIndex,
      phase: PHASES.FRAME_OVER,
      frameOver: true,
      winner: w,
      foulActive: false,
      freeBallAvailable: false,
      cueBallInHand: false,
    };
    const shot = buildShot({
      frameState, newState, snap, ball, actionType: ACTION_TYPES.POT, isLegal: true,
      points: pointsGained, pointsTo: currentPlayer, foulPenalty: 0,
      playerName, opponentName, newPhase: PHASES.FRAME_OVER, newRedsRemaining: 0, newNextColorIndex,
      playerNames,
    });
    return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
  }

  const newState = {
    ...frameState,
    scores: newScores,
    currentBreak: newBreak,
    highestBreak: newHighestBreak,
    redsRemaining: newRedsRemaining,
    nextColorIndex: newNextColorIndex,
    phase: newPhase,
    foulActive: false,
    freeBallAvailable: false,
    cueBallInHand: false,
  };

  const shot = buildShot({
    frameState, newState, snap, ball, actionType: ACTION_TYPES.POT, isLegal: true,
    points: pointsGained, pointsTo: currentPlayer, foulPenalty: 0,
    playerName, opponentName, newPhase, newRedsRemaining, newNextColorIndex,
    playerNames,
  });

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── PROCESS FOUL ─────────────────────────────────────────────
export function processFoul(frameState, selectedBall, foulReason, playerNames, options = {}) {
  const snap = snapshot(frameState);
  const currentPlayer = frameState.currentPlayer;
  const opp = opponent(currentPlayer);
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opp];

  const legalBalls = getLegalBalls(frameState);
  const ballOnValue = options.ballOnValue ?? (BALL_VALUES[legalBalls[0]] ?? 4);
  const ballInvolvedValue = options.ballInvolvedValue ?? (selectedBall ? BALL_VALUES[selectedBall] ?? 4 : 4);
  const foulPenalty = calculateFoulPenalty(ballOnValue, ballInvolvedValue);

  const newScores = { ...frameState.scores };
  newScores[opp] += foulPenalty;

  // After foul: opponent gets choice — default switches turn
  // Reset break for current player
  const newHighestBreak = { ...frameState.highestBreak };

  let newPhase = frameState.phase;

  // If foul happens during COLOR_ON (a red was potted but colour wasn't),
  // the colour is re-spotted and the opponent starts from RED_ON.
  if (frameState.phase === PHASES.COLOR_ON && frameState.redsRemaining > 0) {
    newPhase = PHASES.RED_ON;
  }

  // Special: FINAL_BLACK foul — if scores equal after penalty, re-spot; else frame over
  let frameOver = false;
  let winner = null;

  if (frameState.phase === PHASES.FINAL_BLACK || frameState.phase === PHASES.RESPOTTED_BLACK) {
    const p1 = newScores.player1;
    const p2 = newScores.player2;
    if (p1 === p2) {
      newPhase = PHASES.RESPOTTED_BLACK;
    } else {
      newPhase = PHASES.FRAME_OVER;
      frameOver = true;
      winner = p1 > p2 ? 'player1' : 'player2';
    }
  }


  const ballOnLabel = getBallOnLabel(frameState);

  const newState = {
    ...frameState,
    scores: newScores,
    highestBreak: newHighestBreak,
    currentPlayer: opp, // turn switches to opponent
    currentBreak: 0,    // break resets
    phase: newPhase,
    foulActive: true,
    freeBallAvailable: true, // opponent may claim free ball
    cueBallInHand: true,
    frameOver,
    winner,
  };

  const shot = {
    id: frameState.shotCount + 1,
    actionType: ACTION_TYPES.FOUL,
    selectedBall,
    ballOn: legalBalls[0] ?? null,
    ballOnLabel,
    isLegal: false,
    points: 0,
    pointsTo: opp,
    foulPenalty,
    foulReason,
    phaseBefore: frameState.phase,
    phaseAfter: newPhase,
    breakBefore: frameState.currentBreak,
    breakAfter: 0,
    redsBefore: frameState.redsRemaining,
    redsAfter: frameState.redsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...newScores },
    explanation: buildExplanation({
      actionType: ACTION_TYPES.FOUL, playerName, opponentName,
      selectedBall, ballOn: legalBalls[0], ballOnLabel,
      isLegal: false, points: 0, pointsTo: opp,
      foulPenalty, foulReason,
      phaseBefore: frameState.phase, phaseAfter: newPhase,
      redsAfter: frameState.redsRemaining,
      nextBallOn: getBallOnLabel({ ...newState }),
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── PROCESS MISS ──────────────────────────────────────────────
// A miss in snooker is a foul — penalty = max(4, value of ball on).
// If in COLOR_ON phase (red was just potted), the colour is re-spotted
// and the opponent starts from RED_ON.
export function processMiss(frameState, playerNames) {
  const snap = snapshot(frameState);
  const currentPlayer = frameState.currentPlayer;
  const opp = opponent(currentPlayer);
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opp];
  const legalBalls = getLegalBalls(frameState);
  const ballOnLabel = getBallOnLabel(frameState);

  // Foul penalty: max(4, value of ball on)
  const ballOnValue = legalBalls[0] ? (BALL_VALUES[legalBalls[0]] ?? 4) : 4;
  const foulPenalty = Math.max(4, ballOnValue);

  const newScores = { ...frameState.scores };
  newScores[opp] += foulPenalty;

  // If COLOR_ON (after a red was potted), revert to RED_ON — colour re-spotted.
  let newPhase = frameState.phase;
  if (frameState.phase === PHASES.COLOR_ON && frameState.redsRemaining > 0) {
    newPhase = PHASES.RED_ON;
  }

  // FINAL_BLACK / RESPOTTED_BLACK: foul may end the frame
  let frameOver = false;
  let winner = null;
  if (frameState.phase === PHASES.FINAL_BLACK || frameState.phase === PHASES.RESPOTTED_BLACK) {
    const p1 = newScores.player1;
    const p2 = newScores.player2;
    if (p1 === p2) {
      newPhase = PHASES.RESPOTTED_BLACK;
    } else {
      newPhase = PHASES.FRAME_OVER;
      frameOver = true;
      winner = p1 > p2 ? 'player1' : 'player2';
    }
  }

  const newState = {
    ...frameState,
    scores: newScores,
    currentPlayer: opp,
    currentBreak: 0,
    phase: newPhase,
    foulActive: true,
    freeBallAvailable: true,
    cueBallInHand: true,
    frameOver,
    winner,
  };

  const nextBallOnLabel = getBallOnLabel(newState);

  const shot = {
    id: frameState.shotCount + 1,
    actionType: ACTION_TYPES.MISS,
    selectedBall: null,
    ballOn: legalBalls[0] ?? null,
    ballOnLabel,
    isLegal: false,
    points: 0,
    pointsTo: opp,
    foulPenalty,
    foulReason: 'Miss — failed to pot ball on',
    phaseBefore: frameState.phase,
    phaseAfter: newPhase,
    breakBefore: frameState.currentBreak,
    breakAfter: 0,
    redsBefore: frameState.redsRemaining,
    redsAfter: frameState.redsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...newScores },
    explanation: buildExplanation({
      actionType: ACTION_TYPES.MISS, playerName, opponentName,
      selectedBall: null, ballOn: legalBalls[0], ballOnLabel,
      isLegal: false, points: 0, pointsTo: opp,
      foulPenalty, foulReason: 'Miss',
      phaseBefore: frameState.phase, phaseAfter: newPhase,
      redsAfter: frameState.redsRemaining,
      nextBallOn: nextBallOnLabel,
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── PROCESS SAFETY ────────────────────────────────────────────
// Safety is a legal shot — no penalty, just ends the break and passes the turn.
// If in COLOR_ON (red was potted), the colour is re-spotted and opponent starts from RED_ON.
export function processSafety(frameState, playerNames) {
  const snap = snapshot(frameState);
  const currentPlayer = frameState.currentPlayer;
  const opp = opponent(currentPlayer);
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opp];
  const legalBalls = getLegalBalls(frameState);
  const ballOnLabel = getBallOnLabel(frameState);

  // If COLOR_ON (after a red was potted), revert to RED_ON — colour re-spotted.
  let newPhase = frameState.phase;
  if (frameState.phase === PHASES.COLOR_ON && frameState.redsRemaining > 0) {
    newPhase = PHASES.RED_ON;
  }

  const newState = {
    ...frameState,
    currentPlayer: opp,
    currentBreak: 0,
    phase: newPhase,
    foulActive: false,
    freeBallAvailable: false,
    cueBallInHand: false,
    frameOver: false,
    winner: null,
  };

  const nextBallOnLabel = getBallOnLabel(newState);

  const shot = {
    id: frameState.shotCount + 1,
    actionType: ACTION_TYPES.SAFETY,
    selectedBall: null,
    ballOn: legalBalls[0] ?? null,
    ballOnLabel,
    isLegal: true,
    points: 0,
    pointsTo: null,
    foulPenalty: 0,
    foulReason: null,
    phaseBefore: frameState.phase,
    phaseAfter: newPhase,
    breakBefore: frameState.currentBreak,
    breakAfter: 0,
    redsBefore: frameState.redsRemaining,
    redsAfter: frameState.redsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...frameState.scores },
    explanation: buildExplanation({
      actionType: ACTION_TYPES.SAFETY, playerName, opponentName,
      selectedBall: null, ballOn: legalBalls[0], ballOnLabel,
      isLegal: true, points: 0, pointsTo: null,
      foulPenalty: 0, foulReason: null,
      phaseBefore: frameState.phase, phaseAfter: newPhase,
      redsAfter: frameState.redsRemaining,
      nextBallOn: nextBallOnLabel,
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── PROCESS FREE BALL ────────────────────────────────────────
export function processFreeBall(frameState, nominatedBall, playerNames) {
  const snap = snapshot(frameState);
  const currentPlayer = frameState.currentPlayer;
  const legalBalls = getLegalBalls(frameState);
  const ballOnValue = BALL_VALUES[legalBalls[0]] ?? 1;
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opponent(currentPlayer)];

  // Award points equal to ball on value
  const newScores = { ...frameState.scores };
  newScores[currentPlayer] += ballOnValue;
  const newBreak = frameState.currentBreak + ballOnValue;
  const newHighestBreak = { ...frameState.highestBreak };
  if (newBreak > newHighestBreak[currentPlayer]) {
    newHighestBreak[currentPlayer] = newBreak;
  }

  // Phase transitions same as if real ball-on was potted
  let newPhase = frameState.phase;
  let newRedsRemaining = frameState.redsRemaining;
  let newNextColorIndex = frameState.nextColorIndex;

  if (frameState.phase === PHASES.RED_ON) {
    newRedsRemaining -= 1;
    newPhase = PHASES.COLOR_ON;
  } else if (frameState.phase === PHASES.COLOR_ON) {
    newPhase = newRedsRemaining > 0 ? PHASES.RED_ON : PHASES.COLORS_SEQUENCE;
  }

  const newState = {
    ...frameState,
    scores: newScores,
    currentBreak: newBreak,
    highestBreak: newHighestBreak,
    redsRemaining: newRedsRemaining,
    nextColorIndex: newNextColorIndex,
    phase: newPhase,
    foulActive: false,
    freeBallAvailable: false,
    cueBallInHand: false,
  };

  const shot = {
    id: frameState.shotCount + 1,
    actionType: ACTION_TYPES.FREE_BALL,
    selectedBall: nominatedBall,
    ballOn: legalBalls[0],
    ballOnLabel: getBallOnLabel(frameState),
    isLegal: true,
    points: ballOnValue,
    pointsTo: currentPlayer,
    foulPenalty: 0,
    foulReason: null,
    phaseBefore: frameState.phase,
    phaseAfter: newPhase,
    breakBefore: frameState.currentBreak,
    breakAfter: newBreak,
    redsBefore: frameState.redsRemaining,
    redsAfter: newRedsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...newScores },
    explanation: buildExplanation({
      actionType: ACTION_TYPES.FREE_BALL, playerName, opponentName,
      selectedBall: nominatedBall, ballOn: legalBalls[0],
      isLegal: true, points: ballOnValue, pointsTo: currentPlayer,
      foulPenalty: 0, foulReason: null,
      phaseBefore: frameState.phase, phaseAfter: newPhase,
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── PROCESS CONCEDE ──────────────────────────────────────────
export function processConcede(frameState, playerNames) {
  const snap = snapshot(frameState);
  const currentPlayer = frameState.currentPlayer;
  const opp = opponent(currentPlayer);
  const playerName = playerNames[currentPlayer];
  const opponentName = playerNames[opp];

  const newState = {
    ...frameState,
    phase: PHASES.FRAME_OVER,
    frameOver: true,
    winner: opp,
  };

  const shot = {
    id: frameState.shotCount + 1,
    actionType: ACTION_TYPES.CONCEDE,
    selectedBall: null,
    ballOn: null,
    isLegal: true,
    points: 0,
    pointsTo: opp,
    foulPenalty: 0,
    foulReason: null,
    phaseBefore: frameState.phase,
    phaseAfter: PHASES.FRAME_OVER,
    breakBefore: frameState.currentBreak,
    breakAfter: 0,
    redsBefore: frameState.redsRemaining,
    redsAfter: frameState.redsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...frameState.scores },
    explanation: buildExplanation({
      actionType: ACTION_TYPES.CONCEDE, playerName, opponentName,
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };

  return { newState: { ...newState, history: [...frameState.history, shot], shotCount: frameState.shotCount + 1 }, shot };
}

// ── UNDO ─────────────────────────────────────────────────────
export function undoShot(frameState) {
  if (frameState.history.length === 0) return { newState: frameState, undone: false };
  const lastShot = frameState.history[frameState.history.length - 1];
  const prevHistory = frameState.history.slice(0, -1);
  const restored = {
    ...lastShot.snapshotBefore,
    history: prevHistory,
    shotCount: frameState.shotCount - 1,
    highestBreak: frameState.highestBreak, // preserve highest break
  };
  return { newState: restored, undone: true, undoneShot: lastShot };
}

// ── Internal shot builder helper ─────────────────────────────
function buildShot({ frameState, newState, snap, ball, actionType, isLegal, points, pointsTo, foulPenalty, playerName, opponentName, newPhase, newRedsRemaining, newNextColorIndex, playerNames }) {
  const legalBalls = getLegalBalls(frameState);
  const ballOnLabel = getBallOnLabel(frameState);
  return {
    id: frameState.shotCount + 1,
    actionType,
    selectedBall: ball,
    ballOn: legalBalls[0] ?? null,
    ballOnLabel,
    isLegal,
    points,
    pointsTo,
    foulPenalty,
    foulReason: null,
    phaseBefore: frameState.phase,
    phaseAfter: newPhase,
    breakBefore: frameState.currentBreak,
    breakAfter: newState.currentBreak,
    redsBefore: frameState.redsRemaining,
    redsAfter: newRedsRemaining,
    scoreBefore: { ...frameState.scores },
    scoreAfter: { ...newState.scores },
    explanation: buildExplanation({
      actionType, playerName, opponentName,
      selectedBall: ball, ballOn: legalBalls[0], ballOnLabel,
      isLegal, points, pointsTo,
      foulPenalty, foulReason: null,
      phaseBefore: frameState.phase, phaseAfter: newPhase,
      redsAfter: newRedsRemaining,
      nextBallOn: getBallOnLabel({ ...newState, nextColorIndex: newNextColorIndex }),
    }),
    snapshotBefore: snap,
    snapshotAfter: snapshot(newState),
    createdAt: new Date().toISOString(),
  };
}
