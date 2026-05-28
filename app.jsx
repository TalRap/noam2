// Main app — screen routing, state management, bracket logic

const { useState: useS, useEffect: useE } = React;

// ============ TOURNAMENT GENERATION ============
function buildBracket(teams) {
  // shuffle and create round 1 matches
  const order = shuffle(teams);
  const n = order.length;
  const matches = [];
  let matchNum = 1;

  if (n === 8) {
    // Quarter finals: 4 matches
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: uid(),
        round: 'quarter',
        matchNum: matchNum++,
        bracketSlot: i,
        teamA: order[i * 2].id,
        teamB: order[i * 2 + 1].id,
        scoreA: 0, scoreB: 0,
        goals: [], cards: [],
        status: 'pending',
        winnerId: null,
        penaltiesA: null, penaltiesB: null,
        timeRemaining: null,
      });
    }
    // Semi finals: 2 matches (placeholders)
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: uid(),
        round: 'semi',
        matchNum: matchNum++,
        bracketSlot: i,
        teamA: null, teamB: null,
        scoreA: 0, scoreB: 0,
        goals: [], cards: [],
        status: 'pending',
        winnerId: null,
        penaltiesA: null, penaltiesB: null,
        timeRemaining: null,
        // Where do we pull from?
        sourceA: { type: 'winner', round: 'quarter', slot: i * 2 },
        sourceB: { type: 'winner', round: 'quarter', slot: i * 2 + 1 },
      });
    }
    // Third place
    matches.push({
      id: uid(),
      round: 'third',
      matchNum: matchNum++,
      bracketSlot: 0,
      teamA: null, teamB: null,
      scoreA: 0, scoreB: 0,
      goals: [], cards: [],
      status: 'pending', winnerId: null,
      penaltiesA: null, penaltiesB: null, timeRemaining: null,
      sourceA: { type: 'loser', round: 'semi', slot: 0 },
      sourceB: { type: 'loser', round: 'semi', slot: 1 },
    });
    // Final
    matches.push({
      id: uid(),
      round: 'final',
      matchNum: matchNum++,
      bracketSlot: 0,
      teamA: null, teamB: null,
      scoreA: 0, scoreB: 0,
      goals: [], cards: [],
      status: 'pending', winnerId: null,
      penaltiesA: null, penaltiesB: null, timeRemaining: null,
      sourceA: { type: 'winner', round: 'semi', slot: 0 },
      sourceB: { type: 'winner', round: 'semi', slot: 1 },
    });
  } else if (n === 16) {
    // Round of 16: 8 matches
    for (let i = 0; i < 8; i++) {
      matches.push({
        id: uid(), round: 'round16', matchNum: matchNum++, bracketSlot: i,
        teamA: order[i * 2].id, teamB: order[i * 2 + 1].id,
        scoreA: 0, scoreB: 0, goals: [], cards: [],
        status: 'pending', winnerId: null,
        penaltiesA: null, penaltiesB: null, timeRemaining: null,
      });
    }
    // Quarter: 4
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: uid(), round: 'quarter', matchNum: matchNum++, bracketSlot: i,
        teamA: null, teamB: null, scoreA: 0, scoreB: 0, goals: [], cards: [],
        status: 'pending', winnerId: null,
        penaltiesA: null, penaltiesB: null, timeRemaining: null,
        sourceA: { type: 'winner', round: 'round16', slot: i * 2 },
        sourceB: { type: 'winner', round: 'round16', slot: i * 2 + 1 },
      });
    }
    // Semi: 2
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: uid(), round: 'semi', matchNum: matchNum++, bracketSlot: i,
        teamA: null, teamB: null, scoreA: 0, scoreB: 0, goals: [], cards: [],
        status: 'pending', winnerId: null,
        penaltiesA: null, penaltiesB: null, timeRemaining: null,
        sourceA: { type: 'winner', round: 'quarter', slot: i * 2 },
        sourceB: { type: 'winner', round: 'quarter', slot: i * 2 + 1 },
      });
    }
    // Third
    matches.push({
      id: uid(), round: 'third', matchNum: matchNum++, bracketSlot: 0,
      teamA: null, teamB: null, scoreA: 0, scoreB: 0, goals: [], cards: [],
      status: 'pending', winnerId: null,
      penaltiesA: null, penaltiesB: null, timeRemaining: null,
      sourceA: { type: 'loser', round: 'semi', slot: 0 },
      sourceB: { type: 'loser', round: 'semi', slot: 1 },
    });
    // Final
    matches.push({
      id: uid(), round: 'final', matchNum: matchNum++, bracketSlot: 0,
      teamA: null, teamB: null, scoreA: 0, scoreB: 0, goals: [], cards: [],
      status: 'pending', winnerId: null,
      penaltiesA: null, penaltiesB: null, timeRemaining: null,
      sourceA: { type: 'winner', round: 'semi', slot: 0 },
      sourceB: { type: 'winner', round: 'semi', slot: 1 },
    });
  }

  return matches;
}

// Resolve sourceA/sourceB → actual team ids based on prior match results
function resolveBracket(matches) {
  return matches.map(m => {
    if (m.teamA && m.teamB) return m;
    let teamA = m.teamA, teamB = m.teamB;
    if (!teamA && m.sourceA) teamA = resolveSource(matches, m.sourceA);
    if (!teamB && m.sourceB) teamB = resolveSource(matches, m.sourceB);
    return { ...m, teamA, teamB };
  });
}

