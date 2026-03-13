import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { dbSet } from '../firebase'
import Avatar from '../components/Avatar'
import { showToast } from '../components/Toast'
import { tsToLabel } from '../utils/time'

// ── Tab component ────────────────────────────────────────
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 16px',
        background: active ? 'rgba(255,60,172,.15)' : 'rgba(255,255,255,.04)',
        border: active ? '2px solid var(--p)' : '1px solid rgba(255,255,255,.1)',
        borderRadius: '12px 12px 0 0',
        color: active ? 'var(--p)' : 'rgba(255,255,255,.6)',
        fontSize: 14,
        fontWeight: 900,
        cursor: 'pointer',
        transition: 'all .2s',
        letterSpacing: 1,
      }}
    >
      {children}
    </button>
  )
}

// ── Gage item component ─────────────────────────────────--
function GageItem({ gage, type, partyId, playerId, party }) {
  const isReceived = type === 'received'
  const [isUpdating, setIsUpdating] = useState(false)
  const gameEnded = party?.ended
  
  const handleValidate = async () => {
    console.log('handleValidate appelé')
    if (isReceived) {
      console.log('Gage reçu, pas de validation')
      return // Seul le détective peut valider les gages envoyés
    }
    
    console.log('Début validation...')
    try {
      console.log('Avant setIsUpdating')
      setIsUpdating(true)
      console.log('Après setIsUpdating')
      console.log('Validation du gage:', { gage, partyId })
      
      // Mettre à jour le gage chez le joueur qui l'a reçu
      const targetPlayerId = gage.to?.id
      console.log('Target player ID:', targetPlayerId)
      
      if (targetPlayerId) {
        console.log('Player ID trouvé, recherche du joueur...')
        // Récupérer le joueur cible depuis Firebase pour avoir les données à jour
        const targetPlayer = party.players?.[targetPlayerId]
        console.log('Target player:', targetPlayer)
        
        if (targetPlayer) {
          console.log('Joueur trouvé, receivedGages:', targetPlayer.receivedGages)
          
          const updatedReceivedGages = targetPlayer.receivedGages?.map(rg => {
            console.log('Comparaison:', rg.at, 'avec', gage.at, 'match:', rg.at === gage.at)
            return rg.at === gage.at ? { ...rg, done: true } : rg
          })
          
          console.log('Updated received gages:', updatedReceivedGages)
          
          console.log('Appel dbSet...')
          await dbSet(`/parties/${partyId}/players/${targetPlayerId}/receivedGages`, updatedReceivedGages)
          console.log('dbSet terminé')
          
          // Mettre à jour l'UI localement
          gage.done = true
          console.log('UI mise à jour')
          showToast('✅ Gage validé !', 'var(--g)')
        } else {
          console.error('Joueur introuvable:', targetPlayerId)
          showToast('❌ Joueur introuvable', 'var(--p)')
        }
      } else {
        console.error('Target player ID manquant')
        showToast('❌ ID joueur manquant', 'var(--p)')
      }
    } catch (error) {
      console.error('Erreur validation gage:', error)
      console.error('Stack:', error.stack)
      showToast('❌ Erreur lors de la validation', 'var(--p)')
    } finally {
      console.log('Finally, setIsUpdating false')
      try {
        setIsUpdating(false)
      } catch (e) {
        console.error('Erreur setIsUpdating false:', e)
      }
    }
  }
  
  return (
    <div style={{
      background: 'var(--cd)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Avatar 
          player={isReceived ? (gage.fromPlayer || { name: gage.from, photo: null }) : { name: gage.to?.name || 'Joueur', photo: gage.to?.photo }} 
          size={32} 
          style={{ borderRadius: '50%', border: '2px solid var(--p)' }} 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {isReceived ? `Par @${gage.from}` : `À @${gage.to?.name || 'Joueur'}`}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>
            {tsToLabel(gage.at)}
          </div>
        </div>
        {!isReceived && !gage.done && !gameEnded && (
          <button
            onClick={handleValidate}
            disabled={isUpdating}
            style={{
              background:'rgba(57,255,20,.15)', border:'1px solid rgba(57,255,20,.3)',
              color:'var(--g)', borderRadius:6, padding:'4px 8px',
              fontSize:10, fontWeight:900, cursor:isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.6 : 1,
            }}
          >
            {isUpdating ? '...' : '✅ VALIDER'}
          </button>
        )}
        {!isReceived && !gage.done && gameEnded && (
          <div style={{
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 900,
            background: 'rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.5)'
          }}>
            ✅ VALIDER
          </div>
        )}
        {(isReceived || gage.done) && (
          <div style={{
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 900,
            background: gage.done ? 'rgba(57,255,20,.15)' : 'rgba(255,60,172,.15)',
            color: gage.done ? 'var(--g)' : 'var(--p)',
          }}>
            {gage.done ? '✅ FAIT' : '⏳ EN ATTENTE'}
          </div>
        )}
      </div>
      
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, lineHeight: 1.4 }}>
        ⚡ {gage.trigger || gage.gage?.trigger || gage.gage?.t}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: 'rgba(255,255,255,.9)' }}>
        👉 {gage.a || gage.gage?.a}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function GageHistory() {
  const { partyId, playerId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  const [activeTab, setActiveTab] = useState('received')

  if (!party) return <div className="screen screen-bg-purple"><div className="spinner"/></div>

  const player = party.players?.[playerId]
  if (!player) return <div className="screen screen-bg-purple"><div style={{color:'white'}}>Joueur introuvable</div></div>

  // Calculer les gages reçus
  const receivedGages = (player.receivedGages || []).map(gage => {
    // Trouver le joueur qui a envoyé le gage pour avoir sa photo
    const fromPlayer = Object.values(party.players || {}).find(p => p.id === gage.fromId)
    return {
      ...gage,
      fromPlayer: fromPlayer || { name: gage.from, photo: null }
    }
  }).sort((a, b) => b.at - a.at)

  // Calculer les gages envoyés
  const sentGages = []
  Object.values(party.players || {}).forEach(otherPlayer => {
    if (otherPlayer.id !== playerId) {
      const otherReceivedGages = otherPlayer.receivedGages || []
      otherReceivedGages.forEach(gage => {
        if (gage.fromId === playerId) {
          sentGages.push({
            ...gage,
            to: {
              id: otherPlayer.id,
              name: otherPlayer.name,
              photo: otherPlayer.photo
            },
            at: gage.at,
            trigger: gage.gage?.trigger || gage.gage?.t,
            a: gage.gage?.a,
            done: gage.done
          })
        }
      })
    }
  })
  sentGages.sort((a, b) => b.at - a.at)

  return (
    <div className="screen screen-bg-purple">
      <div className="bg-grid"/>
      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'18px 20px 12px', display:'flex', alignItems:'center', gap:12 }}>
          <button
            className="back-btn"
            style={{ flexShrink:0 }}
            onClick={() => navigate(`/dashboard/${partyId}/${playerId}`)}
          >←</button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Bangers,cursive', fontSize:20, letterSpacing:1 }}>
              MES GAGES
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>
              {party.name}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ margin:'0 20px', display:'flex', gap:4 }}>
          <Tab active={activeTab === 'received'} onClick={() => setActiveTab('received')}>
            🎭 REÇUS ({receivedGages.length})
          </Tab>
          <Tab active={activeTab === 'sent'} onClick={() => setActiveTab('sent')}>
            🎯 ENVOYÉS ({sentGages.length})
          </Tab>
        </div>

        {/* Content */}
        <div style={{ margin:'0 20px 20px', background:'var(--cd)', borderRadius:'0 12px 12px 12px', padding:'16px', minHeight:'60vh' }}>
          {activeTab === 'received' && (
            <div>
              {receivedGages.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(255,255,255,.45)' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🎭</div>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Aucun gage reçu</div>
                  <div style={{ fontSize:13 }}>Tu n'as pas encore été démasqué !</div>
                </div>
              ) : (
                receivedGages.map((gage, i) => (
                  <GageItem key={i} gage={gage} type="received" partyId={partyId} playerId={playerId} party={party} />
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {sentGages.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(255,255,255,.45)' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Aucun gage envoyé</div>
                  <div style={{ fontSize:13 }}>Commence à démasquer des joueurs !</div>
                </div>
              ) : (
                sentGages.map((gage, i) => (
                  <GageItem key={i} gage={gage} type="sent" partyId={partyId} playerId={playerId} party={party} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
