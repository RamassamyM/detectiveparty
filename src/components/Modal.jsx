export default function Modal({ title, subtitle, onConfirm, onCancel, confirmLabel = '✅ Confirmer', confirmClass = 'btn-g' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 24, color: 'var(--y)', marginBottom: 6, letterSpacing: 1 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: 18, lineHeight: 1.5 }}>
          {subtitle}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${confirmClass}`} style={{ flex: 1, fontSize: 18, padding: 14 }} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn btn-ghost" style={{ flex: 1, fontSize: 18, padding: 14 }} onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
