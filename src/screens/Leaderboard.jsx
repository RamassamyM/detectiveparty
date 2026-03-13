import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import Avatar from '../components/Avatar'
import { ROLES } from '../data/roles'

const MEDALS = ['🥇','🥈','🥉']

function Section({ title, color, players, scoreKey, scoreLabel }) {
  const sorted = [...players].sort((a,b) => (b[scoreKey]||0)-(a[scoreKey]||0))
  
  let currentPlayerId = null
  let isConnected = false
  
  try {
    const dpSession = localStorage.getItem('dp_session')
    if (dpSession && dpSession !== 'undefined') {
      currentPlayerId = JSON.parse(dpSession).playerId
      isConnected = currentPlayerId !== null
    }
  } catch (error) {
    console.warn('Error parsing dp_session:', error)
    currentPlayerId = null
    isConnected = false
  }
  
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontFamily:'Bangers,cursive', fontSize:22, color, letterSpacing:1, marginBottom:12 }}>{title}</div>
      {sorted.length === 0 && (
        <div style={{ color:'rgba(255,255,255,.3)', fontSize:13 }}>Aucun score encore.</div>
      )}
      {sorted.map((p, i) => {
        const score = p[scoreKey] || 0
        const role = ROLES[p.roleIndex % ROLES.length] || ROLES[0]
        const isCurrentPlayer = p.id === currentPlayerId
        
        return (
          <div key={p.id} style={{
            display:'flex', alignItems:'center', gap:12, padding: isCurrentPlayer ? '14px 18px' : '10px 14px',
            marginBottom:8, borderRadius:16,
            background: isCurrentPlayer 
              ? scoreKey === 'score' ? 'rgba(0,255,120,.15)' : 'rgba(255,60,172,.15)' 
              : i < 3 ? `rgba(${color==='var(--c)'?'0,245,255':'255,60,172'},.06)` : 'var(--cd)',
            border: isCurrentPlayer 
              ? scoreKey === 'score' ? '3px solid rgba(0,255,120,1)' : '3px solid var(--p)' 
              : `1px solid ${i < 3 ? color : 'rgba(255,255,255,.06)'}`,
            boxShadow: isCurrentPlayer 
              ? scoreKey === 'score' ? '0 0 25px rgba(0,255,120,.4), inset 0 0 20px rgba(0,255,120,.1)' : '0 0 25px rgba(255,60,172,.4), inset 0 0 20px rgba(255,60,172,.1)'
              : 'none',
            transform: isCurrentPlayer ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
            animation: isCurrentPlayer ? (scoreKey === 'score' ? 'borderFlashGreen 2s infinite' : 'borderFlashRose 2s infinite') : 'none',
            position: 'relative'
          }}>
            <div style={{ fontFamily:'Bangers,cursive', fontSize: isCurrentPlayer ? 22 : 20, width: isCurrentPlayer ? 30 : 28, textAlign:'center' }}>
              {MEDALS[i] || <span style={{ color:'rgba(255,255,255,.3)' }}>{i+1}</span>}
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar 
                player={p} 
                size={isCurrentPlayer ? 44 : 38} 
                style={{ 
                  border: isCurrentPlayer ? (scoreKey === 'score' ? '3px solid rgba(0,255,120,1)' : '3px solid var(--p)') : '2px solid rgba(255,255,255,.12)', 
                  borderRadius:'50%', 
                  flexShrink:0,
                  boxShadow: isCurrentPlayer ? (scoreKey === 'score' ? '0 0 15px rgba(0,255,120,.5)' : '0 0 15px rgba(255,60,172,.5)') : 'none'
                }} 
              />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ 
                fontWeight:900, 
                fontSize: isCurrentPlayer ? 16 : 14, 
                color: isCurrentPlayer ? (scoreKey === 'score' ? 'rgba(0,255,120,1)' : 'var(--p)') : 'rgba(255,255,255,.8)',
                textShadow: isCurrentPlayer ? (scoreKey === 'score' ? '0 0 10px rgba(0,255,120,.5)' : '0 0 10px rgba(255,60,172,.5)') : 'none'
              }}>
                {isConnected ? p.name : role.n}
                {isCurrentPlayer && (
                  <span style={{ 
                    color: 'var(--c)', 
                    marginLeft: 8, 
                    fontWeight: 900,
                    fontSize: 14,
                    animation: 'pulse 2s infinite'
                  }}>
                    ← MOI
                  </span>
                )}
              </div>
              <div style={{ 
                fontSize: isCurrentPlayer ? 12 : 11, 
                color: isCurrentPlayer ? (scoreKey === 'score' ? 'rgba(0,255,120,1)' : 'var(--p)') : 'rgba(255,255,255,.4)',
                fontWeight: isCurrentPlayer ? 700 : 400,
                marginTop: 2
              }}>
                {isConnected ? `${role.n} • ${score} ${scoreLabel}` : `${score} ${scoreLabel}`}
              </div>
            </div>
            {i < 3 && (
              <div style={{ 
                fontFamily:'Bangers,cursive', 
                fontSize: isCurrentPlayer ? 28 : 26, 
                color: color,
                textShadow: isCurrentPlayer ? (scoreKey === 'score' ? '0 0 10px rgba(0,255,120,.5)' : '0 0 10px rgba(255,60,172,.5)') : 'none'
              }}>
                {score}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function LeaderboardPage() {
  const { partyId } = useParams()
  const navigate    = useNavigate()
  const party       = useParty(partyId)

  const [tab, setTab] = useState('top')

  if (!party) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems:'center', justifyContent:'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  const players = Object.values(party.players || {})

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div className="screen-title">🏆 CLASSEMENTS</div>
        </div>

        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:60 }} className="float">🏆</div>
          <div style={{ fontFamily:'Bangers,cursive', fontSize:28, letterSpacing:2, color:'var(--y)', marginTop:6 }}>
            {party.name.toUpperCase()}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginTop:4 }}>
            {players.length} agents · Mis à jour en temps réel
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          <button onClick={() => setTab('top')} style={{
            flex:1, padding:'10px 0', border:'none', borderRadius:12,
            fontFamily:'Bangers, cursive', fontSize:16, letterSpacing:1, cursor:'pointer',
            background: tab==='top' ? 'var(--c)' : 'rgba(255,255,255,.07)',
            color: tab==='top' ? 'var(--dk)' : 'rgba(255,255,255,.5)',
            transition:'all .2s',
          }}>🔍 TOP</button>
          <button onClick={() => setTab('flop')} style={{
            flex:1, padding:'10px 0', border:'none', borderRadius:12,
            fontFamily:'Bangers, cursive', fontSize:16, letterSpacing:1, cursor:'pointer',
            background: tab==='flop' ? 'var(--p)' : 'rgba(255,255,255,.07)',
            color: tab==='flop' ? '#fff' : 'rgba(255,255,255,.5)',
            transition:'all .2s',
          }}>💀 FLOP</button>
        </div>

        {tab === 'top' ? (
          <Section
            title="🔍 TOP DÉTECTIVES"
            color="var(--c)"
            players={players}
            scoreKey="score"
            scoreLabel="démasquage(s)"
          />
        ) : (
          <Section
            title="💀 FLOP COUPABLES"
            color="var(--p)"
            players={players}
            scoreKey="caughtCount"
            scoreLabel="fois pris"
          />
        )}

        <div style={{ height:20 }}/>
      </div>
    </div>
  )
}
