import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import type { Store } from '../store/useStore'
import type { AppUser, UserRole, UserStatus } from '../types'
import { formatDate, generateId } from '../utils/format'
import { hashPassword, validatePassword } from '../utils/password'

export function Users({ store }: { store: Store }) {
  const { data, update } = store
  const { currentUser, isAdmin } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState<AppUser | null>(null)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const emptyForm = () => ({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'staff' as UserRole,
    status: 'active' as UserStatus,
    newPassword: '',
  })

  const [form, setForm] = useState(emptyForm())

  if (!isAdmin) {
    return (
      <div className="page">
        <PageHeader title="User Management" subtitle="Administrator access required" />
        <EmptyState message="You do not have permission to manage users." />
      </div>
    )
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setError('')
    setShowModal(true)
  }

  function openEdit(user: AppUser) {
    setEditing(user)
    setForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      newPassword: '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    setError('')
    if (!form.username.trim() || !form.firstName.trim()) {
      setError('Username and first name are required.')
      return
    }

    const duplicate = data.users.find(
      (u) => u.username.toLowerCase() === form.username.toLowerCase() && u.id !== editing?.id,
    )
    if (duplicate) {
      setError('Username already exists.')
      return
    }

    if (editing) {
      update((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === editing.id
            ? {
                ...u,
                username: form.username,
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                role: form.role,
                status: form.status,
              }
            : u,
        ),
      }))
      setShowModal(false)
      return
    }

    if (!form.newPassword) {
      setError('Password is required for new users.')
      return
    }
    const pwError = validatePassword(form.newPassword)
    if (pwError) {
      setError(pwError)
      return
    }

    const passwordHash = await hashPassword(form.newPassword)
    const newUser: AppUser = {
      id: generateId(),
      username: form.username,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      status: form.status,
      passwordHash,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    }
    update((prev) => ({ ...prev, users: [...prev.users, newUser] }))
    setShowModal(false)
  }

  async function handleResetPassword() {
    setError('')
    if (!showPasswordModal) return
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const pwError = validatePassword(password)
    if (pwError) {
      setError(pwError)
      return
    }

    const passwordHash = await hashPassword(password)
    update((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === showPasswordModal.id ? { ...u, passwordHash } : u,
      ),
    }))
    setShowPasswordModal(null)
    setPassword('')
    setConfirmPassword('')
  }

  function handleDelete(user: AppUser) {
    if (user.id === currentUser?.id) {
      setError('You cannot delete your own account.')
      return
    }
    if (!confirm(`Delete user ${user.username}?`)) return
    update((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== user.id) }))
  }

  const activeCount = data.users.filter((u) => u.status === 'active').length

  return (
    <div className="page">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and passwords"
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            + Add User
          </button>
        }
      />

      {error && !showModal && !showPasswordModal && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{data.users.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value accent-green">{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Administrators</span>
          <span className="stat-value">{data.users.filter((u) => u.role === 'admin').length}</span>
        </div>
      </div>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.firstName} {user.lastName}</strong></td>
                <td><code>{user.username}</code></td>
                <td>{user.email}</td>
                <td><StatusBadge status={user.role} /></td>
                <td><StatusBadge status={user.status} /></td>
                <td>{user.lastLogin ? formatDate(user.lastLogin.split('T')[0]) : 'Never'}</td>
                <td className="actions-cell">
                  <button type="button" className="btn-sm" onClick={() => openEdit(user)}>Edit</button>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => {
                      setError('')
                      setPassword('')
                      setConfirmPassword('')
                      setShowPasswordModal(user)
                    }}
                  >
                    Reset Password
                  </button>
                  {user.id !== currentUser?.id && (
                    <button type="button" className="btn-sm btn-danger" onClick={() => handleDelete(user)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit User' : 'New User'} onClose={() => setShowModal(false)} wide>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <label>
              Username
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              First Name
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label>
              Last Name
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            {!editing && (
              <label className="full-width">
                Password
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Min 8 chars, letter + number"
                />
              </label>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal
          title={`Reset Password — ${showPasswordModal.username}`}
          onClose={() => setShowPasswordModal(null)}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <label className="full-width">
              New Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, letter + number"
              />
            </label>
            <label className="full-width">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleResetPassword}>Update Password</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
