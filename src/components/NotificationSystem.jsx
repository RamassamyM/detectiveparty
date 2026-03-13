import { useState, useEffect } from 'react'

// ── Notification component ────────────────────────────────
function Notification({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255,60,172,.95)',
      border: '2px solid rgba(255,60,172,.5)',
      borderRadius: 12,
      padding: '16px 20px',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      zIndex: 9999,
      minWidth: 300,
      maxWidth: '90vw',
      boxShadow: '0 8px 32px rgba(255,60,172,.3)',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{notification.title}</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {notification.message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,.2)',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ── Global notification manager ───────────────────────────
let notificationListeners = []
let notificationQueue = []

export function addNotificationListener(listener) {
  notificationListeners.push(listener)
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener)
  }
}

export function showNotification(notification) {
  notificationQueue.push(notification)
  notificationListeners.forEach(listener => listener(notification))
}

// ── Stocker les notifications dans les joueurs ───────────────────────────
export function createNotificationForPlayers(fromPlayer, toPlayer, gage) {
  return {
    // Notification pour le coupable
    target: {
      playerId: toPlayer.id,
      type: 'unmasked',
      title: '🎭 Tu as été démasqué !',
      message: `Par @${fromPlayer.name} • ${gage.a.length > 50 ? gage.a.substring(0, 47) + '...' : gage.a}`,
      at: Date.now()
    },
    // Notification pour le détective
    detective: {
      playerId: fromPlayer.id,
      type: 'unmasked_success',
      title: '🎯 Mission accomplie !',
      message: `Tu as démasqué @${toPlayer.name} !`,
      at: Date.now()
    }
  }
}

// ── Export Notification component ───────────────────────────
export { Notification }

// ── Hook for components ─────────────────────────────────
export function useNotifications(playerId, playerNotifications = []) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const listener = (notification) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }])
    }
    const unsubscribe = addNotificationListener(listener)
    return unsubscribe
  }, [])

  // Afficher les notifications stockées à la connexion (une seule fois par session)
  useEffect(() => {
    if (playerId && playerNotifications && playerNotifications.length > 0) {
      const storageKey = `dp_displayed_notifications_${playerId}`
      const displayed = JSON.parse(localStorage.getItem(storageKey) || '[]')
      
      playerNotifications.forEach(notification => {
        const notificationKey = `${notification.type}-${notification.at}`
        if (!displayed.includes(notificationKey)) {
          setNotifications(prev => [...prev, { ...notification, id: notification.at || Date.now() }])
          displayed.push(notificationKey)
        }
      })
      
      localStorage.setItem(storageKey, JSON.stringify(displayed))
    }
  }, [playerId, playerNotifications])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, removeNotification }
}

// ── CSS animation ───────────────────────────────────────
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `
  document.head.appendChild(style)
}
