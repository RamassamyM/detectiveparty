import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import Avatar from '../components/Avatar'
import { ROLES } from '../data/roles'

export default function SharePage() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  const [shareType, setShareType] = useState(null)

  if (!party) return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"/>
      </div>
    </div>
  )

  const players = Object.values(party.players || {})
  
  const dpSession = localStorage.getItem('dp_session')
  const currentPlayerId = dpSession ? JSON.parse(dpSession).playerId : null

  const handleShare = (type) => {
    setShareType(type)
  }

  const getShareText = (type) => {
    const dpSession = localStorage.getItem('dp_session')
  const currentPlayerId = dpSession ? JSON.parse(dpSession).playerId : null
  const currentPlayer = players.find(p => p.id === currentPlayerId)
    const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
    const rank = rankedPlayers.findIndex(p => p.id === currentPlayer?.id) + 1
    const totalPlayers = players.length
    
    switch (type) {
      case 'podium':
        if (rank <= 3) {
          const medals = ['🥇', '🥈', '🥉']
          const titles = ['CHAMPION', 'VICE-CHAMPION', 'TROISIÈME']
          const medal = medals[rank - 1]
          const title = titles[rank - 1]
          const playerRole = ROLES[currentPlayer.roleIndex % ROLES.length]
          const playerName = currentPlayerId ? currentPlayer.name : playerRole.n
          return `🏆 ${title} !\n\n${playerName} est ${rank === 1 ? 'champion' : rank === 2 ? 'vice-champion' : 'troisième'} de Detective Party !\n🕵️‍♂️ ${currentPlayer?.score || 0} démasqués (${currentPlayer?.score || 0} pts) sur ${totalPlayers} joueurs\n\nC'était une soirée incroyable ! 🎭\nViens jouer avec nous !`
        } else {
          const playerRole = ROLES[currentPlayer.roleIndex % ROLES.length]
          const playerName = currentPlayerId ? currentPlayer.name : playerRole.n
          return `🎭 DÉTECTIVE PARTY !\n\n${playerName} a participé à une soirée détective mémorable !\n🕵️‍♂️ ${currentPlayer?.score || 0} démasqués (${currentPlayer?.score || 0} pts) sur ${totalPlayers} joueurs\n\nRejoins l'aventure ! 🎭`
        }
        
      case 'ranking':
        const playerRole = ROLES[currentPlayer.roleIndex % ROLES.length]
        const playerName = currentPlayerId ? currentPlayer.name : playerRole.n
        const title = currentPlayerId ? 'MON' : 'LE'
        return `🏆 ${title} CLASSEMENT !\n\n${playerName} termine ${rank}${rank === 1 ? 'er' : 'ème'} sur ${totalPlayers} joueurs !\n🕵️‍♂️ ${currentPlayer?.score || 0} démasqués (${currentPlayer?.score || 0} pts)\n\nSoirée mémorable ! 🎭\nViens tenter ta chance !`
        
      case 'game':
        return `� Je viens de jouer à Detective Party !\n\nÀ votre tour d'essayer !\nRendez vos soirées hyper fun ! 🎭\n\n🕵️‍♂️ Enquêtes palpitantes\n🎭 Gages hilarants  \n🎯 Soirées inoubliables\n\n🚀 Prêt à devenir détective ?\nRejoignez l'aventure et créez des souvenirs !\n\n🎭 Detective Party - L'ultime jeu de soirée !`
        
      default:
        return ''
    }
  }

  const handleSocialShare = (social) => {
    const shareText = getShareText(shareType)
    const shareUrl = window.location.origin
    
    switch (social) {
      case 'facebook':
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
        window.open(url, '_blank', 'width=600,height=400')
        break
        
      case 'instagram':
      case 'tiktok':
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert(`Texte copié pour ${social === 'instagram' ? 'Instagram' : 'TikTok'} !`)
        break
        
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: `Detective Party - ${shareType === 'podium' ? '🏆' : shareType === 'ranking' ? '📊' : '🎭'}`,
            text: shareText,
            url: shareUrl
          })
        } else {
          navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
          alert('Texte copié dans le presse-papiers !')
        }
        break
    }
    
    navigate(`/podium/${partyId}`)
  }

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div className="page-content">

        {/* Header */}
        <div className="screen-header">
          <button className="back-btn" onClick={() => {
            if (shareType) {
              setShareType(null)
            } else {
              // Revenir à la page précédente dans l'historique
              navigate(-1)
            }
          }}>
            ←
          </button>
          <div className="screen-title">
            {!shareType ? '📱 Partager' : '📱 Réseaux sociaux'}
          </div>
        </div>

        {!shareType ? (
          // Étape 1 : Choix du type de partage
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,.8)', marginBottom: 8 }}>
                Que veux-tu partager ?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
                Choisis ce que tu veux partager :
              </div>
            </div>

            {/* Share Options */}
            <div style={{ display: 'grid', gap: 16 }}>
              <button
                onClick={() => handleShare('podium')}
                className="btn btn-y"
                style={{
                  padding: '20px', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  borderRadius: 16, border: '2px solid var(--y)', boxShadow: '0 4px 15px rgba(255,230,0,.2)'
                }}
              >
                🏆 {currentPlayerId ? 'Mon' : 'Le'} podium
              </button>
              
              <button
                onClick={() => handleShare('ranking')}
                className="btn btn-c"
                style={{
                  padding: '20px', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  borderRadius: 16, border: '2px solid var(--c)', boxShadow: '0 4px 15px rgba(0,245,255,.2)'
                }}
              >
                🏆 {currentPlayerId ? 'Mon' : 'Le'} classement
              </button>
              
              <button
                onClick={() => handleShare('game')}
                className="btn btn-p"
                style={{
                  padding: '20px', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  borderRadius: 16, border: '2px solid var(--p)', boxShadow: '0 4px 15px rgba(255,60,172,.2)'
                }}
              >
                🎭 Le jeu
              </button>
            </div>
          </>
        ) : (
          // Étape 2 : Choix du réseau social avec aperçu
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,.8)', marginBottom: 8 }}>
                Où veux-tu partager ?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
                Choisis ton réseau social :
              </div>
            </div>

            {/* Aperçu du contenu à partager */}
            <div style={{
              background: 'var(--cd)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16, padding: 20, marginBottom: 24
            }}>
              {shareType === 'podium' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ 
                      fontFamily: 'Bangers, cursive', fontSize: 32, letterSpacing: 2,
                      background: 'linear-gradient(135deg,var(--y),var(--p))',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      marginBottom: 8
                    }}>
                      🏆 RÉSULTATS FINAUX !
                    </div>
                    <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                      {party.name}
                    </div>
                  </div>
                  
                  {/* Podium stylé */}
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: 1, textAlign: 'center', margin: '16px 0 8px', color: 'var(--c)' }}>
                    🔍 MEILLEURS DÉTECTIVES
                  </div>
                  {(() => {
                    const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)
                    const MEDALS = ['🥇','🥈','🥉']
                    
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
                    
                    return rankedPlayers.map((p, i) => {
                      const isCurrentPlayer = p.id === currentPlayerId
                      const role = ROLES[p.roleIndex % ROLES.length] || ROLES[0]
                      return (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                          marginBottom: 10, borderRadius: 16,
                          background: isCurrentPlayer 
                            ? 'rgba(255,60,172,.15)' 
                            : `rgba(0,245,255,.06)`,
                          border: isCurrentPlayer 
                            ? '3px solid var(--p)' 
                            : 'rgba(0,245,255,.18)',
                          boxShadow: isCurrentPlayer 
                            ? '0 0 25px rgba(255,60,172,.4), inset 0 0 20px rgba(255,60,172,.1)' 
                            : 'none',
                          transform: isCurrentPlayer ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          animation: isCurrentPlayer ? 'borderFlashRose 2s infinite' : 'none',
                          position: 'relative'
                        }}>
                          <div style={{ fontFamily: 'Bangers, cursive', fontSize: 32, width: 40, textAlign: 'center' }}>
                            {MEDALS[i]}
                          </div>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar 
                              player={p} 
                              size={44}
                              style={{
                                border: isCurrentPlayer ? '3px solid var(--p)' : '2px solid rgba(255,255,255,.12)',
                                boxShadow: isCurrentPlayer ? '0 0 15px rgba(255,60,172,.5)' : 'none'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 900, fontSize: 16, 
                              color: isCurrentPlayer ? 'var(--p)' : 'rgba(255,255,255,.8)',
                              textShadow: isCurrentPlayer ? '0 0 10px rgba(255,60,172,.5)' : 'none'
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
                              fontSize: 12, 
                              color: isCurrentPlayer ? 'var(--p)' : 'rgba(255,255,255,.4)',
                              fontWeight: isCurrentPlayer ? 700 : 400,
                              marginTop: 2
                            }}>
                              {isConnected ? `${role.n} • ${p.score || 0} démasqués` : `${p.score || 0} démasqués`}
                            </div>
                          </div>
                          <div style={{ 
                            fontFamily: 'Bangers, cursive', fontSize: 24, 
                            color: 'var(--y)',
                            textShadow: isCurrentPlayer ? '0 0 10px rgba(255,60,172,.5)' : 'none'
                          }}>
                            {p.score || 0} pts
                          </div>
                        </div>
                      )
                    })
                  })()}
                  
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.5)', fontStyle: 'italic', marginTop: 16 }}>
                    🎭 Detective Party - Soirée détective inoubliable !
                  </div>
                  
                  {/* Bouton d'app */}
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, var(--y), var(--p))',
                        color: 'var(--dk)', border: 'none',
                        borderRadius: 12, padding: '12px 20px',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        margin: '0 auto', boxShadow: '0 4px 15px rgba(255,230,0,.3)',
                        textDecoration: 'none'
                      }}
                    >
                      🌐 Découvrir l'app
                    </a>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>
                      Application web - Jouez directement ! 🎮
                    </div>
                  </div>
                </>
              )}
              
              {shareType === 'ranking' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ 
                      fontFamily: 'Bangers, cursive', fontSize: 32, letterSpacing: 2,
                      background: 'linear-gradient(135deg,var(--c),var(--y))',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      marginBottom: 8
                    }}>
                      🏆 {currentPlayerId ? 'MON' : 'LE'} CLASSEMENT
                    </div>
                    <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                      {party.name}
                    </div>
                  </div>
                  
                  {/* Classement stylé */}
                  {(() => {
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
                    
                    const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
                    const MEDALS = ['🥇','🥈','🥉']
                    
                    return rankedPlayers.slice(0, 5).map((p, index) => {
                      const isCurrentPlayer = p.id === currentPlayerId
                      const score = p.score || 0
                      const role = ROLES[p.roleIndex % ROLES.length] || ROLES[0]
                      return (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                          marginBottom: 10, borderRadius: 16,
                          background: isCurrentPlayer 
                            ? 'rgba(255,60,172,.15)' 
                            : index < 3 
                              ? `rgba(0,245,255,.06)` 
                              : 'var(--cd)',
                          border: isCurrentPlayer 
                            ? '3px solid var(--p)' 
                            : `1px solid ${index < 3 ? 'rgba(0,245,255,.18)' : 'rgba(255,255,255,.06)'}`,
                          boxShadow: isCurrentPlayer 
                            ? '0 0 25px rgba(255,60,172,.4), inset 0 0 20px rgba(255,60,172,.1)' 
                            : 'none',
                          transform: isCurrentPlayer ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          animation: isCurrentPlayer ? 'borderFlashRose 2s infinite' : 'none',
                          position: 'relative'
                        }}>
                          <div style={{ fontFamily: 'Bangers, cursive', fontSize: 32, width: 40, textAlign: 'center' }}>
                            {MEDALS[index] || <span style={{ color: 'rgba(255,255,255,.3)' }}>{index + 1}</span>}
                          </div>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar 
                              player={p} 
                              size={44}
                              style={{
                                border: isCurrentPlayer ? '3px solid var(--p)' : '2px solid rgba(255,255,255,.12)',
                                boxShadow: isCurrentPlayer ? '0 0 15px rgba(255,60,172,.5)' : 'none'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 900, fontSize: 16, 
                              color: isCurrentPlayer ? 'var(--p)' : 'rgba(255,255,255,.8)',
                              textShadow: isCurrentPlayer ? '0 0 10px rgba(255,60,172,.5)' : 'none'
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
                              fontSize: 12, 
                              color: isCurrentPlayer ? 'var(--p)' : 'rgba(255,255,255,.4)',
                              fontWeight: isCurrentPlayer ? 700 : 400,
                              marginTop: 2
                            }}>
                              {isConnected ? `${role.n} • ${score} démasqués` : `${score} démasqués`}
                            </div>
                          </div>
                          {index < 3 && (
                            <div style={{ 
                              fontFamily: 'Bangers, cursive', fontSize: 24, 
                              color: 'var(--y)',
                              textShadow: isCurrentPlayer ? '0 0 10px rgba(255,60,172,.5)' : 'none'
                            }}>
                              {score} pts
                            </div>
                          )}
                        </div>
                      )
                    })
                  })()}
                  
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.5)', fontStyle: 'italic', marginTop: 16 }}>
                    🎭 Detective Party - Rejoins l'enquête !
                  </div>
                  
                  {/* Bouton d'app */}
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, var(--y), var(--p))',
                        color: 'var(--dk)', border: 'none',
                        borderRadius: 12, padding: '12px 20px',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        margin: '0 auto', boxShadow: '0 4px 15px rgba(255,230,0,.3)',
                        textDecoration: 'none'
                      }}
                    >
                      🌐 Découvrir l'app
                    </a>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>
                      Application web - Jouez directement ! 🎮
                    </div>
                  </div>
                </>
              )}
              
              {shareType === 'game' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontFamily: 'Bangers, cursive', fontSize: 32, letterSpacing: 2,
                    background: 'linear-gradient(135deg,var(--p),var(--y))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    marginBottom: 16
                  }}>
                    🎭 DETECTIVE PARTY
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginBottom: 20 }}>
                    {party.name}
                  </div>
                  
                  {/* Message principal stylé */}
                  <div style={{
                    background: 'rgba(255,60,172,.08)', border: '1px solid rgba(255,60,172,.2)',
                    borderRadius: 12, padding: 16, marginBottom: 20
                  }}>
                    <div style={{ fontSize: 18, color: 'var(--p)', fontWeight: 700, marginBottom: 8 }}>
                      🎉 Je viens de jouer à Detective Party !
                    </div>
                    <div style={{ fontSize: 16, color: 'rgba(255,255,255,.8)', lineHeight: 1.4 }}>
                      À votre tour d'essayer !<br/>
                      Rendez vos soirées hyper fun ! 🎭
                    </div>
                  </div>
                  
                  {/* Points forts avec icônes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                      <div style={{ fontSize: 24, color: 'var(--y)' }}>🕵️‍♂️</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--y)' }}>Enquêtes</span> palpitantes
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                      <div style={{ fontSize: 24, color: 'var(--c)' }}>🎭</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--c)' }}>Gages</span> hilarants
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                      <div style={{ fontSize: 24, color: 'var(--p)' }}>🎯</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--p)' }}>Soirées</span> inoubliables
                      </div>
                    </div>
                  </div>
                  
                  {/* Call-to-action percutant */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,230,0,.1), rgba(255,60,172,.1))',
                    border: '1px solid rgba(255,230,0,.2)',
                    borderRadius: 12, padding: 16, marginBottom: 20
                  }}>
                    <div style={{ fontSize: 16, color: 'var(--y)', fontWeight: 700, marginBottom: 4 }}>
                      🚀 Prêt à devenir détective ?
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>
                      Rejoignez l'aventure et créez des souvenirs !
                    </div>
                  </div>
                  
                  {/* Émojis thématiques */}
                  <div style={{ 
                    display: 'flex', justifyContent: 'center', gap: 8, 
                    fontSize: 20, marginBottom: 16
                  }}>
                    🕵️‍♂️ 🔍 🎭 🎯 🏆 🎉 🚀
                  </div>
                  
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontStyle: 'italic', marginBottom: 20 }}>
                    🎭 Detective Party - L'ultime jeu de soirée !
                  </div>
                  
                  {/* Bouton d'app */}
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, var(--y), var(--p))',
                        color: 'var(--dk)', border: 'none',
                        borderRadius: 12, padding: '12px 20px',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        margin: '0 auto', boxShadow: '0 4px 15px rgba(255,230,0,.3)',
                        textDecoration: 'none'
                      }}
                    >
                      🌐 Découvrir l'app
                    </a>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>
                      Application web - Jouez directement ! 🎮
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                onClick={() => handleSocialShare('facebook')}
                style={{
                  background: 'linear-gradient(45deg, #1877f2, #0e5fcc)', color: 'white', border: 'none',
                  borderRadius: 16, padding: '20px',
                  fontSize: 18, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: '0 4px 15px rgba(24, 119, 242, 0.3)'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                </svg>
                Facebook
              </button>
              
              <button
                onClick={() => handleSocialShare('instagram')}
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', 
                  color: 'white', border: 'none',
                  borderRadius: 16, padding: '20px',
                  fontSize: 18, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                </svg>
                Instagram
              </button>
              
              <button
                onClick={() => handleSocialShare('tiktok')}
                style={{
                  background: 'linear-gradient(45deg, #FF0050, #00F2EA)', color: 'white', border: 'none',
                  borderRadius: 16, padding: '20px',
                  fontSize: 18, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: '0 4px 15px rgba(255, 0, 80, 0.4)'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                </svg>
                TikTok
              </button>
              
              <button
                onClick={() => handleSocialShare('native')}
                style={{
                  background: 'linear-gradient(45deg, var(--c), #00b8d4)', color: 'var(--dk)', border: 'none',
                  borderRadius: 16, padding: '20px',
                  fontSize: 18, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: '0 4px 15px rgba(0, 245, 255, 0.3)'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copier
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
