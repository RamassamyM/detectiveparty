import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { dbSet } from '../firebase'
import { ROLES } from '../data/roles'
import { GAGES } from '../data/gages'
import { showToast } from '../components/Toast'
import { logout } from '../firebase'

function compressPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const s = Math.min(200, img.width, img.height)
        canvas.width = s; canvas.height = s
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, s, s)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Register() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const party = useParty(partyId)
  const user = useAuth()

  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try { await logout() } catch {}
    })()
  }, [user])

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressPhoto(file)
    setPhoto(compressed)
  }

  const handleRegister = async () => {
    if (!name.trim()) { showToast('⚠️ Entre ton prénom !', '#FF6B00'); return }
    if (!year || year.length !== 4) { showToast('⚠️ Entre ton année de naissance !', '#FF6B00'); return }
    if (!party) return

    // Ask for party code
    const code = prompt(`🔐 Entre le code de la soirée "${party.name}" :`)
    if (!code) return
    if (code.toUpperCase() !== party.code) { showToast('❌ Code incorrect !', '#FF3CAC'); return }

    const players = party.players || {}
    if (Object.values(players).find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      showToast('⚠️ Ce prénom est déjà pris !', '#FF6B00'); return
    }

    setLoading(true)

    // Assign role
    const usedRoles = Object.values(players).map(p => p.roleIndex)
    const freeRoles = ROLES.map((_, i) => i).filter(i => !usedRoles.includes(i))
    const roleIndex = freeRoles.length > 0
      ? freeRoles[Math.floor(Math.random() * freeRoles.length)]
      : Math.floor(Math.random() * ROLES.length)

    // Assign gages (no duplicates)
    const enabled = party.enabledGages || []
    const usedG = Object.values(players).flatMap(p => (p.gageIndices || []).filter(g => typeof g === 'number'))
    const freeG = enabled.filter(i => !usedG.includes(i)).sort(() => Math.random() - .5)
    const missions = party.missions || 2

    const gageIndices = freeG.slice(0, missions).concat(Array(missions).fill(null)).slice(0, missions)

    const id = Date.now().toString()
    const player = {
      id, name: name.trim(), year, photo,
      roleIndex, gageIndices, customGages: [],
      unmaskedIds: [], caughtCount: 0, score: 0,
    }

    try {
      await dbSet(`/parties/${partyId}/players/${id}`, player)
      showToast('🎉 Bienvenue dans l\'opération !')
      navigate(`/dashboard/${partyId}/${id}`)
    } catch (e) {
      showToast('❌ Erreur : ' + e.message, '#FF3CAC')
    }
    setLoading(false)
  }

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid" />
      <div className="page-content">

        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate(`/party/${partyId}`)}>←</button>
          <div className="screen-title">TON DOSSIER SECRET</div>
        </div>

        <div className="form-group">
          <label className="form-label">Ton prénom</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Sofia" autoComplete="off" />
        </div>

        <div className="form-group">
          <label className="form-label">
            Année de naissance
            <span style={{ color: 'rgba(255,255,255,.28)', fontSize: 10, marginLeft: 6 }}>(code de reconnexion)</span>
          </label>
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex : 1995" min="1940" max="2010" />
        </div>

        <div className="form-group">
          <label className="form-label">Photo d'agent 📸</label>
          <label htmlFor="photoInput">
            <div className={`photo-area ${photo ? 'has-photo' : ''}`}>
              {photo ? (
                <img src={photo} alt="preview" className="photo-preview" />
              ) : (
                <>
                  <div style={{ fontSize: 44 }}>🤳</div>
                  <p>Clique pour prendre ou choisir une photo</p>
                </>
              )}
            </div>
          </label>
          <input id="photoInput" type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        <button className="btn btn-p" onClick={handleRegister} disabled={loading}>
          {loading ? '⏳ Inscription...' : '🕵️ REJOINDRE L\'OPÉRATION !'}
        </button>

        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}
