import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useParty } from '../hooks/useParty'
import { useAuth } from '../hooks/useAuth'
import { dbSet } from '../firebase'
import { ROLES } from '../data/roles'
import { GAGES } from '../data/gages'
import { showToast } from '../components/Toast'
import { logout } from '../firebase'

const AVATARS = Array.from({ length: 18 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return `/avatars/${n}.png`
})

function compressPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const out = 200
        const s = Math.min(img.width, img.height)
        canvas.width = out; canvas.height = out
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, out, out)
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
  const [askCode, setAskCode] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [avatarMode, setAvatarMode] = useState('bank')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [noAvatarsLeft, setNoAvatarsLeft] = useState(false)
  const [nameSuggestion, setNameSuggestion] = useState('')

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
    setSelectedAvatar(null)
    setNoAvatarsLeft(false)
  }

  const selectAvatar = (src) => {
    setSelectedAvatar(src)
    setPhoto(src)
  }

  const computeNameSuggestion = (baseName, players) => {
    const base = (baseName || '').trim()
    if (!base) return ''
    const existingLower = new Set(
      Object.values(players || {})
        .map(p => (p?.name || '').trim().toLowerCase())
        .filter(Boolean)
    )
    if (!existingLower.has(base.toLowerCase())) return ''
    let i = 2
    while (existingLower.has(`${base} ${i}`.toLowerCase())) i++
    return `${base} ${i}`
  }

  const doRegister = async () => {
    if (!party) return
    const players = party.players || {}
    const trimmed = name.trim()
    if (!trimmed) return
    const existingLower = new Set(Object.values(players).map(p => (p?.name || '').trim().toLowerCase()).filter(Boolean))
    if (existingLower.has(trimmed.toLowerCase())) {
      showToast('⚠️ Ce prénom est déjà pris !', '#FF6B00')
      return
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
      id, name: trimmed, year, photo,
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

  const handleRegister = () => {
    if (!name.trim()) { showToast('⚠️ Entre ton prénom !', '#FF6B00'); return }
    if (!year || year.length !== 4) { showToast('⚠️ Entre ton année de naissance !', '#FF6B00'); return }
    if (!photo) { showToast('⚠️ Choisis un avatar ou ajoute une photo', '#FF6B00'); return }
    if (!party) return
    const suggestion = computeNameSuggestion(name, party.players || {})
    if (suggestion) {
      setNameSuggestion(suggestion)
      showToast('⚠️ Prénom déjà pris : choisis-en un autre ou accepte la suggestion', '#FF6B00')
      return
    }
    setCodeInput('')
    setAskCode(true)
  }

  const confirmCode = async () => {
    if (!party) return
    const code = codeInput.trim().toUpperCase()
    if (!code) { showToast('⚠️ Entre le code de la soirée', '#FF6B00'); return }
    if (code !== party.code) { showToast('❌ Code incorrect !', '#FF3CAC'); return }
    setAskCode(false)
    await doRegister()
  }

  const players = party?.players ? Object.values(party.players) : []
  const takenPhotos = new Set(players.map(p => p.photo).filter(Boolean))
  const availableAvatars = AVATARS.filter(src => !takenPhotos.has(src))
  const canSubmit = Boolean(name.trim()) && String(year).length === 4 && Boolean(photo) && !loading

  useEffect(() => {
    if (!party) { setNameSuggestion(''); return }
    const suggestion = computeNameSuggestion(name, party.players || {})
    setNameSuggestion(suggestion)
  }, [party, name])

  useEffect(() => {
    if (!party) return
    if (avatarMode !== 'bank') return
    const noneLeft = availableAvatars.length === 0
    setNoAvatarsLeft(noneLeft)
    if (noneLeft) {
      setAvatarMode('upload')
      setSelectedAvatar(null)
    }
  }, [party, avatarMode, availableAvatars.length])

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
          {nameSuggestion && (
            <div style={{ marginTop: 10, background: 'rgba(255,230,0,.06)', border: '1px solid rgba(255,230,0,.25)', borderRadius: 14, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,230,0,.9)', letterSpacing: 1, marginBottom: 6 }}>
                Prénom déjà pris
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.4, marginBottom: 10 }}>
                Suggestion disponible : <strong>{nameSuggestion}</strong>
              </div>
              <button
                type="button"
                className="btn btn-y"
                style={{ width: '100%', padding: '12px 0', fontSize: 13, color: 'var(--dk)' }}
                onClick={() => setName(nameSuggestion)}
              >
                Utiliser "{nameSuggestion}"
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Année de naissance
            <span style={{ color: 'rgba(255,255,255,.28)', fontSize: 10, marginLeft: 6 }}>(code de reconnexion)</span>
          </label>
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex : 1995" min="1940" max="2010" />
        </div>

        <div className="form-group">
          <label className="form-label">Avatar d'agent 🕵️</label>

          <div className="avatar-mode">
            <button
              type="button"
              className={`avatar-mode-btn ${avatarMode === 'bank' ? 'active' : ''}`}
              onClick={() => setAvatarMode('bank')}
              disabled={noAvatarsLeft}
            >🎭 Choisir</button>
            <button
              type="button"
              className={`avatar-mode-btn ${avatarMode === 'upload' ? 'active' : ''}`}
              onClick={() => setAvatarMode('upload')}
            >📸 Uploader</button>
          </div>

          {noAvatarsLeft && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 10, lineHeight: 1.5 }}>
              Tous les avatars prédéfinis sont déjà pris. Ajoute une photo pour continuer.
            </div>
          )}

          {avatarMode === 'bank' ? (
            <div className="avatar-bank-scroll">
              {AVATARS.map((src, i) => {
                const taken = takenPhotos.has(src)
                const selected = selectedAvatar === src
                return (
                  <button
                    key={i}
                    type="button"
                    className={`avatar-tile ${selected ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                    onClick={() => !taken && selectAvatar(src)}
                    disabled={taken}
                    aria-label={`Avatar ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              <label htmlFor="photoInput">
                <div className={`photo-area ${photo ? 'has-photo' : ''}`}>
                  {photo ? (
                    <div className="photo-preview-wrap">
                      <img src={photo} alt="preview" className="photo-preview" />
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 44 }}>🤳</div>
                      <p>Clique pour prendre ou choisir une photo</p>
                    </>
                  )}
                </div>
              </label>
              <input id="photoInput" type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display: 'none' }} />
            </>
          )}
        </div>

        <button className="btn btn-p" onClick={handleRegister} disabled={!canSubmit}>
          {loading ? '⏳ Inscription...' : '🕵️ REJOINDRE L\'OPÉRATION !'}
        </button>

        {askCode && (
          <div className="modal-overlay" onClick={() => setAskCode(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 24, color: 'var(--y)', marginBottom: 6, letterSpacing: 1 }}>
                🔐 Code d'accès
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 14, lineHeight: 1.5 }}>
                Entre le code de la soirée <strong>{party?.name}</strong> pour rejoindre l'opération.
              </div>
              <input
                className="form-input"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                placeholder="Ex : AB12"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn btn-g" style={{ flex: 1, fontSize: 18, padding: 14, color:'var(--dk)' }} onClick={confirmCode}>
                  ✅ Valider
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 18, padding: 14 }} onClick={() => setAskCode(false)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}
