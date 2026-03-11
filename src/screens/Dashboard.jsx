import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { dbSet, logout } from '../firebase'
import { ROLES, getLevel, getLevelProgress } from '../data/roles'
import { GAGES, GAGE_TYPES } from '../data/gages'
import { showToast } from '../components/Toast'
import Avatar from '../components/Avatar'
import { getGameTs, tsToLabel } from '../utils/time'

const MEDALS = ['🥇','🥈','🥉']

// ── Mini top-3 component ────────────────────────────────
function Top3({ players, scoreKey, title, color }) {
  const sorted = [...players].sort((a,b) => (b[scoreKey]||0)-(a[scoreKey]||0)).slice(0,3)
  return (
    <div style={{ flex:1 }}>
      <div style={{ fontSize:11, fontWeight:900, color, marginBottom:6, letterSpacing:1 }}>{title}</div>
      {sorted.map((p,i) => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <span style={{ fontSize:12 }}>{MEDALS[i]}</span>
          <Avatar player={p} size={22} style={{ borderRadius:'50%', border:'1.5px solid rgba(255,255,255,.15)', flexShrink:0 }} />
          <span style={{ fontSize:11, fontWeight:700, flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{p.name}</span>
          <span style={{ fontSize:11, fontFamily:'Bangers,cursive', color }}>{p[scoreKey]||0}</span>
        </div>
      ))}
    </div>
  )
}

// ── Gage trigger selector modal ─────────────────────────
function GagePickerModal({ target, gages, onConfirm, onCancel }) {
  const [selectedIdx, setSelectedIdx] = useState(null)
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🎯 DÉMASQUER {target.name.toUpperCase()}</div>
        <div className="modal-subtitle">
          Quel gage as-tu déclenché ?
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18, maxHeight:'55vh', overflowY:'auto' }}>
          {gages.map((g, i) => {
            const typeCfg = g.type ? GAGE_TYPES[g.type] : null
            const selected = selectedIdx === i
            return (
              <div
                key={i}
                onClick={() => setSelectedIdx(i)}
                style={{
                  background: selected ? 'rgba(57,255,20,.08)' : 'rgba(255,255,255,.04)',
                  border: `2px solid ${selected ? 'var(--g)' : 'rgba(255,255,255,.1)'}`,
                  borderRadius:14, padding:'12px 14px', cursor:'pointer', transition:'all .15s',
                }}
              >
                {typeCfg && (
                  <span style={{
                    fontSize:9, fontWeight:900, letterSpacing:1, padding:'2px 7px', borderRadius:5,
                    background:`rgba(${g.type==='soft'?'57,255,20':g.type==='physique'?'0,245,255':'255,60,172'},.15)`,
                    color: typeCfg.color, display:'inline-block', marginBottom:6,
                  }}>
                    {typeCfg.emoji} {typeCfg.label.toUpperCase()}
                  </span>
                )}
                <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:4, lineHeight:1.4 }}>
                  ⚡ {g.trigger || g.t}
                </div>
                <div style={{ fontSize:12, fontWeight:700, lineHeight:1.4 }}>
                  👉 {g.a}
                </div>
                {selected && (
                  <div style={{ marginTop:6, fontSize:10, color:'var(--g)', fontWeight:900 }}>✓ SÉLECTIONNÉ</div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onCancel}>Annuler</button>
          <button
            className="btn btn-g"
            style={{ flex:2, opacity: selectedIdx === null ? .4 : 1 }}
            disabled={selectedIdx === null}
            onClick={() => onConfirm(selectedIdx)}
          >
            ✅ CONFIRMER !
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────
export default function Dashboard() {
  const { partyId, playerId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  const user = useAuth()

  if (import.meta?.env?.DEV) {
    window.__dp_dbg = window.__dp_dbg || { seen: new Set() }
  }

  const [pendingTarget, setPendingTarget] = useState(null) // player to unmask
  const [search, setSearch]               = useState('')
  const [searchOpen, setSearchOpen]       = useState(false)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editPhoto, setEditPhoto] = useState(null)
  const [editAvatarMode, setEditAvatarMode] = useState('bank')
  const [editSelectedAvatar, setEditSelectedAvatar] = useState(null)
  const [editNameSuggestion, setEditNameSuggestion] = useState('')

  const [showCustom, setShowCustom] = useState(false)
  const [cg1t, setCg1t] = useState(''); const [cg1a, setCg1a] = useState('')
  const [cg2t, setCg2t] = useState(''); const [cg2a, setCg2a] = useState('')

  // Persist session in localStorage so Home can offer "resume"
  useEffect(() => {
    if (partyId && playerId) {
      localStorage.setItem('dp_session', JSON.stringify({ partyId, playerId }))
    }
  }, [partyId, playerId])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try { await logout() } catch {}
    })()
  }, [user])

  useEffect(() => {
    if (!party) return
    if (party.ended) navigate(`/podium/${partyId}`)
  }, [party, partyId, navigate])

  const partyEnded = Boolean(party?.ended)
  const player = party?.players?.[playerId]

  useEffect(() => {
    if (!import.meta?.env?.DEV) return
    const key = `dash:${partyId}:${playerId}:${Boolean(party)}:${Boolean(player)}`
    if (window.__dp_dbg?.seen?.has(key)) return
    window.__dp_dbg?.seen?.add(key)
    console.log('[dp] Dashboard state', {
      path: window.location.pathname,
      partyLoaded: Boolean(party),
      playerFound: Boolean(player),
      partyId,
      playerId,
      playersCount: Object.keys(party?.players || {}).length,
    })
  }, [partyId, playerId, party, player])

  useEffect(() => {
    if (showCustom) return
    if (!player) return
    const cg = player.customGages || []
    setCg1t(cg[0]?.t || '')
    setCg1a(cg[0]?.a || '')
    setCg2t(cg[1]?.t || '')
    setCg2a(cg[1]?.a || '')
  }, [player?.customGages, showCustom, player])

  if (!party || partyEnded) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  if (!player) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center', gap:16 }}>
        <div style={{ fontSize:48 }}>🤔</div>
        <div style={{ fontSize:16, textAlign:'center', color:'rgba(255,255,255,.6)' }}>Joueur introuvable</div>
        <button className="btn btn-ghost btn-sm" style={{ width:'auto' }} onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    </div>
  )

  const role     = ROLES[player.roleIndex % ROLES.length]
  const level    = getLevel(player.score || 0)
  const { pct, nextLabel } = getLevelProgress(player.score || 0)
  const players  = Object.values(party.players || {})
  const others   = players.filter(p => p.id !== playerId)

  const missions = party.missions || 2
  const gageIndices = (player.gageIndices || []).slice(0, missions).concat(Array(missions).fill(null)).slice(0, missions)
  const customGages = player.customGages || []
  const gages = (() => {
    const res = []
    let ci = 0
    for (let i = 0; i < missions; i++) {
      const idx = gageIndices[i]
      if (typeof idx === 'number') {
        const g = GAGES[idx]
        if (g) res.push({ t: g.t, a: g.a, i: g.i, type: g.lvl })
      } else {
        const cg = customGages[ci]
        if (cg) res.push({ t: cg.t, a: cg.a, custom: true })
        ci++
      }
    }
    return res
  })()

  const now       = Date.now()
  const gameStart = getGameTs(party)
  const gameOpen  = gameStart !== null && now >= gameStart

  // filtered others for search
  const filteredOthers = search.trim()
    ? others.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : others

  const handleUnmask = (target) => setPendingTarget(target)

  const saveCustomGages = async () => {
    const custom = []
    if (cg1t.trim() && cg1a.trim()) custom.push({ t: cg1t.trim(), a: cg1a.trim(), custom: true })
    if (cg2t.trim() && cg2a.trim()) custom.push({ t: cg2t.trim(), a: cg2a.trim(), custom: true })

    let nextIndices = (player.gageIndices || []).slice(0, missions).concat(Array(missions).fill(null)).slice(0, missions)
    if (custom.length >= missions) {
      nextIndices = Array(missions).fill(null)
    } else if (custom.length === 1 && missions >= 2) {
      nextIndices[missions - 1] = null
    }

    const updatedPlayer = { ...player, customGages: custom, gageIndices: nextIndices }
    await dbSet(`/parties/${partyId}/players/${playerId}`, updatedPlayer)
    showToast('✅ Gages perso enregistrés !', 'var(--c)')
    setShowCustom(false)
  }

  const clearCustomGages = async () => {
    const updatedPlayer = { ...player, customGages: [] }
    await dbSet(`/parties/${partyId}/players/${playerId}`, updatedPlayer)
    showToast('✅ Gages perso retirés', 'var(--c)')
    setCg1t(''); setCg1a(''); setCg2t(''); setCg2a('')
    setShowCustom(false)
  }

  const confirmUnmask = async (gageIdx) => {
    if (!pendingTarget) return
    const updatedPlayer = {
      ...player,
      unmaskedIds: [...(player.unmaskedIds || []), pendingTarget.id],
      score: (player.score || 0) + 1,
    }
    const updatedTarget = {
      ...pendingTarget,
      caughtCount: (pendingTarget.caughtCount || 0) + 1,
    }
    const prevLevel = getLevel(player.score || 0)
    const newLevel  = getLevel(updatedPlayer.score)
    await dbSet(`/parties/${partyId}/players/${playerId}`, updatedPlayer)
    await dbSet(`/parties/${partyId}/players/${pendingTarget.id}`, updatedTarget)
    if (newLevel.lbl !== prevLevel.lbl) {
      showToast(`🎉 NIVEAU UP ! ${newLevel.e} ${newLevel.lbl} !`, 'var(--y)')
    } else {
      showToast(`🎯 ${pendingTarget.name} démasqué(e) ! +1 point !`)
    }
    setPendingTarget(null)
    setSearch('')
  }

  const handlePlayerLogout = () => {
    localStorage.removeItem('dp_session')
    showToast('👋 Session quittée', 'var(--c)')
    navigate('/')
  }

  const AVATARS = Array.from({ length: 18 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0')
    return `/avatars/${n}.png`
  })

  const compressPhoto = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const out = 200
        const s = Math.min(img.width, img.height)
        canvas.width = out; canvas.height = out
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, out, out)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })

  const computeNameSuggestion = (baseName, players) => {
    const base = (baseName || '').trim()
    if (!base) return ''
    const existingLower = new Set(
      Object.values(players || {})
        .map(p => (p?.name || '').trim().toLowerCase())
        .filter(Boolean)
    )
    if (!existingLower.has(base.toLowerCase())) return ''
    let i = 2
    while (existingLower.has(`${base} ${i}`.toLowerCase())) i++
    return `${base} ${i}`
  }

  const openEditProfile = () => {
    setEditName(player?.name || '')
    setEditYear(player?.year || '')
    setEditPhoto(player?.photo || null)
    setEditSelectedAvatar((player?.photo || '').startsWith('/avatars/') ? player.photo : null)
    setEditAvatarMode((player?.photo || '').startsWith('/avatars/') ? 'bank' : 'upload')
    setEditNameSuggestion('')
    setShowEditProfile(true)
  }

  const handleEditPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressPhoto(file)
    setEditPhoto(compressed)
    setEditSelectedAvatar(null)
  }

  const selectEditAvatar = (src) => {
    setEditSelectedAvatar(src)
    setEditPhoto(src)
  }

  const saveProfile = async () => {
    const trimmedName = editName.trim()
    if (!trimmedName) { showToast('⚠️ Entre ton prénom !', '#FF6B00'); return }
    if (!editYear || String(editYear).length !== 4) { showToast('⚠️ Entre ton année de naissance !', '#FF6B00'); return }
    if (!editPhoto) { showToast('⚠️ Choisis un avatar ou ajoute une photo', '#FF6B00'); return }
    const allPlayers = party?.players || {}
    const existingLower = new Set(
      Object.values(allPlayers)
        .filter(p => p?.id !== playerId)
        .map(p => (p?.name || '').trim().toLowerCase())
        .filter(Boolean)
    )
    if (existingLower.has(trimmedName.toLowerCase())) {
      const suggestion = computeNameSuggestion(trimmedName, allPlayers)
      setEditNameSuggestion(suggestion)
      showToast('⚠️ Prénom déjà pris : choisis-en un autre ou accepte la suggestion', '#FF6B00')
      return
    }
    const updatedPlayer = { ...player, name: trimmedName, year: String(editYear), photo: editPhoto }
    await dbSet(`/parties/${partyId}/players/${playerId}`, updatedPlayer)
    showToast('✅ Profil mis à jour !', 'var(--c)')
    setShowEditProfile(false)
  }

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HEADER ── */}
        <div style={{ padding:'18px 20px 12px', display:'flex', alignItems:'center', gap:12 }}>
          <button
            className="back-btn"
            style={{ flexShrink:0 }}
            onClick={() => navigate('/')}
          >←</button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Bangers,cursive', fontSize:20, letterSpacing:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
              {player.name}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
              {party.name}
            </div>
          </div>
          <button
            onClick={openEditProfile}
            style={{
              background:'rgba(0,245,255,.08)', border:'1px solid rgba(0,245,255,.18)',
              color:'var(--c)', borderRadius:12, padding:'8px 10px',
              fontSize:12, fontWeight:900, cursor:'pointer', flexShrink:0,
            }}
          >
            ✎
          </button>
          {/* Leaderboard button */}
          <button
            onClick={() => navigate(`/leaderboard/${partyId}`)}
            style={{
              background:'rgba(255,230,0,.1)', border:'1.5px solid rgba(255,230,0,.25)',
              color:'var(--y)', borderRadius:12, padding:'8px 12px',
              fontSize:13, fontWeight:900, cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', gap:5,
            }}
          >
            🏆 <span style={{ fontSize:11 }}>Top</span>
          </button>

          <button
            onClick={handlePlayerLogout}
            style={{
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)',
              color:'rgba(255,255,255,.55)', borderRadius:12, padding:'8px 10px',
              fontSize:12, fontWeight:900, cursor:'pointer', flexShrink:0,
            }}
          >
            Quitter
          </button>
        </div>

        {/* ── DETECTIVE CARD ── */}
        <div style={{ margin:'0 20px 16px' }}>
          <div className="det-card">
            <div className="avatar-float" style={{ marginBottom:6, display:'inline-block' }}>
              <Avatar player={player} size={86} style={{ border:'4px solid var(--p)', borderRadius:'50%' }} />
            </div>
            <div style={{ fontFamily:'Bangers,cursive', fontSize:28, color:'var(--c)', letterSpacing:2, marginBottom:2 }}>
              {role.n.toUpperCase()}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginBottom:10 }}>{role.r}</div>
            {/* Level bar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:900, color:'var(--y)', letterSpacing:1, whiteSpace:'nowrap' }}>
                {level.e} {level.lbl}
              </span>
              <div className="level-bar-wrap">
                <div className="level-bar-fill" style={{ width:`${pct}%` }}/>
              </div>
              <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', whiteSpace:'nowrap' }}>{nextLabel}</span>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              <div style={{ background:'rgba(0,0,0,.35)', borderRadius:10, padding:'5px 12px', fontSize:12, fontWeight:700 }}>
                🏅 {player.score||0} démasqués
              </div>
              <div style={{ background:'rgba(0,0,0,.35)', borderRadius:10, padding:'5px 12px', fontSize:12, fontWeight:700 }}>
                💀 {player.caughtCount||0} fois pris
              </div>
            </div>
          </div>
        </div>

        {/* ── TOP 3 MINI ── */}
        <div style={{ margin:'0 20px 16px' }}>
          <div style={{ background:'var(--cd)', borderRadius:16, padding:'14px 16px' }}>
            <div style={{ display:'flex', gap:16 }}>
              <Top3 players={players} scoreKey="score"      title="🔍 DÉTECTIVES" color="var(--c)" />
              <div style={{ width:1, background:'rgba(255,255,255,.07)' }}/>
              <Top3 players={players} scoreKey="caughtCount" title="💀 COUPABLES"  color="var(--p)" />
            </div>
            <button
              onClick={() => navigate(`/leaderboard/${partyId}`)}
              style={{
                width:'100%', marginTop:12, background:'rgba(255,230,0,.07)',
                border:'1px solid rgba(255,230,0,.18)', color:'var(--y)',
                borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:900,
                cursor:'pointer', letterSpacing:1,
              }}
            >
              🏆 VOIR LE CLASSEMENT COMPLET
            </button>
          </div>
        </div>

        {/* ── GAGES ── */}
        <div style={{ margin:'0 20px 16px' }}>
          <div className="section-title">🎭 TES GAGES SECRETS</div>
          {gages.map((g, i) => {
            const typeCfg = g.type ? GAGE_TYPES[g.type] : null
            const k = `${i}-${g.custom ? 'c' : 'a'}-${g.t || ''}-${g.a || ''}`
            return (
              <div key={k} className="gage-card">
                {typeCfg && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{
                      fontSize:10, fontWeight:900, letterSpacing:1, padding:'3px 8px', borderRadius:6,
                      background:`rgba(${g.type==='soft'?'57,255,20':g.type==='physique'?'0,245,255':'255,60,172'},.15)`,
                      color: typeCfg.color,
                    }}>
                      {typeCfg.emoji} {typeCfg.label.toUpperCase()}
                    </span>
                    {g.custom && <span className="gage-custom-badge">PERSO</span>}
                  </div>
                )}
                <div className="gage-trigger">⚡ QUAND : {g.trigger || g.t}</div>
                <div className="gage-action">👉 {g.a}</div>
                {g.i && <div className="gage-tip">💡 {g.i}</div>}
              </div>
            )
          })}

          {party.allowCustomGages && (
            <>
              <div className="custom-toggle" onClick={() => setShowCustom(v => !v)}>
                <span>✏️ Je veux remplacer mes gages</span>
                <span style={{ fontSize: 18, transition: 'transform .2s', transform: showCustom ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>

              {showCustom && (
                <div className="custom-box">
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>
                    Propose 1 ou 2 gages perso. Ils remplaceront tes gages automatiques.
                  </p>
                  <label className="form-label">Gage 1 — Déclencheur</label>
                  <textarea value={cg1t} onChange={e => setCg1t(e.target.value)} placeholder="Ex : Quelqu'un dit « incroyable »…" />
                  <div className="form-hint" style={{ marginBottom: 10 }}>🎯 Quelle situation déclenche le gage ?</div>
                  <label className="form-label">Gage 1 — Ce que la victime doit faire</label>
                  <textarea value={cg1a} onChange={e => setCg1a(e.target.value)} placeholder="Ex : Appeler sa maman et lui chanter Joyeux Anniversaire…" />
                  <div className="sep" />
                  <label className="form-label">Gage 2 — Déclencheur (optionnel)</label>
                  <textarea value={cg2t} onChange={e => setCg2t(e.target.value)} placeholder="Ex : Quelqu'un vérifie son horoscope…" />
                  <div className="form-hint" style={{ marginBottom: 10 }}>🎯 Quelle situation ?</div>
                  <label className="form-label">Gage 2 — Ce que la victime doit faire</label>
                  <textarea value={cg2a} onChange={e => setCg2a(e.target.value)} placeholder="Ex : Prédire l'avenir amoureux en inventant tout…" />

                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    <button className="btn btn-g" style={{ flex:2, color:'var(--dk)' }} onClick={saveCustomGages}>
                      ✅ ENREGISTRER
                    </button>
                    <button className="btn btn-ghost" style={{ flex:1 }} onClick={clearCustomGages}>
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── DÉMASQUER ── */}
        <div style={{ margin:'0 20px 16px' }}>
          {/* Section header with search toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div className="section-title" style={{ marginBottom:0 }}>👁️ DÉMASQUER</div>
            {gameOpen && others.length > 0 && (
              <button
                onClick={() => { setSearchOpen(v => !v); setSearch('') }}
                style={{
                  background: searchOpen ? 'rgba(0,245,255,.12)' : 'rgba(255,255,255,.06)',
                  border:`1px solid ${searchOpen ? 'var(--c)' : 'rgba(255,255,255,.1)'}`,
                  color: searchOpen ? 'var(--c)' : 'rgba(255,255,255,.5)',
                  borderRadius:10, padding:'6px 12px', fontSize:13, cursor:'pointer', fontWeight:800,
                }}
              >
                🔍
              </button>
            )}
          </div>

          {/* Search bar */}
          {searchOpen && (
            <input
              className="form-input"
              style={{ marginBottom:10 }}
              placeholder="Rechercher un invité…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          )}

          {!gameOpen ? (
            <div style={{
              background:'rgba(139,92,246,.08)', border:'1px solid rgba(139,92,246,.25)',
              borderRadius:16, padding:20, textAlign:'center',
            }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔒</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--pu)', marginBottom:6 }}>Le jeu n'a pas encore commencé !</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>
                Mémorise tes gages.<br/>
                Démasquages dès le <strong>{tsToLabel(gameStart)}</strong>
              </div>
            </div>
          ) : filteredOthers.length === 0 ? (
            <div style={{ textAlign:'center', color:'rgba(255,255,255,.3)', fontSize:12, padding:'18px 0' }}>
              {search ? 'Aucun agent trouvé.' : 'Les autres agents apparaîtront ici !'}
            </div>
          ) : (
            <>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.38)', marginBottom:10 }}>
                Tu l'as pris en flagrant délit ? Clique sur son prénom !
              </p>
              <div className="players-grid">
                {filteredOthers.map(p => {
                  const cnt = (player.unmaskedIds||[]).filter(id => id === p.id).length
                  return (
                    <div
                      key={p.id}
                      className={`player-tile ${cnt > 0 ? 'unmasked' : ''}`}
                      onClick={() => handleUnmask(p)}
                    >
                      {cnt > 0 && <div className="tile-badge">{cnt}</div>}
                      <Avatar player={p} size={44} style={{ margin:'0 auto 5px', display:'block', border:'2px solid rgba(255,255,255,.12)', borderRadius:'50%' }} />
                      <div className="tile-name">{p.name}</div>
                      {cnt > 0 && <div className="tile-count">🎯 {cnt}×</div>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ height:24 }}/>
      </div>

      {/* ── Gage picker modal ── */}
      {pendingTarget && (
        <GagePickerModal
          target={pendingTarget}
          gages={gages}
          onConfirm={confirmUnmask}
          onCancel={() => setPendingTarget(null)}
        />
      )}

      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ ÉDITER MON PROFIL</div>

            <label className="form-label">Ton prénom</label>
            <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ex : Sofia" autoComplete="off" />
            {editNameSuggestion && (
              <div style={{ marginTop: 10, background: 'rgba(255,230,0,.06)', border: '1px solid rgba(255,230,0,.25)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,230,0,.9)', letterSpacing: 1, marginBottom: 6 }}>
                  Prénom déjà pris
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.4, marginBottom: 10 }}>
                  Suggestion disponible : <strong>{editNameSuggestion}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-y"
                  style={{ width: '100%', padding: '12px 0', fontSize: 13, color: 'var(--dk)' }}
                  onClick={() => { setEditName(editNameSuggestion); setEditNameSuggestion('') }}
                >
                  Utiliser "{editNameSuggestion}"
                </button>
              </div>
            )}

            <div style={{ height: 12 }} />

            <label className="form-label">
              Année de naissance
              <span style={{ color: 'rgba(255,255,255,.28)', fontSize: 10, marginLeft: 6 }}>(code de reconnexion)</span>
            </label>
            <input className="form-input" type="number" value={editYear} onChange={e => setEditYear(e.target.value)} placeholder="Ex : 1995" min="1940" max="2010" />

            <div style={{ height: 12 }} />

            <label className="form-label">Avatar d'agent 🕵️</label>
            <div className="avatar-mode">
              <button
                type="button"
                className={`avatar-mode-btn ${editAvatarMode === 'bank' ? 'active' : ''}`}
                onClick={() => setEditAvatarMode('bank')}
              >🎭 Choisir</button>
              <button
                type="button"
                className={`avatar-mode-btn ${editAvatarMode === 'upload' ? 'active' : ''}`}
                onClick={() => setEditAvatarMode('upload')}
              >📸 Uploader</button>
            </div>

            {editAvatarMode === 'bank' ? (
              <div className="avatar-bank-scroll">
                {AVATARS.map((src, i) => {
                  const taken = Object.values(party?.players || {}).some(p => p?.id !== playerId && p?.photo === src)
                  const selected = editSelectedAvatar === src
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`avatar-tile ${selected ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                      onClick={() => !taken && selectEditAvatar(src)}
                      disabled={taken}
                      aria-label={`Avatar ${i + 1}`}
                    >
                      <img src={src} alt="" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <>
                <label htmlFor="profilePhotoInput">
                  <div className={`photo-area ${editPhoto ? 'has-photo' : ''}`}>
                    {editPhoto ? (
                      <div className="photo-preview-wrap">
                        <img src={editPhoto} alt="preview" className="photo-preview" />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 44 }}>🤳</div>
                        <p>Clique pour prendre ou choisir une photo</p>
                      </>
                    )}
                  </div>
                </label>
                <input id="profilePhotoInput" type="file" accept="image/*" capture="user" onChange={handleEditPhoto} style={{ display: 'none' }} />
              </>
            )}

            <div style={{ display:'flex', gap:10, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowEditProfile(false)}>Annuler</button>
              <button className="btn btn-g" style={{ flex: 2, color:'var(--dk)' }} onClick={saveProfile}>✅ Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
