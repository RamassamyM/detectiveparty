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
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Retour</button>
          
          {/* Share buttons for podium players */}
          {(() => {
            const currentPlayer = players.find(p => p.id === localStorage.getItem('currentPlayerId'))
            const top3 = [...players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)
            const isOnPodium = currentPlayer && top3.some(p => p.id === currentPlayer.id)
            
            if (!isOnPodium) return null
            
            const rank = top3.findIndex(p => p.id === currentPlayer?.id) + 1
            const medals = ['🥇', '🥈', '🥉']
            const medal = medals[rank - 1]
            
            const shareText = `🎉 ${medal} Je suis ${rank === 1 ? 'champion' : rank === 2 ? 'vice-champion' : 'troisième'} de Detective Party ! 🕵️‍♂️ ${currentPlayer.score} démasqués ! Viens jouer avec nous sur Detective Party ! 🎭`
            const shareUrl = window.location.origin
            const hashtags = 'DetectiveParty,JeuxDeSoiree,Detective,Enquete'
            
            return (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--y)', marginBottom: 12 }}>
                  🏆 Partage ta victoire !
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
                      window.open(url, '_blank', 'width=600,height=400')
                    }}
                    style={{
                      background: '#1877f2', color: 'white', border: 'none',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    📘 Facebook
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = `https://www.instagram.com/`
                      window.open(url, '_blank')
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', 
                      color: 'white', border: 'none',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    📷 Instagram
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = `https://www.tiktok.com/`
                      window.open(url, '_blank')
                    }}
                    style={{
                      background: '#000000', color: 'white', border: 'none',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    🎵 TikTok
                  </button>
                  
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Detective Party - 🏆 Victoire !',
                          text: shareText,
                          url: shareUrl
                        })
                      } else {
                        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
                        alert('Texte copié dans le presse-papiers !')
                      }
                    }}
                    style={{
                      background: 'var(--c)', color: 'var(--dk)', border: 'none',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    📋 Copier
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 8 }}>
                  Fais découvrir Detective Party à tes amis ! 🎭
                </div>
              </div>
            )
          })()}
        </div>

      </div>
    </div>
  )
}
