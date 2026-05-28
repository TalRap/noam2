// Match screen — timer, scoring, cards, end-of-game flow

function MatchScreen({ state, matchId, onBack, onUpdate }) {
  const match = state.matches.find(m => m.id === matchId);
  const teamA = state.teams.find(t => t.id === match.teamA);
  const teamB = state.teams.find(t => t.id === match.teamB);

  const totalSec = state.minutes * 60;
  const initial = (() => {
    if (match.status === 'confirmed') return 0;
    if (match.status === 'active' || match.status === 'ended') return match.timeRemaining ?? 0;
    return totalSec;
  })();

  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(match.status === 'active');
  const [showEndModal, setShowEndModal] = useState(match.status === 'ended');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [cardModal, setCardModal] = useState(null); // {teamId, type}
  const tickRef = useRef(null);

  // Disqualified players (across all matches in the league)
  const allDisqualified = (() => {
    const set = new Set();
    state.matches.forEach(m => {
      (m.cards || []).forEach(c => {
        // count this player's cards within THIS match (yellow stacks within match for same-game red)
        const tally = (m.cards || []).filter(x => x.playerNum === c.playerNum && x.teamId === c.teamId);
        const hasRed = tally.some(x => x.type === 'red');
        const yellowCount = tally.filter(x => x.type === 'yellow').length;
        if (hasRed || yellowCount >= 2) set.add(`${c.teamId}:${c.playerNum}`);
      });
    });
    return set;
  })();

  // Per-team active players count (11 - disqualified for that team)
  const activeCount = (teamId) => {
    let dq = 0;
    allDisqualified.forEach(k => { if (k.startsWith(teamId + ':')) dq++; });
    return 11 - dq;
  };

  // Timer effect
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          sounds.longWhistle();
          setShowEndModal(true);
          return 0;
        }
        if (r === 11) sounds.warn(); // 10 sec warning
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  // Persist state on every change
  useEffect(() => {
    onUpdate({
      ...match,
      status: match.status === 'confirmed' ? 'confirmed' : (showEndModal ? 'ended' : (running ? 'active' : (remaining < totalSec ? 'active' : 'pending'))),
      timeRemaining: remaining,
    });
    // eslint-disable-next-line
  }, [remaining, running, showEndModal]);

  const updateMatch = (patch) => onUpdate({ ...match, ...patch });

  const addGoal = (which) => {
    if (match.status === 'confirmed') return;
    sounds.goal();
    const minute = Math.max(1, Math.ceil((totalSec - remaining) / 60));
    const goal = { id: uid(), teamId: which === 'a' ? teamA.id : teamB.id, minute };
    updateMatch({
      scoreA: which === 'a' ? match.scoreA + 1 : match.scoreA,
      scoreB: which === 'b' ? match.scoreB + 1 : match.scoreB,
      goals: [...(match.goals || []), goal],
    });
  };

  const removeLastGoal = (which) => {
    if (match.status === 'confirmed') return;
    const teamId = which === 'a' ? teamA.id : teamB.id;
    const goals = [...(match.goals || [])];
    for (let i = goals.length - 1; i >= 0; i--) {
      if (goals[i].teamId === teamId) {
        goals.splice(i, 1);
        updateMatch({
          scoreA: which === 'a' ? Math.max(0, match.scoreA - 1) : match.scoreA,
          scoreB: which === 'b' ? Math.max(0, match.scoreB - 1) : match.scoreB,
          goals,
        });
        sounds.click();
        return;
      }
    }
  };

  const openCard = (teamId, type) => {
    if (match.status === 'confirmed') return;
    sounds.click();
    setCardModal({ teamId, type });
  };

  const recordCard = (playerNum) => {
    const { teamId, type } = cardModal;
    const minute = Math.max(1, Math.ceil((totalSec - remaining) / 60));
    const newCard = { id: uid(), teamId, playerNum, type, minute };
    sounds.warn();
    updateMatch({ cards: [...(match.cards || []), newCard] });
    setCardModal(null);
  };

  const confirmFinalScore = (a, b) => {
    sounds.click();
    if (a === b) {
      // Need penalties
      updateMatch({ scoreA: a, scoreB: b });
      setShowEndModal(false);
      setShowPenaltyModal(true);
      return;
    }
    const winnerId = a > b ? teamA.id : teamB.id;
    updateMatch({ scoreA: a, scoreB: b, winnerId, status: 'confirmed', timeRemaining: 0, penaltiesA: null, penaltiesB: null });
    sounds.win();
    setShowEndModal(false);
    // Brief pause so the user sees the result, then go back
    setTimeout(() => onBack(), 500);
  };

  const confirmPenalties = (pa, pb) => {
    if (pa === pb) {
      // re-prompt; should not lock
      return;
    }
    sounds.win();
    const winnerId = pa > pb ? teamA.id : teamB.id;
    updateMatch({ penaltiesA: pa, penaltiesB: pb, winnerId, status: 'confirmed', timeRemaining: 0 });
    setShowPenaltyModal(false);
    setTimeout(() => onBack(), 500);
  };

  const unlockEdit = () => {
    sounds.click();
    setShowEditScore(true);
  };

  const handleStart = () => {
    if (remaining === 0) {
      setRemaining(totalSec);
      updateMatch({ scoreA: 0, scoreB: 0, goals: [], cards: [], winnerId: null, status: 'pending', timeRemaining: totalSec, penaltiesA: null, penaltiesB: null });
    }
    sounds.whistle();
    setRunning(true);
  };

  // Cards per team in this match
  const teamCards = (teamId, type) => (match.cards || []).filter(c => c.teamId === teamId && c.type === type);

  // Build event timeline
  const events = (() => {
    const ev = [];
    (match.goals || []).forEach(g => ev.push({ ...g, kind: 'goal' }));
    (match.cards || []).forEach(c => ev.push({ ...c, kind: 'card' }));
    return ev.sort((a, b) => b.minute - a.minute || 0);
  })();

  const danger = running && remaining > 0 && remaining <= 10;

  return (
    <div className="pitch-bg">
      <div className="match-top">
        <button className="match-back" onClick={onBack}>
          <Icon.ArrowRight /> חזרה ללוח המשחקים
        </button>
        <div className="match-round-pill">{roundName(match.round)} · משחק #{match.matchNum}</div>
        <div style={{ width: 160 }} />
      </div>

      {/* SCOREBOARD */}
      <div className="scoreboard">
        <div className="sb-team">
          <TeamFlag className="sb-flag" colors={teamA.colors} />
          <div className="sb-name">{teamA.name}</div>
          <div className="sb-meta">{activeCount(teamA.id)} שחקנים</div>
          <div className="sb-cards">
            {teamCards(teamA.id, 'yellow').map(c => <div key={c.id} className="sb-mini-card y" title={`#${c.playerNum} ${c.minute}'`} />)}
            {teamCards(teamA.id, 'red').map(c => <div key={c.id} className="sb-mini-card r" title={`#${c.playerNum} ${c.minute}'`} />)}
          </div>
        </div>

        <div className="sb-center">
          <div className="sb-score">
            <div className="sb-score-num">{match.scoreA}</div>
            <div className="sb-dash">–</div>
            <div className="sb-score-num">{match.scoreB}</div>
          </div>
          <div className={`sb-timer ${danger ? 'danger' : ''}`}>
            {running && <span className="sb-timer-dot" />}
            {formatTime(remaining)}
          </div>
          {match.penaltiesA != null && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>
              פנדלים: {match.penaltiesA}–{match.penaltiesB}
            </div>
          )}
          {match.status === 'confirmed' && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pitch-light)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Icon.Check /> תוצאה ננעלה
            </div>
          )}
        </div>

        <div className="sb-team">
          <TeamFlag className="sb-flag" colors={teamB.colors} />
          <div className="sb-name">{teamB.name}</div>
          <div className="sb-meta">{activeCount(teamB.id)} שחקנים</div>
          <div className="sb-cards">
            {teamCards(teamB.id, 'yellow').map(c => <div key={c.id} className="sb-mini-card y" title={`#${c.playerNum} ${c.minute}'`} />)}
            {teamCards(teamB.id, 'red').map(c => <div key={c.id} className="sb-mini-card r" title={`#${c.playerNum} ${c.minute}'`} />)}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      {match.status !== 'confirmed' ? (
        <div className="match-controls">
          {/* Team A panel */}
          <div className="team-panel">
            <div className="tp-title">{teamA.name}</div>
            <div className="tp-actions">
              <button className="tp-btn goal" onClick={() => addGoal('a')}>
                <Icon.Ball /> שער!
              </button>
              <button className="tp-btn yellow" onClick={() => openCard(teamA.id, 'yellow')}>
                <Icon.Card type="yellow" size={20} /> כרטיס צהוב
              </button>
              <button className="tp-btn red" onClick={() => openCard(teamA.id, 'red')}>
                <Icon.Card type="red" size={20} /> כרטיס אדום
              </button>
              {match.scoreA > 0 && (
                <button className="tp-btn" style={{ gridColumn: 'span 2', padding: 8, fontSize: 12 }} onClick={() => removeLastGoal('a')}>
                  ↶ בטל שער אחרון
                </button>
              )}
            </div>
          </div>

          {/* Timer middle */}
          <div className="timer-panel">
            {remaining === 0 ? (
              <button className="timer-btn play" onClick={handleStart} title="התחל מחדש">
                <Icon.Shuffle size={28} />
              </button>
            ) : running ? (
              <button className="timer-btn stop" onClick={() => { setRunning(false); sounds.click(); }} title="השהה">
                <Icon.Pause size={32} />
              </button>
            ) : (
              <button className="timer-btn play" onClick={handleStart} title="התחל">
                <Icon.Play size={32} />
              </button>
            )}
            <div className="timer-label">{running ? 'השהה' : (remaining === totalSec ? 'התחל משחק' : 'המשך')}</div>
            {!running && remaining > 0 && remaining < totalSec && (
              <button className="btn-ghost" style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }} onClick={() => { setRemaining(totalSec); updateMatch({ scoreA: 0, scoreB: 0, goals: [], cards: [], timeRemaining: totalSec }); }}>
                אפס משחק
              </button>
            )}
          </div>

          {/* Team B panel */}
          <div className="team-panel">
            <div className="tp-title">{teamB.name}</div>
            <div className="tp-actions">
              <button className="tp-btn goal" onClick={() => addGoal('b')}>
                <Icon.Ball /> שער!
              </button>
              <button className="tp-btn yellow" onClick={() => openCard(teamB.id, 'yellow')}>
                <Icon.Card type="yellow" size={20} /> כרטיס צהוב
              </button>
              <button className="tp-btn red" onClick={() => openCard(teamB.id, 'red')}>
                <Icon.Card type="red" size={20} /> כרטיס אדום
              </button>
              {match.scoreB > 0 && (
                <button className="tp-btn" style={{ gridColumn: 'span 2', padding: 8, fontSize: 12 }} onClick={() => removeLastGoal('b')}>
                  ↶ בטל שער אחרון
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="match-controls" style={{ gridTemplateColumns: '1fr' }}>
          <div className="team-panel" style={{ alignItems: 'center', textAlign: 'center', padding: 24 }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--pitch)', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Trophy /> {state.teams.find(t => t.id === match.winnerId)?.name} ניצחה!
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={unlockEdit}>
                <Icon.X /> שנה תוצאה
              </button>
              <button className="btn btn-primary" onClick={onBack}>
                <Icon.Check /> סיימתי <Icon.ArrowLeft />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT LOG */}
      <div className="event-log">
        <h3>אירועי המשחק</h3>
        {events.length === 0 ? (
          <div className="event-empty">השריקה תינתן בקרוב — אין עדיין אירועים</div>
        ) : (
          <div className="events">
            {events.map((e, i) => {
              const team = e.teamId === teamA.id ? teamA : teamB;
              return (
                <div className="event-row" key={e.id || i}>
                  <div className="event-min">{e.minute}׳</div>
                  <div className="event-icon">
                    {e.kind === 'goal' ? <Icon.Ball size={20} /> : <div className={`event-card-icon ${e.type === 'yellow' ? 'y' : 'r'}`} />}
                  </div>
                  <div className="event-text">
                    {e.kind === 'goal' ? 'שער ל' : (e.type === 'yellow' ? 'כרטיס צהוב ל' : 'כרטיס אדום ל')}
                    <span className="event-team"> {team.name}</span>
                    {e.kind === 'card' && <span style={{ color: 'var(--muted)' }}> · שחקן #{e.playerNum}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PLAYER PICKER MODAL */}
      {cardModal && (
        <PlayerPickerModal
          team={cardModal.teamId === teamA.id ? teamA : teamB}
          type={cardModal.type}
          allDisqualified={allDisqualified}
          inMatchCards={(match.cards || []).filter(c => c.teamId === cardModal.teamId)}
          onPick={recordCard}
          onClose={() => setCardModal(null)}
        />
      )}

      {/* END OF GAME SCORE MODAL */}
      {(showEndModal || showEditScore) && (
        <EndScoreModal
          teamA={teamA}
          teamB={teamB}
          scoreA={match.scoreA}
          scoreB={match.scoreB}
          onConfirm={confirmFinalScore}
          onCancel={() => { setShowEndModal(false); setShowEditScore(false); }}
          editing={showEditScore}
        />
      )}

      {/* PENALTY MODAL */}
      {showPenaltyModal && (
        <PenaltyModal
          teamA={teamA}
          teamB={teamB}
          initialA={match.penaltiesA ?? 0}
          initialB={match.penaltiesB ?? 0}
          onConfirm={confirmPenalties}
          onBack={() => { setShowPenaltyModal(false); setShowEndModal(true); }}
        />
      )}
    </div>
  );
}

// ============ END SCORE MODAL ============
function EndScoreModal({ teamA, teamB, scoreA, scoreB, onConfirm, onCancel, editing }) {
  const [a, setA] = useState(scoreA);
  const [b, setB] = useState(scoreB);

  return (
    <div className="modal-backdrop" onMouseDown={editing ? onCancel : undefined}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-title">{editing ? 'עדכן תוצאה' : 'נגמר המשחק!'}</div>
        <div className="modal-sub">{editing ? 'הזן את התוצאה החדשה' : 'מה התוצאה הסופית?'}</div>

        <div className="score-edit">
          <div className="score-edit-side">
            <TeamFlag className="score-edit-flag" colors={teamA.colors} />
            <div className="score-edit-name">{teamA.name}</div>
            <Stepper value={a} onChange={setA} />
          </div>
          <div className="score-edit-dash">–</div>
          <div className="score-edit-side">
            <TeamFlag className="score-edit-flag" colors={teamB.colors} />
            <div className="score-edit-name">{teamB.name}</div>
            <Stepper value={b} onChange={setB} />
          </div>
        </div>

        {a === b && (
          <div style={{ background: 'rgba(245,158,11,.12)', color: '#7c2d12', padding: 10, borderRadius: 10, fontWeight: 700, textAlign: 'center', fontSize: 14 }}>
            תיקו — אחרי האישור יתקיים קרב פנדלים ⚽
          </div>
        )}

        <div className="modal-row">
          {editing && <button className="btn btn-secondary" onClick={onCancel}>ביטול</button>}
          <button className="btn btn-primary" onClick={() => onConfirm(a, b)}>
            <Icon.Check /> אישור תוצאה
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ PENALTY MODAL ============
function PenaltyModal({ teamA, teamB, initialA, initialB, onConfirm, onBack }) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-title">🥅 קרב פנדלים</div>
        <div className="modal-sub">המשחק הסתיים בתיקו. הזן את התוצאה של הפנדלים:</div>

        <div className="score-edit">
          <div className="score-edit-side">
            <TeamFlag className="score-edit-flag" colors={teamA.colors} />
            <div className="score-edit-name">{teamA.name}</div>
            <Stepper value={a} onChange={setA} />
          </div>
          <div className="score-edit-dash">–</div>
          <div className="score-edit-side">
            <TeamFlag className="score-edit-flag" colors={teamB.colors} />
            <div className="score-edit-name">{teamB.name}</div>
            <Stepper value={b} onChange={setB} />
          </div>
        </div>

        {a === b && (
          <div style={{ background: 'rgba(220,38,38,.1)', color: '#7f1d1d', padding: 10, borderRadius: 10, fontWeight: 700, textAlign: 'center', fontSize: 14 }}>
            הפנדלים לא יכולים להיגמר בתיקו — חייב להיות מנצח
          </div>
        )}

        <div className="modal-row">
          <button className="btn btn-secondary" onClick={onBack}>חזרה</button>
          <button className="btn btn-primary" disabled={a === b} onClick={() => onConfirm(a, b)}>
            <Icon.Check /> אישור מנצחת
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ PLAYER PICKER ============
function PlayerPickerModal({ team, type, allDisqualified, inMatchCards, onPick, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`modal-card-banner ${type}`}>
          <div className="card-icon" />
          <div>
            <div style={{ fontSize: 16 }}>{type === 'yellow' ? 'כרטיס צהוב' : 'כרטיס אדום'} ל{team.name}</div>
            <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>בחר את השחקן שעשה את העבירה</div>
          </div>
        </div>

        <div className="player-list">
          {Array.from({ length: 11 }, (_, i) => i + 1).map(num => {
            const playerCards = inMatchCards.filter(c => c.playerNum === num);
            const yellowsInMatch = playerCards.filter(c => c.type === 'yellow').length;
            const redInMatch = playerCards.some(c => c.type === 'red');
            const disqualified = allDisqualified.has(`${team.id}:${num}`);
            return (
              <button
                key={num}
                className={`player-row ${disqualified ? 'disqualified' : ''}`}
                disabled={disqualified}
                onClick={() => onPick(num)}
              >
                <div className="player-num">{num}</div>
                <div style={{ flex: 1 }}>שחקן #{num}</div>
                <div className="player-cards">
                  {Array.from({ length: yellowsInMatch }).map((_, i) => <Icon.Card key={'y'+i} type="yellow" size={14} />)}
                  {redInMatch && <Icon.Card type="red" size={14} />}
                </div>
                {disqualified && <span style={{ fontSize: 11, color: 'var(--red-card)', fontWeight: 700 }}>נפסל</span>}
              </button>
            );
          })}
        </div>

        <div className="modal-row">
          <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="icon-btn" onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 36, height: 36 }}><Icon.Minus /></button>
      <input
        className="score-input"
        type="number"
        min="0"
        max="99"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
      />
      <button className="icon-btn" onClick={() => onChange(Math.min(99, value + 1))} style={{ width: 36, height: 36 }}><Icon.Plus /></button>
    </div>
  );
}

Object.assign(window, { MatchScreen });
