import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#000010',
          color: '#ff4444', fontFamily: 'monospace',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', gap: '1rem',
        }}>
          <div style={{ color: '#4488ff', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
            RENDER ERROR
          </div>
          <pre style={{ fontSize: '0.75rem', maxWidth: '700px', whiteSpace: 'pre-wrap', opacity: 0.8 }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'none',
              border: '1px solid #4488ff', color: '#4488ff', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
