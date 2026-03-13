import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { PodiumSection, FullRankList } from '../components/Leaderboard'

export default function Podium() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  
  
  if (!party) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid" />
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  const players = Object.values(party.players || {})

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid" />
      <div style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ padding: '36px 20px 16px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Bangers, cursive', fontSize: 48, letterSpacing: 2,
            background: 'linear-gradient(135deg,var(--y),var(--p))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>🏆 RÉSULTATS FINAUX !</div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 4 }}>{party.name}</div>
        </div>

        <div style={{ fontSize: 36, letterSpacing: 6, textAlign: 'center', margin: '8px 0', animation: 'shake .5s infinite alternate' }}>
          🎉🎊🥳🎉🎊
        </div>

        {/* Prize */}
        {party.prize && (
          <div style={{
            margin: '0 20px 16px',
            background: 'linear-gradient(135deg,rgba(255,230,0,.15),rgba(255,107,0,.15))',
            border: '1px solid rgba(255,230,0,.35)', borderRadius: 16, padding: '16px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 4 }}>🏆 LOT DU GAGNANT</div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 22, color: 'var(--y)', letterSpacing: 1 }}>
              {party.prize}
            </div>
          </div>
        )}

        {/* Détectives podium */}
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: 1, textAlign: 'center', margin: '16px 0 8px', color: 'var(--c)' }}>
          🔍 MEILLEURS DÉTECTIVES
        </div>
        <PodiumSection players={players} scoreKey="score" icon="🎯" />
        <div style={{ margin: '0 20px 16px' }}>
          <FullRankList players={players} scoreKey="score" icon="🎯" />
        </div>

        {/* Coupables podium */}
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: 1, textAlign: 'center', margin: '8px 0', color: 'var(--p)' }}>
          💀 PIRES COUPABLES
        </div>
        <PodiumSection players={players} scoreKey="caughtCount" icon="💀" />
        <div style={{ margin: '0 20px 16px' }}>
          <FullRankList players={players} scoreKey="caughtCount" icon="💀" />
        </div>

        <div style={{ padding: '0 20px 30px' }}>
          {/* Share button - navigation vers SharePage */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <button 
              className="btn btn-y" 
              style={{ width:'100%' }}
              onClick={() => navigate(`/share/${partyId}`)}
            >
              📱Partager
            </button>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Retour</button>
        </div>

      </div>
    </div>
  )
}
