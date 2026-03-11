import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParties } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../firebase'
import { showToast } from '../components/Toast'
import { getGameTs, getRegEndTs, getRegTs, tsToLabel } from '../utils/time'

export default function Home() {
  const navigate = useNavigate()
  const parties  = useParties()
  const user     = useAuth()
  const now      = Date.now()

  const [session, setSession] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dp_session')
      if (raw) setSession(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (!user) return
    localStorage.removeItem('dp_session')
    setSession(null)
  }, [user])

  const handleLogout = async () => {
    await logout()
    showToast('👋 Déconnecté !', 'var(--c)')
  }

  const clearSession = () => {
    localStorage.removeItem('dp_session')
    setSession(null)
  }

  const AdminBar = () => (
    <div className="admin-bar">
      {user ? (
        <div className="admin-bar-actions">
          <button className="btn btn-pu" onClick={() => navigate('/admin/parties')}>
            ⚙️ MES SOIRÉES
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize:12, padding:'10px 0' }}
            onClick={handleLogout}
          >
            Déconnexion ({user.displayName})
          </button>
        </div>
      ) : (
        <button className="btn btn-pu" onClick={() => navigate('/admin/login')}>
          ⚙️ ESPACE ORGANISATEUR
        </button>
      )}
    </div>
  )

  return (
    <div className="screen screen-bg-purple" style={{ paddingBottom:'var(--admin-bar-h, 0px)' }}>
      <div className="bg-grid"/>
      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column' }}>

        {/* Hero */}
        <div style={{ padding:'36px 20px 10px', textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:4, color:'var(--c)', opacity:.7, marginBottom:8 }}>
            🔍 LE JEU D'AMBIANCE ULTIME
          </div>
          <div style={{
            fontFamily:'Bangers,cursive', fontSize:'clamp(56px,17vw,88px)',
            lineHeight:.85, letterSpacing:3,
            background:'linear-gradient(135deg,var(--y),var(--p)55%,var(--c))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>DÉTECTIVE<br/>PARTY</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', marginTop:8 }}>
            Démasque, piège, survie. Bonne chance, agent.
          </div>
        </div>

        <div style={{ fontSize:72, textAlign:'center', margin:'10px 0' }} className="float">🕵️</div>

        {/* Espace organisateur — visible avant les soirées sur écrans larges */}
        <div className="admin-bar-inline">
          <AdminBar />
        </div>

        {/* Session resume */}
        {session && !user && (
          <div className="home-session">
            <div style={{
              background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.25)',
              borderRadius:18, padding:'14px 16px',
            }}>
              <div style={{ fontSize:11, fontWeight:900, color:'var(--g)', letterSpacing:2, marginBottom:8 }}>
                🎮 REPRENDRE MA SESSION
              </div>
              <div style={{ fontSize:13, marginBottom:12, color:'rgba(255,255,255,.65)' }}>
                Tu as une partie en cours. Reprends où tu t'es arrêté(e) !
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  className="btn btn-g"
                  style={{ flex:2, fontSize:14, padding:'12px 0', color:'var(--dk)' }}
                  onClick={() => navigate(`/dashboard/${session.partyId}/${session.playerId}`)}
                >▶ REJOINDRE</button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex:1.35, padding:'12px 0', fontSize:12, whiteSpace:'nowrap' }}
                  onClick={clearSession}
                >⎋ Se déconnecter</button>
              </div>
            </div>
          </div>
        )}

        {/* Soirées */}
        <div className="home-parties">
          <div style={{
            fontFamily:'Bangers,cursive', fontSize:22, color:'var(--y)',
            letterSpacing:1, marginBottom:12, textAlign:'center',
          }}>
            🎉 SOIRÉES
          </div>

          {parties === undefined && (
            <div style={{ textAlign:'center', padding:30 }}><div className="spinner"/></div>
          )}
          {parties !== undefined && parties.length === 0 && (
            <div style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:'30px 0', fontSize:13 }}>
              Aucune soirée pour l'instant.<br/>L'organisateur doit en créer une !
            </div>
          )}

          {parties && (
            <div className="parties-grid">
              {parties.map(p => {
                const gameStart = getGameTs(p)
                const regStart  = getRegTs(p)
                const regEnd    = getRegEndTs(p)
                const isLive    = !p.ended && gameStart && now >= gameStart
                const regOpen   = regStart && now >= regStart && (!regEnd || now < regEnd)
                const badge = p.ended
                  ? <span className="pc-badge ended">✅ Archivée</span>
                  : isLive
                    ? <span className="pc-badge live">🟢 En cours</span>
                    : regOpen
                      ? <span className="pc-badge reg">📋 Inscriptions ouvertes</span>
                      : regEnd && now >= regEnd
                        ? <span className="pc-badge closed">⛔ Inscriptions fermées</span>
                      : <span className="pc-badge soon">⏳ Bientôt</span>

                return (
                  <div key={p.id} className="party-card" onClick={() => navigate(`/party/${p.id}`)}>
                    <div style={{ fontSize:40, width:52, textAlign:'center', flexShrink:0 }}>{p.image||'🎭'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Bangers,cursive', fontSize:20, letterSpacing:1 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>
                        🎮 {tsToLabel(gameStart)}
                      </div>
                      <div style={{ marginTop:4 }}>{badge}</div>
                    </div>
                    <div style={{ fontSize:22, color:'rgba(255,255,255,.2)' }}>›</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ height:20 }}/>
      </div>

      {/* Admin bar fixed bottom — mobile only */}
      <div className="admin-bar-fixed">
        <AdminBar />
      </div>
    </div>
  )
}
