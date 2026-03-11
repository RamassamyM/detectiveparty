import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { dbSet, dbRemove } from '../firebase'
import { showToast } from '../components/Toast'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import { ROLES } from '../data/roles'
import { GAGES, GAGE_TYPES } from '../data/gages'
import { getGameTs, getRegTs, tsToLabel, localToTs } from '../utils/time'

const MEDALS = ['🥇','🥈','🥉']
const TYPE_ORDER = ['soft', 'med', 'hard', 'sexy']

function tsToLocalInputs(ts) {
  if (!ts) return { date: '', time: '' }
  const d = new Date(ts)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` }
}

export default function AdminDash() {
  const { partyId } = useParams()
  const navigate    = useNavigate()
  const party       = useParty(partyId)
  const user        = useAuth()

  const [tab, setTab]                   = useState('overview')
  const [rankTab, setRankTab]           = useState('top')
  const [playerQuery, setPlayerQuery]   = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDeleteParty, setConfirmDeleteParty] = useState(false)
  const [editField, setEditField]       = useState(null)
  const [editValue, setEditValue]       = useState('')
  const [expandedGages, setExpandedGages] = useState(() => new Set())
  // End-game scheduling
  const [endDate, setEndDate]           = useState('')
  const [endTime, setEndTime]           = useState('')

  const [regStartDate, setRegStartDate] = useState('')
  const [regStartTime, setRegStartTime] = useState('')
  const [regEndDate, setRegEndDate]     = useState('')
  const [regEndTime, setRegEndTime]     = useState('')
  const [gameStartDate, setGameStartDate] = useState('')
  const [gameStartTime, setGameStartTime] = useState('')

  useEffect(() => {
    if (!party) return
    setRegStartDate(party.regDate || '')
    setRegStartTime(party.regTime || '')
    setRegEndDate(party.regEndDate || '')
    setRegEndTime(party.regEndTime || '')
    setGameStartDate(party.gameDate || '')
    setGameStartTime(party.gameTime || '')

    if (party.endTs) {
      const { date, time } = tsToLocalInputs(party.endTs)
      setEndDate(date)
      setEndTime(time)
    }
  }, [party])

  if (user === undefined) return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  if (!user) {
    navigate('/admin/login')
    return null
  }

  if (!party) return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  const players   = Object.values(party.players || {})
  const filteredPlayers = playerQuery.trim()
    ? players.filter((p) => {
      const q = playerQuery.trim().toLowerCase()
      const role = ROLES[p.roleIndex % ROLES.length]
      const hay = `${p.name || ''} ${role?.n || ''} ${role?.e || ''}`.toLowerCase()
      return hay.includes(q)
    })
    : players
  const detSorted = [...players].sort((a,b) => (b.score||0)-(a.score||0))
  const culSorted = [...players].sort((a,b) => (b.caughtCount||0)-(a.caughtCount||0))
  const now       = Date.now()
  const gameStart = getGameTs(party)
  const isLive    = !party.ended && gameStart !== null && now >= gameStart

  const handleCopyLink = () => {
    const url = `${window.location.origin}/party/${partyId}`
    navigator.clipboard.writeText(`${url}\nCode : ${party.code}`)
      .then(() => showToast('📋 Lien copié !', 'var(--c)'))
      .catch(() => showToast(`${url}  |  Code : ${party.code}`, 'var(--c)'))
  }

  // Fin immédiate
  const handleEndNow = async () => {
    if (!confirm('Terminer la partie maintenant et afficher le podium ?')) return
    await dbSet(`/parties/${partyId}/ended`, true)
    await dbSet(`/parties/${partyId}/endedAt`, Date.now())
    showToast('🏆 Partie terminée !', 'var(--y)')
    navigate(`/podium/${partyId}`)
  }

  // Fin programmée
  const handleScheduleEnd = async () => {
    if (!endDate || !endTime) { showToast('⚠️ Indique une date et une heure', '#FF6B00'); return }
    const ts = localToTs(endDate, endTime)
    await dbSet(`/parties/${partyId}/endTs`, ts)
    showToast(`⏰ Fin programmée le ${tsToLabel(ts)}`, 'var(--y)')
  }

  // Supprimer toute la soirée
  const handleDeleteParty = async () => {
    await dbRemove(`/parties/${partyId}`)
    showToast('🗑️ Soirée supprimée', '#FF6B00')
    navigate('/admin/parties')
  }

  const handleDeletePlayer = async () => {
    if (!confirmDelete) return
    await dbRemove(`/parties/${partyId}/players/${confirmDelete.id}`)
    showToast(`🗑️ ${confirmDelete.name} supprimé(e)`, '#FF6B00')
    setConfirmDelete(null)
  }

  const startEdit = (field, val) => { setEditField(field); setEditValue(val || '') }

  const toggleType = async (type) => {
    const current = new Set(party.enabledTypes || ['soft'])
    if (current.has(type) && current.size === 1) return
    const wasOn = current.has(type)
    wasOn ? current.delete(type) : current.add(type)

    const nextEnabledSet = new Set((party.enabledGages || []).filter(idx => {
      const g = GAGES[idx]
      return g && current.has(g.lvl)
    }))

    if (wasOn) {
      GAGES.forEach((g, i) => { if (g.lvl === type) nextEnabledSet.delete(i) })
    } else {
      GAGES.forEach((g, i) => { if (g.lvl === type) nextEnabledSet.add(i) })
    }

    await dbSet(`/parties/${partyId}/enabledTypes`, Array.from(current))
    await dbSet(`/parties/${partyId}/enabledGages`, Array.from(nextEnabledSet))
    showToast('✅ Modifié !', 'var(--c)')
  }

  const toggleGage = async (idx) => {
    const current = new Set(party.enabledGages || [])
    current.has(idx) ? current.delete(idx) : current.add(idx)
    await dbSet(`/parties/${partyId}/enabledGages`, Array.from(current))
    showToast('✅ Modifié !', 'var(--c)')
  }

  const toggleExpandedGage = (idx) => {
    setExpandedGages(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const updateMissions = async (val) => {
    await dbSet(`/parties/${partyId}/missions`, val)
    showToast('✅ Modifié !', 'var(--c)')
  }

  const toggleAllowCustomGages = async () => {
    await dbSet(`/parties/${partyId}/allowCustomGages`, !party.allowCustomGages)
    showToast('✅ Modifié !', 'var(--c)')
  }

  const saveRegStart = async () => {
    if (!regStartDate || !regStartTime) { showToast('⚠️ Indique une date et une heure', '#FF6B00'); return }
    await dbSet(`/parties/${partyId}/regDate`, regStartDate)
    await dbSet(`/parties/${partyId}/regTime`, regStartTime)
    await dbSet(`/parties/${partyId}/regTs`, localToTs(regStartDate, regStartTime))
    showToast('✅ Modifié !', 'var(--c)')
  }

  const saveRegEnd = async () => {
    if (!regEndDate || !regEndTime) { showToast('⚠️ Indique une date et une heure', '#FF6B00'); return }
    await dbSet(`/parties/${partyId}/regEndDate`, regEndDate)
    await dbSet(`/parties/${partyId}/regEndTime`, regEndTime)
    await dbSet(`/parties/${partyId}/regEndTs`, localToTs(regEndDate, regEndTime))
    showToast('✅ Modifié !', 'var(--c)')
  }

  const clearRegEnd = async () => {
    await dbSet(`/parties/${partyId}/regEndDate`, '')
    await dbSet(`/parties/${partyId}/regEndTime`, '')
    await dbSet(`/parties/${partyId}/regEndTs`, null)
    setRegEndDate('')
    setRegEndTime('')
    showToast('✅ Modifié !', 'var(--c)')
  }

  const saveGameStart = async () => {
    if (!gameStartDate || !gameStartTime) { showToast('⚠️ Indique une date et une heure', '#FF6B00'); return }
    await dbSet(`/parties/${partyId}/gameDate`, gameStartDate)
    await dbSet(`/parties/${partyId}/gameTime`, gameStartTime)
    await dbSet(`/parties/${partyId}/gameTs`, localToTs(gameStartDate, gameStartTime))
    showToast('✅ Modifié !', 'var(--c)')
  }

  const saveEdit = async () => {
    if (!editField) return
    // If editing date/time fields, also update the corresponding timestamp
    const val = editValue
    await dbSet(`/parties/${partyId}/${editField}`, val)
    // Recompute timestamps after string edit
    const updated = { ...party, [editField]: val }
    if (['regDate','regTime'].some(k => k === editField)) {
      await dbSet(`/parties/${partyId}/regTs`, localToTs(updated.regDate, updated.regTime))
    }
    if (['gameDate','gameTime'].some(k => k === editField)) {
      await dbSet(`/parties/${partyId}/gameTs`, localToTs(updated.gameDate, updated.gameTime))
    }
    showToast('✅ Modifié !', 'var(--c)')
    setEditField(null)
  }

  const TAB = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      flex:1, padding:'10px 0', border:'none', borderRadius:12,
      fontFamily:'Bangers, cursive', fontSize:16, letterSpacing:1, cursor:'pointer',
      background: tab===id ? 'var(--p)' : 'rgba(255,255,255,.07)',
      color: tab===id ? '#fff' : 'rgba(255,255,255,.5)',
      transition:'all .2s',
    }}>{label}</button>
  )

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid"/>
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/admin/parties')}>←</button>
          <div className="screen-title">⚙️ {party.name}</div>
        </div>

        {/* Status banner if ended */}
        {party.ended && (
          <div style={{
            background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.2)',
            borderRadius:14, padding:'10px 16px', marginBottom:12,
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{ fontSize:13, fontWeight:800, color:'var(--g)' }}>✅ Soirée archivée</span>
            <button
              onClick={() => navigate(`/podium/${partyId}`)}
              style={{ background:'none', border:'none', color:'var(--c)', fontSize:12, fontWeight:800, cursor:'pointer' }}
            >
              Voir le podium →
            </button>
          </div>
        )}

        {/* Code block */}
        <div className="code-display" style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>Code de la soirée</div>
          <div className="code-value">{party.code}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:6, wordBreak:'break-all' }}>
            {window.location.origin}/party/{partyId}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:10, lineHeight:1.5 }}>
            Donne <strong>le lien</strong> et <strong>le code</strong> à tes invités.
            <br/>
            Ils en auront besoin pour rejoindre la soirée et s'inscrire.
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:10 }} onClick={handleCopyLink}>
            📋 Copier le lien + code
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          <TAB id="overview" label="📊 Tableau" />
          <TAB id="players"  label="👥 Agents"  />
          <TAB id="settings" label="⚙️ Réglages" />
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontFamily:'Bangers, cursive', fontSize:16, color:'var(--c)', marginBottom:10, letterSpacing:1 }}>📅 CALENDRIER</div>
              <div style={{ fontSize:13, marginBottom:6 }}>
                <span style={{ color:'rgba(255,255,255,.45)' }}>📋 Inscriptions : </span>
                <strong>{tsToLabel(getRegTs(party))}</strong>
              </div>
              <div style={{ fontSize:13, marginBottom:6 }}>
                <span style={{ color:'rgba(255,255,255,.45)' }}>🎮 Début du jeu : </span>
                <strong>{tsToLabel(getGameTs(party))}</strong>
              </div>
              {party.endTs && !party.ended && (
                <div style={{ fontSize:13 }}>
                  <span style={{ color:'rgba(255,255,255,.45)' }}>⏰ Fin programmée : </span>
                  <strong style={{ color:'var(--y)' }}>{tsToLabel(party.endTs)}</strong>
                </div>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Bangers, cursive', fontSize:36, color:'var(--c)' }}>{players.length}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>Agents inscrits</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Bangers, cursive', fontSize:36, color:'var(--y)' }}>
                  {players.reduce((s,p) => s+(p.score||0), 0)}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>Démasquages</div>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <button onClick={() => setRankTab('top')} style={{
                flex:1, padding:'10px 0', border:'none', borderRadius:12,
                fontFamily:'Bangers, cursive', fontSize:16, letterSpacing:1, cursor:'pointer',
                background: rankTab==='top' ? 'var(--y)' : 'rgba(255,255,255,.07)',
                color: rankTab==='top' ? 'var(--dk)' : 'rgba(255,255,255,.5)',
                transition:'all .2s',
              }}>🔍 TOP</button>
              <button onClick={() => setRankTab('flop')} style={{
                flex:1, padding:'10px 0', border:'none', borderRadius:12,
                fontFamily:'Bangers, cursive', fontSize:16, letterSpacing:1, cursor:'pointer',
                background: rankTab==='flop' ? 'var(--p)' : 'rgba(255,255,255,.07)',
                color: rankTab==='flop' ? '#fff' : 'rgba(255,255,255,.5)',
                transition:'all .2s',
              }}>💀 FLOP</button>
            </div>

            {rankTab === 'top' ? (
              <div className="card" style={{ marginBottom:14 }}>
                <div style={{ fontFamily:'Bangers, cursive', fontSize:18, color:'var(--y)', marginBottom:10, letterSpacing:1 }}>🔍 TOP DÉTECTIVES</div>
                {detSorted.length === 0
                  ? <div style={{ color:'rgba(255,255,255,.3)', fontSize:13 }}>Aucun point encore.</div>
                  : detSorted.map((p,i) => (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:24, textAlign:'center' }}>{MEDALS[i]||i+1}</div>
                      <div style={{ flex:1, fontWeight:800 }}>
                        {(ROLES[p.roleIndex % ROLES.length] || ROLES[0]).n} <span style={{ color:'rgba(255,255,255,.4)', fontWeight:900, fontSize:12 }}>({p.name})</span>
                      </div>
                      <div style={{ fontFamily:'Bangers, cursive', fontSize:20, color:'var(--y)' }}>{p.score||0} pts</div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="card" style={{ marginBottom:14 }}>
                <div style={{ fontFamily:'Bangers, cursive', fontSize:18, color:'var(--p)', marginBottom:10, letterSpacing:1 }}>💀 FLOP COUPABLES</div>
                {culSorted.map((p,i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:24, textAlign:'center' }}>{MEDALS[i]||i+1}</div>
                    <div style={{ flex:1, fontWeight:800 }}>
                      {(ROLES[p.roleIndex % ROLES.length] || ROLES[0]).n} <span style={{ color:'rgba(255,255,255,.4)', fontWeight:900, fontSize:12 }}>({p.name})</span>
                    </div>
                    <div style={{ fontFamily:'Bangers, cursive', fontSize:20, color:'var(--p)' }}>{p.caughtCount||0} ×</div>
                  </div>
                ))}
              </div>
            )}
            {party.ended && (
              <button className="btn btn-c" style={{ color:'var(--dk)' }} onClick={() => navigate(`/podium/${partyId}`)}>
                🏆 VOIR LE PODIUM
              </button>
            )}
          </>
        )}

        {/* ── PLAYERS ── */}
        {tab === 'players' && (
          <>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginBottom:14 }}>
              {players.length} agent(s) inscrit(s)
            </div>
            {players.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <input
                  className="form-input"
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                  placeholder="🔎 Rechercher un agent…"
                />
              </div>
            )}
            {players.length === 0 && (
              <div className="card" style={{ textAlign:'center', color:'rgba(255,255,255,.35)', padding:'30px 0' }}>
                Aucun agent inscrit pour l'instant.
              </div>
            )}
            {filteredPlayers.length === 0 && players.length > 0 && (
              <div className="card" style={{ textAlign:'center', color:'rgba(255,255,255,.35)', padding:'22px 0', marginBottom:10 }}>
                Aucun agent ne correspond à cette recherche.
              </div>
            )}
            {filteredPlayers.map(p => {
              const role = ROLES[p.roleIndex % ROLES.length]
              return (
                <div key={p.id} style={{
                  background:'var(--cd)', borderRadius:16, padding:'12px 16px', marginBottom:10,
                  border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12,
                }}>
                  <Avatar player={p} size={44} style={{ border:'2px solid rgba(255,255,255,.12)' }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--c)' }}>{role.e} {role.n}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>
                      🎯 {p.score||0} pts · 💀 {p.caughtCount||0} pris
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    style={{
                      background:'rgba(255,60,172,.12)', border:'1px solid rgba(255,60,172,.3)',
                      color:'var(--p)', borderRadius:10, padding:'8px 12px',
                      fontSize:13, fontWeight:800, cursor:'pointer',
                    }}
                  >🗑️</button>
                </div>
              )
            })}
          </>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginBottom:16 }}>
              Les changements sont appliqués immédiatement.
            </div>

            {[
              { key:'name',     label:'Nom de la soirée',           type:'text', val: party.name   },
              { key:'prize',    label:'Lot du gagnant',              type:'text', val: party.prize  },
            ].map(f => (
              <div key={f.key} className="card" style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>
                  {f.label}
                </div>
                {editField === f.key ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      className="form-input" type={f.type} value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      style={{ flex:1 }} autoFocus
                    />
                    <button className="btn btn-c btn-sm" style={{ width:'auto', padding:'10px 16px' }} onClick={saveEdit}>✓</button>
                    <button className="btn btn-ghost btn-sm" style={{ width:'auto', padding:'10px 16px' }} onClick={() => setEditField(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ flex:1, fontWeight:700, fontSize:14 }}>{f.val || '—'}</div>
                    <button
                      onClick={() => startEdit(f.key, f.val)}
                      style={{ background:'rgba(0,245,255,.1)', border:'1px solid rgba(0,245,255,.2)',
                        color:'var(--c)', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:800, cursor:'pointer' }}
                    >✏️ Modifier</button>
                  </div>
                )}
              </div>
            ))}

            <div className="card" style={{ marginTop:14, marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                📋 Début d'inscription
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <input className="form-input" type="date" value={regStartDate} onChange={e => setRegStartDate(e.target.value)} />
                <input className="form-input" type="time" value={regStartTime} onChange={e => setRegStartTime(e.target.value)} />
              </div>
              <button className="btn btn-y" style={{ fontSize:14, color:'var(--dk)' }} onClick={saveRegStart}>
                📋 Enregistrer
              </button>
            </div>

            <div className="card" style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                ⛔ Fin d'inscription
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <input className="form-input" type="date" value={regEndDate} onChange={e => setRegEndDate(e.target.value)} />
                <input className="form-input" type="time" value={regEndTime} onChange={e => setRegEndTime(e.target.value)} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-y" style={{ flex:2, fontSize:14, color:'var(--dk)' }} onClick={saveRegEnd}>
                  ⛔ Enregistrer
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, padding:'14px 0' }} onClick={clearRegEnd}>
                  ✕
                </button>
              </div>
            </div>

            <div className="card" style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                🎮 Début du jeu
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <input className="form-input" type="date" value={gameStartDate} onChange={e => setGameStartDate(e.target.value)} />
                <input className="form-input" type="time" value={gameStartTime} onChange={e => setGameStartTime(e.target.value)} />
              </div>
              <button className="btn btn-y" style={{ fontSize:14, color:'var(--dk)' }} onClick={saveGameStart}>
                🎮 Enregistrer
              </button>
            </div>

            {!party.ended && (
              <div className="card" style={{ marginTop:14, marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                  🏁 Fin du jeu
                </div>
                {isLive && (
                  <button className="btn btn-p" onClick={handleEndNow} style={{ fontSize:18, marginBottom:10 }}>
                    🏆 TERMINER MAINTENANT
                  </button>
                )}
                <div style={{ fontSize:12, fontWeight:900, color:'var(--y)', letterSpacing:1, marginBottom:10 }}>
                  ⏰ PROGRAMMER LA FIN
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  <input className="form-input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
                <button className="btn btn-y" style={{ fontSize:14, color:'var(--dk)' }} onClick={handleScheduleEnd}>
                  ⏰ Enregistrer l'heure de fin
                </button>
                {party.endTs && (
                  <div style={{ fontSize:11, color:'var(--y)', marginTop:8, textAlign:'center' }}>
                    Fin programmée : {tsToLabel(party.endTs)}
                  </div>
                )}
              </div>
            )}

            <div className="card" style={{ marginTop:14, marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                Gages
              </div>

              <div className="custom-toggle" onClick={toggleAllowCustomGages} style={{ marginBottom:12 }}>
                <span>✏️ Autoriser le joueur à remplacer ses gages</span>
                <span style={{ fontSize: 18, fontWeight: 900 }}>{party.allowCustomGages ? '✓' : '✕'}</span>
              </div>

              <div style={{ fontSize:10, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>
                Gages par joueur
              </div>
              <select
                className="form-input"
                value={party.missions || 2}
                onChange={(e) => updateMissions(parseInt(e.target.value))}
                style={{ marginBottom:12 }}
              >
                <option value={1}>1 gage</option>
                <option value={2}>2 gages</option>
                <option value={3}>3 gages</option>
              </select>

              <div style={{ fontSize:10, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                Types de gages pour la victime
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                {TYPE_ORDER.map(type => {
                  const cfg = GAGE_TYPES[type]
                  const on  = (party.enabledTypes || ['soft']).includes(type)
                  const rgb = type==='soft'?'57,255,20':type==='med'?'0,245,255':type==='hard'?'255,60,172':'255,106,213'
                  return (
                    <div key={type} onClick={() => toggleType(type)} style={{
                      display:'flex', alignItems:'center', gap:14, cursor:'pointer', borderRadius:16,
                      padding:'14px 16px', transition:'all .2s',
                      background: on ? `rgba(${rgb},.08)` : 'var(--cd)',
                      border: `2px solid ${on ? cfg.color : 'rgba(255,255,255,.08)'}`,
                    }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0, transition:'all .2s',
                        background: on ? cfg.color : 'rgba(255,255,255,.1)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:900, color: on ? 'var(--dk)' : 'rgba(255,255,255,.3)',
                      }}>{on ? '✓' : ''}</div>
                      <div style={{ fontSize:28 }}>{cfg.emoji}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:900, fontSize:15, color: on ? cfg.color : '#fff' }}>{cfg.label}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:2 }}>{cfg.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize:10, fontWeight:900, color:'var(--y)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                Gages activés
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex:1 }}
                  onClick={() => {
                    const allowed = new Set(party.enabledTypes || ['soft'])
                    const all = GAGES.map((g, i) => (allowed.has(g.lvl) ? i : null)).filter(v => v !== null)
                    dbSet(`/parties/${partyId}/enabledGages`, all).then(() => showToast('✅ Modifié !', 'var(--c)'))
                  }}
                >✅ Tout</button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex:1 }}
                  onClick={() => {
                    dbSet(`/parties/${partyId}/enabledGages`, []).then(() => showToast('✅ Modifié !', 'var(--c)'))
                  }}
                >❌ Aucun</button>
              </div>

              <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
                {GAGES.map((g, idx) => {
                  const allowed = (party.enabledTypes || ['soft']).includes(g.lvl)
                  if (!allowed) return null
                  const on = (party.enabledGages || []).includes(idx)
                  const expanded = expandedGages.has(idx)
                  const long = (g.a || '').length > 90 || (g.i || '').length > 60
                  const cfg = GAGE_TYPES[g.lvl]
                  const rgb = g.lvl==='soft'?'57,255,20':g.lvl==='med'?'0,245,255':g.lvl==='hard'?'255,60,172':'255,106,213'
                  return (
                    <div key={idx} onClick={() => toggleGage(idx)} className={`gage-pick-item ${on?'selected':''}`}>
                      <div className="gpi-check">{on?'✓':''}</div>
                      <div style={{ flex:1 }}>
                        <div className="gpi-trg">{g.t}</div>
                        <div style={{ marginTop:8 }}>
                          <span style={{
                            fontSize:9, fontWeight:900, padding:'2px 6px', borderRadius:5,
                            background:`rgba(${rgb},.15)`,
                            color: cfg.color,
                          }}>
                            {cfg.emoji} {cfg.label.toUpperCase()}
                          </span>
                        </div>
                        <div style={{
                          fontSize:12,
                          color:'rgba(255,255,255,.7)',
                          lineHeight:1.35,
                          marginTop:8,
                          display: '-webkit-box',
                          WebkitLineClamp: expanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          👉 {g.a}
                        </div>
                        {g.i && expanded && (
                          <div style={{ marginTop:6, fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.35 }}>
                            💡 {g.i}
                          </div>
                        )}
                        {long && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpandedGage(idx) }}
                            style={{
                              marginTop:8,
                              background:'rgba(255,255,255,.06)',
                              border:'1px solid rgba(255,255,255,.10)',
                              color:'rgba(255,255,255,.6)',
                              borderRadius:10,
                              padding:'6px 10px',
                              fontSize:11,
                              fontWeight:900,
                              cursor:'pointer',
                              width:'fit-content',
                            }}
                          >
                            {expanded ? 'Réduire' : 'Voir plus'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Danger zone */}
            <div style={{
              marginTop:24, background:'rgba(255,60,172,.05)', border:'1px solid rgba(255,60,172,.2)',
              borderRadius:16, padding:16,
            }}>
              <div style={{ fontSize:12, fontWeight:900, color:'var(--p)', letterSpacing:2, marginBottom:12 }}>
                ⚠️ ZONE DANGEREUSE
              </div>
              <button
                className="btn"
                style={{
                  background:'rgba(255,60,172,.15)', border:'1px solid rgba(255,60,172,.4)',
                  color:'var(--p)', fontSize:14, fontWeight:900,
                }}
                onClick={() => setConfirmDeleteParty(true)}
              >
                🗑️ SUPPRIMER CETTE SOIRÉE
              </button>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:8 }}>
                Supprime la soirée, tous les joueurs et toutes les données. Irréversible.
              </div>
            </div>
          </>
        )}

        <div style={{ height:20 }}/>
      </div>

      {/* Delete player modal */}
      {confirmDelete && (
        <Modal
          title={`🗑️ Supprimer ${confirmDelete.name} ?`}
          subtitle="Cette action est irréversible. Le joueur disparaîtra du jeu."
          confirmLabel="🗑️ OUI, SUPPRIMER"
          confirmClass="btn-p"
          onConfirm={handleDeletePlayer}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Delete party modal */}
      {confirmDeleteParty && (
        <Modal
          title="🗑️ Supprimer toute la soirée ?"
          subtitle={`"${party.name}" et ses ${players.length} joueur(s) seront supprimés définitivement.`}
          confirmLabel="🗑️ OUI, TOUT SUPPRIMER"
          confirmClass="btn-p"
          onConfirm={handleDeleteParty}
          onCancel={() => setConfirmDeleteParty(false)}
        />
      )}
    </div>
  )
}
