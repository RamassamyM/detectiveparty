import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { showToast } from '../components/Toast'
import { logout } from '../firebase'

export default function Login() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  const user = useAuth()

  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try { await logout() } catch {}
    })()
  }, [user])

  const handleLogin = () => {
    if (!party) return
    const player = Object.values(party.players || {}).find(
      p => p.name.toLowerCase() === name.trim().toLowerCase() && p.year === year
    )
    if (!player) { showToast('❌ Prénom ou année incorrecte !', '#FF3CAC'); return }

    if (party.ended) navigate(`/podium/${partyId}`)
    else navigate(`/dashboard/${partyId}/${player.id}`)
  }

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid" />
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate(`/party/${partyId}`)}>←</button>
          <div className="screen-title">RECONNEXION</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 64, margin: '14px 0' }}>🔐</div>

        <div className="form-group">
          <label className="form-label">Ton prénom</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Sofia" autoComplete="off" />
        </div>

        <div className="form-group">
          <label className="form-label">Année de naissance</label>
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex : 1995" />
        </div>

        <button className="btn btn-p" onClick={handleLogin}>🚀 ENTRER DANS L'OPÉRATION</button>
      </div>
    </div>
  )
}
