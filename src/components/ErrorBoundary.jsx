import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    if (import.meta?.env?.DEV) {
      console.error('[ErrorBoundary] Caught error:', error)
      console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)
    }
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error instanceof Error ? this.state.error.message : String(this.state.error)
      return (
        <div className="screen screen-bg-blue">
          <div className="bg-grid" />
          <div className="page-content" style={{ justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ fontFamily: 'Bangers,cursive', fontSize: 26, color: 'var(--p)', letterSpacing: 1, marginBottom: 10 }}>
                ❌ Erreur dans l'application
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 14, lineHeight: 1.6 }}>
                Une erreur est survenue pendant l'affichage.
                <br />
                Recharge la page. Si ça persiste, copie le texte ci-dessous et envoie-le au support.
              </div>
              <div style={{
                background: 'rgba(0,0,0,.35)',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 14,
                padding: 14,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: 12,
                color: 'rgba(255,255,255,.8)',
              }}>
                {`Route: ${window.location.pathname}${window.location.search}\n\n${msg}\n\n${this.state.error?.stack || ''}`}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
