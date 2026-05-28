// Tournament overview — list of all matches by round

function TournamentScreen({ state, onPlay, onReset }) {
  const { teams, matches } = state;
  const teamById = (id) => teams.find(t => t.id === id);

  // Group by round
  const order = ['round16', 'quarter', 'semi', 'third', 'final'];
  const grouped = order.reduce((acc, r) => {
    const ms = matches.filter(m => m.round === r);
    if (ms.length) acc.push({ round: r, matches: ms });
    return acc;
  }, []);

  // The next playable match: first not-confirmed match whose round is unlocked
  const nextMatchId = (() => {
    for (const g of grouped) {
      const roundUnlocked = g.matches.every(m => m.teamA && m.teamB);
      if (!roundUnlocked) continue;
      const next = g.matches.find(m => m.status !== 'confirmed');
      if (next) return next.id;
    }
    return null;
  })();

  const allDone = matches.every(m => m.status === 'confirmed');

  const renderTeam = (id, isWinner, isLoser) => {
    if (!id) return (
      <div className="mt-team left">
        <div className="mt-flag" style={{ background: '#e2e8f0' }} />
        <div className="mt-name" style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 600 }}>בהמתנה</div>
      </div>
    );
    const t = teamById(id);
    return (
      <div className={`mt-team left ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}>
        <TeamFlag className="mt-flag" colors={t.colors} />
        <div className="mt-name">{t.name}</div>
      </div>
    );
  };

  const matchStatus = (m) => {
    if (m.status === 'confirmed') return { cls: 'confirmed', label: 'הסתיים' };
    if (m.status === 'ended') return { cls: 'ended', label: 'מחכה לאישור' };
    if (m.status === 'active') return { cls: 'active', label: 'משחק עכשיו' };
    if (m.id === nextMatchId) return { cls: '', label: 'הבא בתור' };
    return { cls: '', label: 'בהמתנה' };
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">לוח המשחקים</h2>
          <div className="section-subtitle">
            סדר המשחקים הוגרל אקראית · {matches.filter(m => m.status === 'confirmed').length}/{matches.length} משחקים הסתיימו
          </div>
        </div>
        {allDone && (
          <button className="btn btn-primary" onClick={() => onPlay('winners')}>
            <Icon.Trophy /> ראה תוצאות סופיות
          </button>
        )}
      </div>

      <div className="rounds">
        {grouped.map(({ round, matches: ms }) => {
          const locked = ms.some(m => !m.teamA || !m.teamB);
          const active = !locked && ms.some(m => m.status !== 'confirmed');
          const done = ms.every(m => m.status === 'confirmed');
          return (
            <div className="round-section" key={round}>
              <div className="round-header">
                <span className={`round-badge ${locked ? 'locked' : active ? 'active' : ''}`}>
                  {roundName(round)}
                </span>
                <span className="round-meta">
                  {ms.length} משחק{ms.length > 1 ? 'ים' : ''} ·
                  {locked ? ' ננעל עד שיוכרעו הסיבובים הקודמים' :
                   done ? ' הסתיים' :
                   ` ${ms.filter(m => m.status === 'confirmed').length}/${ms.length} הסתיימו`}
                </span>
              </div>
              <div className="matches-list">
                {ms.map((m, idx) => {
                  const st = matchStatus(m);
                  const winnerA = m.winnerId === m.teamA;
                  const winnerB = m.winnerId === m.teamB;
                  const isNext = m.id === nextMatchId;
                  const isLocked = !m.teamA || !m.teamB;
                  const cardCls = `match-card ${isLocked ? 'locked' : ''} ${isNext ? 'next' : ''} ${m.status === 'confirmed' ? 'done' : ''}`;

                  return (
                    <div className={cardCls} key={m.id}>
                      <div className="match-head">
                        <span className="match-num">משחק #{m.matchNum}</span>
                        <span className={`match-status ${st.cls}`}>
                          <span className="status-dot" />
                          {st.label}
                        </span>
                      </div>

                      <div className="match-teams">
                        {renderTeam(m.teamA, winnerA, m.status === 'confirmed' && winnerB)}
                        {m.status === 'confirmed' ? (
                          <div className={`mt-score ${winnerA ? 'winner-a' : winnerB ? 'winner-a' : ''}`}>
                            {m.scoreA}–{m.scoreB}
                          </div>
                        ) : (
                          <div className="mt-vs">VS</div>
                        )}
                        {renderTeam(m.teamB, winnerB, m.status === 'confirmed' && winnerA)}
                      </div>

                      {m.status === 'confirmed' && m.penaltiesA != null && (
                        <div className="mt-pen" style={{ textAlign: 'center' }}>
                          פנדלים: {m.penaltiesA}–{m.penaltiesB}
                        </div>
                      )}

                      <div className="match-foot">
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {m.cards && m.cards.length > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon.Card type="yellow" /> {m.cards.filter(c => c.type === 'yellow').length}
                              {' '}
                              <Icon.Card type="red" /> {m.cards.filter(c => c.type === 'red').length}
                            </span>
                          )}
                        </div>
                        {!isLocked && (
                          m.status === 'confirmed' ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => onPlay('match', m.id)}>
                              <Icon.Shuffle /> שחק מחדש
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={!isNext}
                              onClick={() => onPlay('match', m.id)}
                              title={isNext ? '' : 'יש לסיים תחילה את המשחקים הקודמים'}
                            >
                              {m.status === 'ended' ? 'המשך' : 'התחל'} <Icon.ArrowLeft />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { TournamentScreen });
