import Avatar from './Avatar'
import { ROLES } from '../data/roles'

const MEDALS = ['🥇', '🥈', '🥉']

export function MiniLeaderboard({ players, scoreKey, title, titleColor }) {
  const sorted = [...players].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0)).slice(0, 5)
  
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
    <div className="lb-card">
      <div className="lb-card-title" style={{ color: titleColor }}>{title}</div>
      {sorted.length === 0 ? (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', padding: '8px 0' }}>Aucun point encore</div>
      ) : sorted.map((p, i) => {
        const isCurrentPlayer = p.id === currentPlayerId
        const role = ROLES[p.roleIndex % ROLES.length]
        
        return (
          <div className="lb-row" key={p.id}>
            <div className="lb-pos" style={{ fontSize: 20 }}>{MEDALS[i] || i + 1}</div>
            <Avatar player={p} size={28} />
            <div className="lb-name">{isConnected ? p.name : role.n}</div>
            <div className="lb-score">{p[scoreKey] || 0} {scoreKey === 'caughtCount' ? '' : 'pts'}</div>
          </div>
        )
      })}
    </div>
  )
}

export function FullRankList({ players, scoreKey, icon }) {
  const sorted = [...players].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
  
  const dpSession = localStorage.getItem('dp_session')
  const currentPlayerId = dpSession && dpSession !== 'undefined' ? JSON.parse(dpSession).playerId : null
  const isConnected = currentPlayerId !== null

  return (
    <div className="rl" style={{ background: 'var(--cd)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {sorted.map((p, i) => {
        const role = ROLES[p.roleIndex % ROLES.length]
        const isCurrentPlayer = p.id === currentPlayerId
        
        return (
          <div className="rank-row" key={p.id}>
            <div className="rank-num" style={{ fontSize: 20 }}>{MEDALS[i] || i + 1}</div>
            <Avatar player={p} size={36} />
            <div className="rank-info">
              <div className="rank-name">{isConnected ? p.name : role.n}</div>
              <div className="rank-code">{isConnected ? role.n : ''}</div>
            </div>
            <div className="rank-score">{p[scoreKey] || 0} {icon === '💀' ? '' : 'pts'} {icon}</div>
          </div>
        )
      })}
    </div>
  )
}

export function PodiumSection({ players, scoreKey, icon }) {
  const sorted = [...players].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
  const top3 = sorted.slice(0, 3)
  const order = top3[1] ? [top3[1], top3[0], top3[2]].filter(Boolean) : [top3[0]].filter(Boolean)
  const classes = top3[1] ? ['podium-2', 'podium-1', 'podium-3'] : ['podium-1']
  const medals = top3[1] ? ['🥈', '🥇', '🥉'] : ['🥇']
  const borders = top3[1] ? ['2px solid #C0C0C0', '2px solid var(--y)', '2px solid #CD7F32'] : ['2px solid var(--y)']
  
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
    <div className="podium-stages">
      {order.map((p, i) => {
        const isCurrentPlayer = p.id === currentPlayerId
        const role = ROLES[p.roleIndex % ROLES.length]
        
        return (
          <div className={`podium-stage ${classes[i]}`} key={p.id}>
            <Avatar player={p} size={54} style={{ marginBottom: 5, border: borders[i], borderRadius: '50%' }} />
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: 1, textAlign: 'center', marginBottom: 2 }}>
              {isConnected ? p.name : role.n}
            </div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 17, color: 'var(--y)', marginBottom: 4 }}>{p[scoreKey] || 0} {icon}</div>
            <div className="podium-block" style={{ fontSize: 32 }}>{medals[i]}</div>
          </div>
        )
      })}
    </div>
  )
}
