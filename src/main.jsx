import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Root element #root not found in index.html')
}

try {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  )
} catch (e) {
  console.error('React mount failed:', e)
  const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack || ''}` : String(e)
  rootEl.innerHTML = `<pre style="white-space:pre-wrap;padding:16px;color:#fff;background:#111;border:1px solid rgba(255,255,255,.15);border-radius:12px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${msg}</pre>`
}

if (import.meta?.env?.DEV) {
  window.addEventListener('error', (ev) => {
    console.error('[window.error]', ev.error || ev.message)
  })
  window.addEventListener('unhandledrejection', (ev) => {
    console.error('[unhandledrejection]', ev.reason)
  })
}
