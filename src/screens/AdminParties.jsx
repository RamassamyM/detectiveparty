import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useParties } from '../hooks/useParty'
import { logout } from '../firebase'
import { showToast } from '../components/Toast'
import { getGameTs, getRegTs, tsToLabel } from '../utils/time'

export default function AdminParties() {
  const navigate  = useNavigate()
  const user      = useAuth()
  const allParties = useParties()

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

  const myParties = allParties ? allParties.filter(p => p.adminUid === user.uid) : null
  const now = Date.now()

  const getStatus = (p) => {
    const gameStart = getGameTs(p)
    if (p.ended)                              return { label: '✅ Terminée',   cls: 'ended' }
    if (gameStart && now >= gameStart)        return { label: '🟢 En cours',   cls: 'live'  }
    return { label: '⏳ À venir', cls: 'soon' }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    showToast('👋 Déconnecté !', 'var(--c)')
  }

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid" />
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="screen-title">⚙️ MES SOIRÉES</div>
        </div>

        {/* User bar */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20,
          background:'var(--cd)', borderRadius:14, padding:'12px 16px' }}>
          <img src={user.photoURL} alt="" style={{ width:40, height:40, borderRadius:'50%', border:'2px solid var(--pu)' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15 }}>{user.displayName}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>{user.email}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width:'auto', padding:'8px 14px', fontSize:13 }} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <button className="btn btn-p" onClick={() => navigate('/admin/create')} style={{ marginBottom:20 }}>
          ➕ CRÉER UNE NOUVELLE SOIRÉE
        </button>

        {/* List */}
        {myParties === null && (
          <div style={{ textAlign:'center', padding:30 }}><div className="spinner" /></div>
        )}
        {myParties && myParties.length === 0 && (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:'30px 0', fontSize:14 }}>
            Tu n'as pas encore créé de soirée.<br/>Clique sur le bouton ci-dessus !
          </div>
        )}
        {myParties && myParties.map(p => {
          const st = getStatus(p)
          const playerCount = Object.keys(p.players || {}).length
          return (
            <div key={p.id} style={{
              background:'var(--cd)', borderRadius:18, padding:18, marginBottom:12,
              border:'1px solid rgba(255,255,255,.08)', cursor:'pointer',
              transition:'border-color .2s',
            }}
              onClick={() => navigate(`/admin/dash/${p.id}`)}
            >
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:44, width:58, textAlign:'center', flexShrink:0 }}>{p.image||'🎭'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Bangers, cursive', fontSize:22, letterSpacing:1 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:2 }}>
                    📋 Inscriptions : {tsToLabel(getRegTs(p))}
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
                    🎮 Jeu : {tsToLabel(getGameTs(p))}
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                    <span className={`pc-badge ${st.cls}`}>{st.label}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,.4)', alignSelf:'center' }}>
                      👥 {playerCount} joueur(s)
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:22, color:'rgba(255,255,255,.25)' }}>›</div>
              </div>
            </div>
          )
        })}
        <div style={{ height:20 }} />
      </div>
    </div>
  )
}
