import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CompanyLogo } from '../components/CompanyLogo'
import { useAuth } from '../context/AuthContext'
import type { Store } from '../store/useStore'

export function Login({ store }: { store: Store }) {
  const { login, currentUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (currentUser) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(username, password)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <CompanyLogo company={store.data.company} size="lg" />
          <h1>{store.data.company.name}</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          Default admin: <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  )
}