function resolveSource(matches, src) {
  const source = matches.find(m => m.round === src.round && m.bracketSlot === src.slot);
  if (!source || source.status !== 'confirmed') return null;
  if (src.type === 'winner') return source.winnerId;
  // loser
  return source.teamA === source.winnerId ? source.teamB : source.teamA;
}

// ============ APP ============
function App() {
  const [state, setState] = useS(() => loadState() || { screen: 'setup' });
  const [muted, setMuted] = useS(soundMuted());
  const [toast, setToast] = useS(null);

  // Persist
  useE(() => { saveState(state); }, [state]);

  // Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // Initialize audio context on first user click (browser requirement)
  useE(() => {
    const wake = () => {
      try {
        const ctx = (window.AudioContext || window.webkitAudioContext);
        if (ctx) new ctx(); // wake up
      } catch (e) {}
      document.removeEventListener('click', wake);
    };
    document.addEventListener('click', wake, { once: true });
    return () => document.removeEventListener('click', wake);
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  // ============ ACTIONS ============
  const startTournament = ({ teams, minutes }) => {
    const matches = buildBracket(teams);
    const resolved = resolveBracket(matches);
    setState({ screen: 'tournament', teams, minutes, matches: resolved });
    showToast('🏆 הטורניר התחיל! בהצלחה!');
  };

  const goToMatch = (target, matchId) => {
    if (target === 'match') {
      setState(s => ({ ...s, screen: 'match', currentMatchId: matchId }));
    } else if (target === 'winners') {
      setState(s => ({ ...s, screen: 'winners' }));
    }
  };

  const backToTournament = () => {
    setState(s => {
      const next = { ...s, screen: 'tournament', currentMatchId: null };
      // Re-resolve bracket in case a match was confirmed
      next.matches = resolveBracket(s.matches);
      return next;
    });
    // Round-completion banner
    setTimeout(() => {
      const matches = resolveBracket(state.matches);
      const order = ['round16', 'quarter', 'semi', 'third', 'final'];
      for (const r of order) {
        const inRound = matches.filter(m => m.round === r);
        if (!inRound.length) continue;
        const justFinished = inRound.every(m => m.status === 'confirmed');
        if (justFinished) {
          if (r === 'quarter' || r === 'round16') showToast('✨ עוברים לחצי גמר!');
          else if (r === 'semi') showToast('🎯 משחקי הגמר נקבעו!');
        }
      }
    }, 100);
  };

  const updateMatch = (updated) => {
    setState(s => {
      let matches = s.matches.map(m => m.id === updated.id ? updated : m);
      matches = resolveBracket(matches);
      return { ...s, matches };
    });
  };

  const [showResetConfirm, setShowResetConfirm] = useS(false);

  const resetAll = () => setShowResetConfirm(true);

  const doReset = () => {
    clearState();
    setState({ screen: 'setup' });
    setShowResetConfirm(false);
    showToast('מתחילים מחדש 🔄');
  };

  // ============ RENDER ============
  const renderTopbar = () => (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-title">המשחק של נועם</div>
          <div className="brand-sub">⚽ ניהול טורניר כדורגל</div>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleMute} title={muted ? 'הפעל סאונד' : 'השתק'}>
          <Icon.Volume muted={muted} />
        </button>
        {state.screen !== 'setup' && (
          <button className="btn btn-secondary btn-sm" onClick={resetAll} title="מתחילים טורניר חדש מאפס">
            <Icon.Shuffle /> טורניר חדש
          </button>
        )}
      </div>
    </div>
  );

  // Top bar visible everywhere except inside match (full-bleed pitch)
  const showTopbar = state.screen !== 'match' && state.screen !== 'winners';

  return (
    <div className="app">
      {showTopbar && renderTopbar()}

      {state.screen === 'setup' && (
        <SetupScreen onStart={startTournament} />
      )}

      {state.screen === 'tournament' && (
        <TournamentScreen state={state} onPlay={goToMatch} onReset={resetAll} />
      )}

      {state.screen === 'match' && state.currentMatchId && (
        <MatchScreen
          state={state}
          matchId={state.currentMatchId}
          onBack={backToTournament}
          onUpdate={updateMatch}
        />
      )}

      {state.screen === 'winners' && (
        <WinnersScreen
          state={state}
          onBack={() => setState(s => ({ ...s, screen: 'tournament' }))}
          onRestart={resetAll}
        />
      )}

      {showResetConfirm && (
        <div className="modal-backdrop" onMouseDown={() => setShowResetConfirm(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-title">להתחיל טורניר חדש?</div>
            <div className="modal-sub">
              כל התוצאות הנוכחיות יימחקו ותוכל להזין מחדש את הקבוצות, הצבעים ואורך המשחק.
            </div>
            <div className="modal-row">
              <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>ביטול</button>
              <button className="btn btn-primary" onClick={doReset} style={{ background: 'var(--red-card)', boxShadow: '0 4px 0 #991b1b, 0 8px 16px rgba(220,38,38,.25)' }}>
                <Icon.Trash /> כן, התחל מחדש
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
