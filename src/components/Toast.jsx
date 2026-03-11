import { useState, useCallback, useEffect } from 'react'

let _setToast = null
export function showToast(msg, color = 'var(--g)') {
  if (_setToast) _setToast({ msg, color, key: Date.now() })
}

export default function Toast() {
  const [toast, setToast] = useState(null)
  const [visible, setVisible] = useState(false)

  _setToast = setToast

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null

  const textColor = toast.color === 'var(--g)' || toast.color === '#39FF14' ? 'var(--dk)' : '#fff'

  return (
    <div className={`toast-wrap ${visible ? 'show' : ''}`}>
      <div className="toast-inner" style={{ background: toast.color, color: textColor }}>
        {toast.msg}
      </div>
    </div>
  )
}
