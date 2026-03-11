import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dbSet } from '../firebase'
import { GAME_IMAGES } from '../data/roles'
import { GAGES, GAGE_TYPES } from '../data/gages'
import { showToast } from '../components/Toast'
import { localToTs } from '../utils/time'

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const TYPE_ORDER = ['soft', 'med', 'hard', 'sexy']

export default function AdminCreate() {
  const navigate = useNavigate()
  const user = useAuth()

  const [name, setName]         = useState('')
  const [regDate, setRegDate]   = useState('')  // date ouverture inscriptions
  const [regTime, setRegTime]   = useState('')  // heure ouverture inscriptions
  const [regEndDate, setRegEndDate] = useState('') // date fin inscriptions (optionnel)
  const [regEndTime, setRegEndTime] = useState('') // heure fin inscriptions (optionnel)
  const [gameDate, setGameDate] = useState('')  // date début du jeu
  const [gameTime, setGameTime] = useState('')  // heure début du jeu
  const [endDate, setEndDate]   = useState('')  // date fin du jeu (optionnel)
  const [endTime, setEndTime]   = useState('')  // heure fin du jeu (optionnel)
  const [prize, setPrize]       = useState('')
  const [missions, setMissions] = useState(2)
  const [selectedImg, setSelectedImg] = useState(0)
  const [enabledTypes, setEnabledTypes] = useState(new Set(['soft']))
  const [enabledGages, setEnabledGages] = useState(() => new Set(GAGES.map((g, i) => (g.lvl === 'soft' ? i : null)).filter(v => v !== null)))
  const [allowCustomGages, setAllowCustomGages] = useState(true)
  const [loading, setLoading]   = useState(false)

  if (user === undefined) {
    return (
      <div className="screen screen-bg-blue">
        <div className="bg-grid" />
        <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (!user) { navigate('/admin/login'); return null }

  const toggleType = (type) => {
    setEnabledTypes(prev => {
      const next = new Set(prev)
      const wasOn = next.has(type)
      if (wasOn && next.size === 1) return prev

      if (wasOn) {
        next.delete(type)
        setEnabledGages(prevG => {
          const ng = new Set(prevG)
          GAGES.forEach((g, i) => { if (g.lvl === type) ng.delete(i) })
          return ng
        })
      } else {
        next.add(type)
        setEnabledGages(prevG => {
          const ng = new Set(prevG)
          GAGES.forEach((g, i) => { if (g.lvl === type) ng.add(i) })
          return ng
        })
      }

      return next
    })
  }

  const toggleGage = (idx) => {
    setEnabledGages(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const handleCreate = async () => {
    if (!name.trim())           { showToast('⚠️ Donne un nom à la soirée !', '#FF6B00'); return }
    if (!regDate || !regTime)   { showToast('⚠️ Indique la date/heure d\'ouverture des inscriptions !', '#FF6B00'); return }
    if (!gameDate || !gameTime) { showToast('⚠️ Indique la date/heure de début du jeu !', '#FF6B00'); return }
    if ((regEndDate && !regEndTime) || (!regEndDate && regEndTime)) {
      showToast('⚠️ Pour la fin des inscriptions, indique une date ET une heure', '#FF6B00'); return
    }
    if ((endDate && !endTime) || (!endDate && endTime)) {
      showToast('⚠️ Pour la fin du jeu, indique une date ET une heure', '#FF6B00'); return
    }
    if (enabledGages.size < missions) {
      showToast(`⚠️ Sélectionne au moins ${missions} gage(s) !`, '#FF6B00'); return
    }

    setLoading(true)
    const id   = 'party_' + Date.now()
    const code = genCode()
    const regEndTs = regEndDate && regEndTime ? localToTs(regEndDate, regEndTime) : null
    const endTs    = endDate && endTime ? localToTs(endDate, endTime) : null
    const party = {
      id,
      name: name.trim(),
      regDate, regTime,
      gameDate, gameTime,
      regTs:  localToTs(regDate,  regTime),   // ✅ timestamp local, sans ambiguïté UTC
      gameTs: localToTs(gameDate, gameTime),  // ✅ timestamp local, sans ambiguïté UTC
      regEndDate: regEndDate || '',
      regEndTime: regEndTime || '',
      regEndTs,
      prize: prize.trim() || 'À définir',
      missions,
      image: GAME_IMAGES[selectedImg].e,
      enabledTypes:      Array.from(enabledTypes),
      enabledGages:      Array.from(enabledGages),
      code,
      players: {},
      ended: false,
      endTs,
      allowCustomGages,
      createdAt: Date.now(),
      adminUid:  user.uid,
      adminName: user.displayName,
    }
    try {
      await dbSet(`/parties/${id}`, party)
      showToast('🎉 Soirée créée ! Code : ' + code, 'var(--c)')
      navigate(`/admin/dash/${id}`)
    } catch (e) {
      showToast('❌ Erreur : ' + e.message, '#FF3CAC')
    }
    setLoading(false)
  }

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid" />
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/admin/parties')}>←</button>
          <div className="screen-title">🎉 CRÉER UNE SOIRÉE</div>
        </div>

        {/* Admin badge */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20,
          background:'var(--cd)', borderRadius:14, padding:'12px 16px' }}>
          <img src={user.photoURL} alt="" style={{ width:36, height:36, borderRadius:'50%', border:'2px solid var(--pu)' }} />
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>{user.displayName}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>Organisateur</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom de la soirée</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Anniv de Mica 🎂" />
        </div>

        {/* Inscriptions */}
        <div className="form-group">
          <label className="form-label">📋 Ouverture des inscriptions</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input className="form-input" type="date" value={regDate} onChange={e => setRegDate(e.target.value)} />
            <input className="form-input" type="time" value={regTime} onChange={e => setRegTime(e.target.value)} />
          </div>
          <div className="form-hint">Les invités pourront s'inscrire à partir de cette heure.</div>
        </div>

        <div className="form-group">
          <label className="form-label">⛔ Fin des inscriptions (optionnel)</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input className="form-input" type="date" value={regEndDate} onChange={e => setRegEndDate(e.target.value)} />
            <input className="form-input" type="time" value={regEndTime} onChange={e => setRegEndTime(e.target.value)} />
          </div>
          <div className="form-hint">Après cette heure, les invités ne pourront plus s'inscrire.</div>
        </div>

        {/* Début du jeu */}
        <div className="form-group">
          <label className="form-label">🎮 Début du jeu</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input className="form-input" type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} />
            <input className="form-input" type="time" value={gameTime} onChange={e => setGameTime(e.target.value)} />
          </div>
          <div className="form-hint">Les joueurs pourront démasquer à partir de cette heure.</div>
        </div>

        <div className="form-group">
          <label className="form-label">🏁 Fin du jeu (optionnel)</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <input className="form-input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <div className="form-hint">La partie se terminera automatiquement à cette heure si elle est programmée.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Lot du gagnant 🏆</label>
          <input className="form-input" value={prize} onChange={e => setPrize(e.target.value)} placeholder="Ex : Une bouteille de champagne !" />
        </div>

        <div className="form-group">
          <label className="form-label">Gages par joueur</label>
          <select className="form-input" value={missions} onChange={e => setMissions(parseInt(e.target.value))}>
            <option value={1}>1 gage</option>
            <option value={2}>2 gages</option>
            <option value={3}>3 gages</option>
          </select>
        </div>

        {/* Image */}
        <div className="form-group">
          <label className="form-label">Image de la soirée</label>
          <div className="image-grid">
            {GAME_IMAGES.map((img, i) => (
              <div key={i} className={`image-opt ${selectedImg===i?'selected':''}`} onClick={() => setSelectedImg(i)}>
                <div style={{ fontSize:36, marginBottom:6 }}>{img.e}</div>
                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.55)', letterSpacing:1 }}>{img.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gage types */}
        <div className="form-group">
          <label className="form-label">Types de gages pour la victime</label>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:12, lineHeight:1.5 }}>
            Filtre la liste des gages disponibles.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {TYPE_ORDER.map(type => {
              const cfg = GAGE_TYPES[type]
              const on  = enabledTypes.has(type)
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

          {/* Example preview */}
          {enabledTypes.size > 0 && (
            <div style={{ marginTop:14, background:'rgba(0,0,0,.3)', borderRadius:14, padding:14 }}>
              <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color:'rgba(255,255,255,.35)', marginBottom:10 }}>
                EXEMPLE DE GAGE QUE RECEVRA UNE VICTIME
              </div>
              {Array.from(enabledTypes).map(type => {
                const cfg = GAGE_TYPES[type]
                const ex  = GAGES.find(g => g.lvl === type) || GAGES[0]
                return (
                  <div key={type} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                    <span style={{ fontSize:16 }}>{cfg.emoji}</span>
                    <div>
                      <span style={{ fontSize:11, fontWeight:900, color:cfg.color }}>{cfg.label} — </span>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>{ex.a}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Gages */}
        <div className="form-group">
          <label className="form-label">Gages activés ({enabledGages.size}/{GAGES.length})</label>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => setEnabledGages(new Set(GAGES.map((g, i) => (enabledTypes.has(g.lvl) ? i : null)).filter(v => v !== null)))}>✅ Tout</button>
            <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => setEnabledGages(new Set())}>❌ Aucun</button>
          </div>
          <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
            {GAGES.map((g, idx) => {
              if (!enabledTypes.has(g.lvl)) return null
              const on = enabledGages.has(idx)
              const cfg = GAGE_TYPES[g.lvl]
              const rgb = g.lvl==='soft'?'57,255,20':g.lvl==='med'?'0,245,255':g.lvl==='hard'?'255,60,172':'255,106,213'
              return (
                <div key={idx} onClick={() => toggleGage(idx)} className={`gage-pick-item ${on?'selected':''}`}>
                  <div className="gpi-check">{on?'✓':''}</div>
                  <div style={{ flex:1 }}>
                    <div className="gpi-trg">{g.t}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', lineHeight:1.35, marginTop:6 }}>
                      👉 {g.a}
                    </div>
                    <div style={{ marginTop:8 }}>
                      <span style={{
                        fontSize:9, fontWeight:900, padding:'2px 6px', borderRadius:5,
                        background:`rgba(${rgb},.15)`,
                        color: cfg.color,
                      }}>
                        {cfg.emoji} {cfg.label.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-p" onClick={handleCreate} disabled={loading} style={{ marginTop:6 }}>
          {loading ? '⏳ Création...' : '🚀 CRÉER LA SOIRÉE !'}
        </button>
        <div style={{ height:20 }} />
      </div>
    </div>
  )
}
