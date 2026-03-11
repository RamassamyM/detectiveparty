import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { getGameTs, getRegEndTs, getRegTs, tsToLabel } from '../utils/time'

function fmtDate(d, t) {
  if (!d) return ''
  const [y,m,dd] = d.split('-')
  const mois = ['jan','fév','mars','avr','mai','juin','juil','août','sep','oct','nov','déc']
  return `${parseInt(dd)} ${mois[parseInt(m)-1]} ${y}${t?' à '+t:''}`
}

function Countdown({ target, label }) {
  const [txt, setTxt] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setTxt('C\'est l\'heure !'); return }
      const h = Math.floor(diff/3600000)
      const m = Math.floor((diff%3600000)/60000)
      const s = Math.floor((diff%60000)/1000)
      setTxt(`${h>0?h+'h ':''}${m}min ${s}s`)
      setTimeout(tick, 1000)
    }; tick()
  }, [target])
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:4 }}>{label}</div>
      <div className="countdown">{txt}</div>
    </div>
  )
}

export default function PartyPage() {
  const { partyId } = useParams()
  const navigate    = useNavigate()
  const party       = useParty(partyId)

  const [session, setSession] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dp_session')
      if (raw) setSession(JSON.parse(raw))
    } catch {}
  }, [])

  const clearSession = () => {
    localStorage.removeItem('dp_session')
    setSession(null)
  }

  if (!party) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  const now       = Date.now()
  const regStart  = getRegTs(party)
  const regEnd    = getRegEndTs(party)
  const gameStart = getGameTs(party)

  const regOpen  = now >= regStart && (!regEnd || now < regEnd)
  const gameOpen = now >= gameStart

  const lvlColors = { soft:'var(--g)', med:'var(--y)', hard:'var(--p)' }
  const lvlLabels = { soft:'😄 Fun & Soft', med:'😏 Drôle & Engagé', hard:'😈 Carrément Hard' }
  const playerCount = Object.keys(party.players||{}).length

  const isSessionForThisParty = session?.partyId === partyId
  const sessionPlayer = isSessionForThisParty ? party.players?.[session?.playerId] : null
  const isPlayerConnected = Boolean(sessionPlayer)

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="screen-title">{party.name}</div>
        </div>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:80, marginBottom:12 }} className="float">{party.image||'🎭'}</div>
          <div style={{
            fontFamily:'Bangers, cursive', fontSize:'clamp(32px,10vw,52px)', lineHeight:.9,
            background:'linear-gradient(135deg,var(--y),var(--p))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            letterSpacing:2, marginBottom:6,
          }}>{party.name.toUpperCase()}</div>

          {/* Tags */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:14 }}>
            <span style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:800 }}>
              👥 {playerCount} agents
            </span>
            {party.enabledTypes && (
              <span style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:800 }}>
                {party.enabledTypes
                  .map(t => (t === 'physique' ? 'med' : t === 'ose' ? 'hard' : t))
                  .map(t => t==='soft'?'😄':t==='med'?'😅':t==='hard'?'🔥':'💋')
                  .join(' ')} Gages actifs
              </span>
            )}
            <span style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:800 }}>
              🎭 {party.missions||2} gage(s)/joueur
            </span>
          </div>

          {/* Dates */}
          <div style={{ background:'var(--cd)', borderRadius:16, padding:'14px 16px', marginBottom:16, textAlign:'left' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>📋 Inscriptions ouvertes</span>
              <span style={{ fontSize:12, fontWeight:800 }}>{tsToLabel(regStart)}</span>
            </div>
            {regEnd && (
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>⛔ Fin d'inscription</span>
                <span style={{ fontSize:12, fontWeight:800 }}>{tsToLabel(regEnd)}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>🎮 Début du jeu</span>
              <span style={{ fontSize:12, fontWeight:800 }}>{tsToLabel(gameStart)}</span>
            </div>
          </div>
        </div>

        {/* Prize */}
        {party.prize && (
          <div style={{
            background:'linear-gradient(135deg,rgba(255,230,0,.12),rgba(255,107,0,.12))',
            border:'1px solid rgba(255,230,0,.3)', borderRadius:16, padding:16,
            textAlign:'center', marginBottom:16,
          }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:4 }}>🏆 LOT DU GAGNANT</div>
            <div style={{ fontFamily:'Bangers, cursive', fontSize:22, color:'var(--y)', letterSpacing:1 }}>
              {party.prize}
            </div>
          </div>
        )}

        <div style={{
          background:'var(--cd)',
          border:'1px solid rgba(255,255,255,.08)',
          borderRadius:16,
          padding:16,
          marginBottom:16,
        }}>
          <div style={{ fontFamily:'Bangers, cursive', fontSize:18, color:'var(--c)', letterSpacing:1, marginBottom:10 }}>
            🕵️ COMMENT JOUER
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:12, color:'rgba(255,255,255,.65)', lineHeight:1.55 }}>
            <div>
              <strong style={{ color:'#fff' }}>1) Inscris-toi</strong>
              <div style={{ marginTop:4 }}>Tu choisis ton prénom + ton avatar. L'année de naissance sert de <strong>code de reconnexion</strong>.</div>
            </div>
            <div>
              <strong style={{ color:'#fff' }}>2) Reçois ton rôle</strong>
              <div style={{ marginTop:4 }}>Un personnage de détective t'est attribué. Garde-le en tête : c'est ton identité pendant la soirée.</div>
            </div>
            <div>
              <strong style={{ color:'#fff' }}>3) Le jeu démarre</strong>
              <div style={{ marginTop:4 }}>À partir de <strong>{tsToLabel(gameStart)}</strong>, tu peux <strong>démasquer</strong> les autres agents.</div>
            </div>
            <div>
              <strong style={{ color:'#fff' }}>4) Démasquer = marquer des points</strong>
              <div style={{ marginTop:4 }}>Quand tu devines l'identité d'un joueur, tu choisis le gage que tu as déclenché et tu gagnes des points.</div>
            </div>
            <div>
              <strong style={{ color:'#fff' }}>5) Si on te démasque…</strong>
              <div style={{ marginTop:4 }}>Tu reçois un gage à faire. Les gages sont choisis parmi ceux activés par l'organisateur.</div>
            </div>
          </div>
        </div>

        {/* ── ACTION ZONE ── */}
        {party.ended ? (
          /* Soirée terminée */
          <button className="btn btn-y" onClick={() => navigate(`/podium/${partyId}`)}>
            🏆 VOIR LE PODIUM
          </button>

        ) : isPlayerConnected ? (
          /* Joueur déjà connecté pour cette soirée */
          <>
            <div style={{
              background:'rgba(0,245,255,.08)', border:'1px solid rgba(0,245,255,.25)',
              borderRadius:16, padding:16, textAlign:'center', marginBottom:14,
            }}>
              <div style={{ fontSize:14, fontWeight:900, color:'var(--c)', marginBottom:6 }}>
                ✅ Connecté en tant que {sessionPlayer.name}
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', lineHeight:1.6 }}>
                Tu peux reprendre ta session ou la quitter.
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-g" style={{ color:'var(--dk)' }} onClick={() => navigate(`/dashboard/${partyId}/${sessionPlayer.id}`)}>
                ▶ REJOINDRE
              </button>
              <button className="btn btn-ghost" onClick={clearSession}>
                ✕ QUITTER LA SESSION
              </button>
            </div>
          </>

        ) : !regOpen ? (
          /* Inscriptions pas encore ouvertes */
          <div style={{
            background:'rgba(139,92,246,.08)', border:'1px solid rgba(139,92,246,.25)',
            borderRadius:16, padding:20, textAlign:'center',
          }}>
            <div style={{ fontSize:40, marginBottom:8 }}>🔒</div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.5, marginBottom:12 }}>
              Les inscriptions ouvrent le<br/><strong>{tsToLabel(regStart)}</strong>
            </p>
            <Countdown target={regStart} label="Inscriptions dans" />
          </div>

        ) : !gameOpen ? (
          /* Inscriptions ouvertes, jeu pas encore commencé */
          <>
            <div style={{
              background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.2)',
              borderRadius:16, padding:16, textAlign:'center', marginBottom:14,
            }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--g)', marginBottom:4 }}>
                ✅ Inscriptions ouvertes !
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:10 }}>
                Le jeu commence le <strong>{tsToLabel(gameStart)}</strong>
              </p>
              <Countdown target={gameStart} label="Début du jeu dans" />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-p" onClick={() => navigate(`/party/${partyId}/register`)}>
                🕵️ M'INSCRIRE !
              </button>
              <button className="btn btn-c" style={{ color:'var(--dk)' }} onClick={() => navigate(`/party/${partyId}/login`)}>
                🔐 Déjà inscrit ? Me reconnecter
              </button>
            </div>
          </>

        ) : (
          /* Jeu en cours */
          <>
            <div style={{
              background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.2)',
              borderRadius:14, padding:12, textAlign:'center', marginBottom:14,
            }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--g)' }}>🟢 Jeu en cours !</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-p" onClick={() => navigate(`/party/${partyId}/register`)}>
                🕵️ M'INSCRIRE !
              </button>
              <button className="btn btn-c" style={{ color:'var(--dk)' }} onClick={() => navigate(`/party/${partyId}/login`)}>
                🔐 Déjà inscrit ? Me reconnecter
              </button>
            </div>
          </>
        )}

        <div style={{ height:20 }}/>
      </div>
    </div>
  )
}
