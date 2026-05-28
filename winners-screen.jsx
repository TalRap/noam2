// Winners screen — podium, stats, standings

function WinnersScreen({ state, onRestart, onBack }) {
  const { teams, matches } = state;
  const teamById = (id) => teams.find(t => t.id === id);

  const final = matches.find(m => m.round === 'final');
  const third = matches.find(m => m.round === 'third');

  const first = final && final.winnerId ? teamById(final.winnerId) : null;
  const second = final && final.winnerId ? teamById(final.teamA === final.winnerId ? final.teamB : final.teamA) : null;
  const thirdT = third && third.winnerId ? teamById(third.winnerId) : null;
  const fourth = third && third.winnerId ? teamById(third.teamA === third.winnerId ? third.teamB : third.teamA) : null;

  // Per-team stats
  const stats = teams.map(t => {
    let played = 0, won = 0, lost = 0, gf = 0, ga = 0, yellow = 0, red = 0;
    matches.forEach(m => {
      if (m.status !== 'confirmed') return;
      if (m.teamA === t.id || m.teamB === t.id) {
        played++;
        const isA = m.teamA === t.id;
        gf += isA ? m.scoreA : m.scoreB;
        ga += isA ? m.scoreB : m.scoreA;
        if (m.winnerId === t.id) won++; else lost++;
        (m.cards || []).filter(c => c.teamId === t.id).forEach(c => c.type === 'yellow' ? yellow++ : red++);
      }
    });
    return { team: t, played, won, lost, gf, ga, gd: gf - ga, yellow, red };
  });

  // Place ranking
  const placeOf = (t) => {
    if (first && t.id === first.id) return 1;
    if (second && t.id === second.id) return 2;
    if (thirdT && t.id === thirdT.id) return 3;
    if (fourth && t.id === fourth.id) return 4;
    return 0;
  };
  const sortedStats = [...stats].sort((a, b) => {
    const pa = placeOf(a.team), pb = placeOf(b.team);
    if (pa && pb) return pa - pb;
    if (pa) return -1;
    if (pb) return 1;
    if (b.won !== a.won) return b.won - a.won;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  // Top scorer (by goals — counting team only, since we don't track per-player goals)
  const topScorerTeam = stats.reduce((acc, s) => s.gf > acc.gf ? s : acc, stats[0]);
  const totalGoals = matches.reduce((s, m) => s + (m.status === 'confirmed' ? (m.scoreA + m.scoreB) : 0), 0);
  const totalMatches = matches.filter(m => m.status === 'confirmed').length;
  const totalYellow = matches.reduce((s, m) => s + (m.cards || []).filter(c => c.type === 'yellow').length, 0);
  const totalRed = matches.reduce((s, m) => s + (m.cards || []).filter(c => c.type === 'red').length, 0);

  // Confetti burst once
  useEffect(() => {
    if (!first) return;
    sounds.win();
    const colors = ['#fbbf24', '#dc2626', '#16a34a', '#2563eb', '#facc15', '#ec4899'];
    const burst = () => {
      for (let i = 0; i < 40; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDelay = (Math.random() * 1.5) + 's';
        el.style.animationDuration = (3 + Math.random() * 2) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 6000);
      }
    };
    burst();
    const timer = setTimeout(burst, 1200);
    return () => clearTimeout(timer);
  }, [first?.id]);

  return (
    <div className="winners-bg">
      <div className="match-top">
        <button className="match-back" onClick={onBack}>
          <Icon.ArrowRight /> חזרה ללוח המשחקים
        </button>
        <div className="match-round-pill" style={{ background: '#fbbf24' }}>סיכום הטורניר 🏆</div>
        <div style={{ width: 160 }} />
      </div>

      <div className="winners-title">המנצחים</div>
      <div className="winners-sub">המשחק של נועם · {totalMatches} משחקים · {totalGoals} שערים</div>

      {/* PODIUM */}
      {first && (
        <div className="podium">
          {/* Second */}
          <div className="podium-place silver">
            <div className="podium-medal silver">2</div>
            <TeamFlag className="podium-flag" colors={second.colors} />
            <div className="podium-name">{second.name}</div>
            <div className="podium-label">כסף</div>
          </div>
          {/* First */}
          <div className="podium-place gold">
            <div style={{ position: 'absolute', top: -8, fontSize: 36 }}>👑</div>
            <div className="podium-medal gold">1</div>
            <TeamFlag className="podium-flag" colors={first.colors} />
            <div className="podium-name">{first.name}</div>
            <div className="podium-label">אלוף הטורניר</div>
          </div>
          {/* Third */}
          {thirdT && (
            <div className="podium-place bronze">
              <div className="podium-medal bronze">3</div>
              <TeamFlag className="podium-flag" colors={thirdT.colors} />
              <div className="podium-name">{thirdT.name}</div>
              <div className="podium-label">ארד</div>
            </div>
          )}
        </div>
      )}

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">סך השערים</div>
          <div className="stat-value">{totalGoals} <span className="small">בכל הטורניר</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ממוצע לשערים למשחק</div>
          <div className="stat-value">{totalMatches ? (totalGoals / totalMatches).toFixed(1) : '0'} <span className="small">שערים</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">קבוצה הכי מבקיעה</div>
          <div className="stat-value" style={{ fontSize: 22, fontFamily: 'Rubik' }}>{topScorerTeam?.team.name || '—'} <span className="small">{topScorerTeam?.gf} שערים</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">כרטיסים</div>
          <div className="stat-value" style={{ display: 'flex', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Card type="yellow" size={20} /> {totalYellow}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Card type="red" size={20} /> {totalRed}
            </span>
          </div>
        </div>
      </div>

      {/* STANDINGS TABLE */}
      <div className="standings-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>קבוצה</th>
              <th className="center">משחקים</th>
              <th className="center">נצחונות</th>
              <th className="center">הפסדים</th>
              <th className="center">שערי זכות</th>
              <th className="center">שערי חובה</th>
              <th className="center">הפרש</th>
              <th className="center">כרטיסים</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((s, idx) => {
              const place = placeOf(s.team);
              const rankCls = place === 1 ? 'first' : place === 2 ? 'second' : place === 3 ? 'third' : '';
              return (
                <tr key={s.team.id}>
                  <td className={`rank ${rankCls}`}>{place || idx + 1}</td>
                  <td>
                    <div className="team-cell">
                      <TeamFlag className="mini-flag" colors={s.team.colors} />
                      <span style={{ fontWeight: 700 }}>{s.team.name}</span>
                    </div>
                  </td>
                  <td className="center num">{s.played}</td>
                  <td className="center num">{s.won}</td>
                  <td className="center num">{s.lost}</td>
                  <td className="center num">{s.gf}</td>
                  <td className="center num">{s.ga}</td>
                  <td className="center num" style={{ color: s.gd > 0 ? '#86efac' : s.gd < 0 ? '#fca5a5' : 'rgba(255,255,255,.7)' }}>
                    {s.gd > 0 ? '+' : ''}{s.gd}
                  </td>
                  <td className="center">
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <Icon.Card type="yellow" size={14} /> {s.yellow}
                      <Icon.Card type="red" size={14} /> {s.red}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="winners-actions">
        <button className="btn btn-secondary" onClick={onBack}>חזרה ללוח המשחקים</button>
        <button className="btn btn-primary" onClick={onRestart}>
          <Icon.Shuffle /> טורניר חדש
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { WinnersScreen });
