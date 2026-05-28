// Setup screen — enter teams, colors, and game length

const { useState, useRef, useEffect } = React;

function SetupScreen({ onStart }) {
  const [teamCount, setTeamCount] = useState(8);
  const [minutes, setMinutes] = useState(10);
  const [teams, setTeams] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: uid(),
      name: '',
      colors: [KIT_COLORS[i % KIT_COLORS.length].hex],
    }))
  );
  const [editingColor, setEditingColor] = useState(null); // teamIdx

  // Adjust team list when count changes
  const setCount = (n) => {
    setTeamCount(n);
    setTeams((prev) => {
      if (n === prev.length) return prev;
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, (_, i) => ({
            id: uid(),
            name: '',
            colors: [KIT_COLORS[(prev.length + i) % KIT_COLORS.length].hex],
          })),
        ];
      }
      return prev.slice(0, n);
    });
  };

  const updateTeam = (i, patch) => {
    setTeams((ts) => ts.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  };

  const allNamed = teams.every(t => t.name.trim().length > 0);

  const handleStart = () => {
    sounds.click();
    // Assign suggested names where blank
    const usedNames = new Set(teams.map(t => t.name.trim()).filter(Boolean));
    const fillNames = teams.map((t, i) => {
      if (t.name.trim()) return t;
      let sug = TEAM_SUGGESTIONS[i % TEAM_SUGGESTIONS.length];
      let k = 0;
      while (usedNames.has(sug)) { k++; sug = TEAM_SUGGESTIONS[(i + k) % TEAM_SUGGESTIONS.length]; }
      usedNames.add(sug);
      return { ...t, name: sug };
    });
    onStart({ teams: fillNames, minutes });
  };

  const autofillNames = () => {
    const shuffled = shuffle(TEAM_SUGGESTIONS);
    setTeams((ts) => ts.map((t, i) => ({ ...t, name: shuffled[i % shuffled.length] })));
    sounds.click();
  };

  return (
    <div>
      <div className="setup-hero">
        <h1>המשחק של נועם</h1>
        <p>הכניסו את שמות הקבוצות, בחרו צבעים, ותנו לכדור להתגלגל. הסדר יוגרל אוטומטית ⚽️</p>
      </div>

      <div className="setup-controls">
        <div className="field">
          <div className="field-label">מספר קבוצות</div>
          <div className="field-row">
            <div className="seg">
              {[8, 16].map(n => (
                <button key={n} className={n === teamCount ? 'active' : ''} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>חייב להיות 8 או 16</span>
          </div>
        </div>
        <div className="field">
          <div className="field-label">אורך משחק (דקות)</div>
          <div className="field-row">
            <div className="stepper">
              <button onClick={() => setMinutes(m => Math.max(1, m - 1))}><Icon.Minus /></button>
              <div className="stepper-value">{minutes}</div>
              <button onClick={() => setMinutes(m => Math.min(45, m + 1))}><Icon.Plus /></button>
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>בין דקה ל-45 דקות</span>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">הקבוצות</h2>
        <button className="btn btn-ghost btn-sm" onClick={autofillNames}>
          <Icon.Shuffle /> הצעות אקראיות
        </button>
      </div>

      <div className="teams-grid">
        {teams.map((team, i) => (
          <div className="team-card" key={team.id}>
            <div className="team-card-stripe">
              {team.colors.map((c, j) => <div key={j} style={{ background: c }} />)}
            </div>
            <div className="team-num">קבוצה {i + 1}</div>
            <input
              className="team-name-input"
              placeholder={`למשל: ${TEAM_SUGGESTIONS[i % TEAM_SUGGESTIONS.length]}`}
              value={team.name}
              onChange={(e) => updateTeam(i, { name: e.target.value })}
              maxLength={24}
            />
            <div className="color-swatches">
              <span className="color-label">צבעים:</span>
              <div
                className="swatch-current"
                onClick={() => setEditingColor(editingColor === i ? null : i)}
                style={{ position: 'relative' }}
              >
                {team.colors.map((c, j) => <div key={j} style={{ background: c }} />)}
                {editingColor === i && (
                  <ColorPopover
                    colors={team.colors}
                    onChange={(colors) => updateTeam(i, { colors })}
                    onClose={() => setEditingColor(null)}
                  />
                )}
              </div>
              <button
                className="btn-ghost btn-sm"
                style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => setEditingColor(editingColor === i ? null : i)}
              >
                {editingColor === i ? 'סגור' : 'ערוך'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="setup-footer">
        <div className="setup-summary">
          {teamCount} קבוצות · {minutes} דקות למשחק · {teamCount === 8 ? '7' : '15'} משחקים בסך הכל
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          <Icon.Shuffle /> הגרל ותתחיל
        </button>
      </div>
    </div>
  );
}

function ColorPopover({ colors, onChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  const setNth = (idx, hex) => {
    const next = [...colors];
    next[idx] = hex;
    onChange(next);
  };
  const addColor = () => {
    if (colors.length >= 2) return;
    const used = new Set(colors);
    const next = KIT_COLORS.find(c => !used.has(c.hex)) || KIT_COLORS[0];
    onChange([...colors, next.hex]);
  };
  const removeColor = (idx) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== idx));
  };

  return (
    <div className="color-pop" ref={ref} onClick={(e) => e.stopPropagation()}>
      {colors.map((c, idx) => (
        <div key={idx} style={{ marginBottom: 10 }}>
          <div className="color-pop-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>צבע {idx + 1}</span>
            {colors.length > 1 && (
              <button className="btn-ghost" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => removeColor(idx)}>הסר</button>
            )}
          </div>
          <div className="color-pop-row">
            {KIT_COLORS.map((kc) => (
              <button
                key={kc.hex}
                className={`dot ${c === kc.hex ? 'active' : ''}`}
                style={{ background: kc.hex }}
                title={kc.name}
                onClick={() => setNth(idx, kc.hex)}
              />
            ))}
          </div>
        </div>
      ))}
      {colors.length < 2 && (
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={addColor}>
          <Icon.Plus /> הוסף צבע שני
        </button>
      )}
    </div>
  );
}

Object.assign(window, { SetupScreen });
