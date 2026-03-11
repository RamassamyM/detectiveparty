import { useNavigate } from 'react-router-dom'
import { loginWithGoogle } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { showToast } from '../components/Toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const user = useAuth()

  useEffect(() => {
    if (user) navigate('/admin/parties')
  }, [user, navigate])

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      // redirect happens via useEffect above
    } catch (e) {
      showToast('❌ Connexion échouée : ' + e.message, '#FF3CAC')
    }
  }

  return (
    <div className="screen screen-bg-blue">
      <div className="bg-grid" />
      <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center', gap: 24 }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🕵️</div>
          <div style={{ fontFamily: 'Bangers, cursive', fontSize: 32, letterSpacing: 2, color: 'var(--c)', marginBottom: 8 }}>
            ESPACE ORGANISATEUR
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, maxWidth: 280 }}>
            Connecte-toi avec ton compte Google pour créer et gérer tes soirées Détective Party.
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <button className="btn-google" onClick={handleGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Se connecter avec Google
          </button>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={() => navigate('/')}
        >
          ← Retour
        </button>

      </div>
    </div>
  )
}
