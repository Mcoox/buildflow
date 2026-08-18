import { useState } from 'react'
import './App.css'

type BuildStatus = 'success' | 'running' | 'failed' | 'queued'

interface Build {
  id: string
  branch: string
  commit: string
  status: BuildStatus
  duration: string
  time: string
}

const initialBuilds: Build[] = [
  { id: '#142', branch: 'main', commit: 'feat: add cloud deployment', status: 'success', duration: '2m 14s', time: '2 min ago' },
  { id: '#141', branch: 'cursor/cloud-setup', commit: 'chore: configure environment', status: 'running', duration: '—', time: 'Just now' },
  { id: '#140', branch: 'main', commit: 'fix: pipeline timeout', status: 'failed', duration: '4m 02s', time: '1 hr ago' },
  { id: '#139', branch: 'develop', commit: 'test: add e2e suite', status: 'queued', duration: '—', time: '5 min ago' },
]

function StatusBadge({ status }: { status: BuildStatus }) {
  const labels: Record<BuildStatus, string> = {
    success: 'Passed',
    running: 'Running',
    failed: 'Failed',
    queued: 'Queued',
  }
  return <span className={`status status-${status}`}>{labels[status]}</span>
}

function App() {
  const [builds, setBuilds] = useState(initialBuilds)

  const triggerBuild = () => {
    const nextId = `#${143 + builds.filter((b) => b.id.startsWith('#14')).length}`
    const newBuild: Build = {
      id: nextId,
      branch: 'main',
      commit: 'manual trigger',
      status: 'running',
      duration: '—',
      time: 'Just now',
    }
    setBuilds([newBuild, ...builds])

    setTimeout(() => {
      setBuilds((current) =>
        current.map((b) =>
          b.id === nextId ? { ...b, status: 'success', duration: '1m 48s' } : b,
        ),
      )
    }, 3000)
  }

  const stats = {
    total: builds.length,
    passed: builds.filter((b) => b.status === 'success').length,
    running: builds.filter((b) => b.status === 'running').length,
    failed: builds.filter((b) => b.status === 'failed').length,
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>BuildFlow</h1>
        </div>
        <p className="tagline">CI/CD pipeline dashboard — now running in the cloud</p>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Builds</span>
        </div>
        <div className="stat-card">
          <span className="stat-value success">{stats.passed}</span>
          <span className="stat-label">Passed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value running">{stats.running}</span>
          <span className="stat-label">Running</span>
        </div>
        <div className="stat-card">
          <span className="stat-value failed">{stats.failed}</span>
          <span className="stat-label">Failed</span>
        </div>
      </section>

      <section className="actions">
        <button type="button" className="btn-primary" onClick={triggerBuild}>
          Trigger Build
        </button>
        <span className="cloud-badge">☁️ Cloud Agent</span>
      </section>

      <section className="builds">
        <h2>Recent Builds</h2>
        <div className="build-list">
          {builds.map((build) => (
            <article key={build.id} className="build-row">
              <div className="build-id">{build.id}</div>
              <div className="build-info">
                <span className="branch">{build.branch}</span>
                <span className="commit">{build.commit}</span>
              </div>
              <StatusBadge status={build.status} />
              <div className="build-meta">
                <span>{build.duration}</span>
                <span>{build.time}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>BuildFlow · Deployed on Cursor Cloud Agents</p>
      </footer>
    </div>
  )
}

export default App
