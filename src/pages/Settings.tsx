import { useRef, useState } from 'react'
import { CompanyLogo } from '../components/CompanyLogo'
import { PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import type { Store } from '../store/useStore'
import type { Company } from '../types'
import { readLogoFile } from '../utils/logo'
import { hashPassword, validatePassword, verifyPassword } from '../utils/password'

export function Settings({ store }: { store: Store }) {
  const { data, update } = store
  const { currentUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Company>({ ...data.company })
  const [logoPreview, setLogoPreview] = useState<string | null>(data.company.logoUrl)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function updateField<K extends keyof Company>(key: K, value: Company[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const dataUrl = await readLogoFile(file)
      setLogoPreview(dataUrl)
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }))
      setSaved(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeLogo() {
    setLogoPreview(null)
    setForm((prev) => ({ ...prev, logoUrl: null }))
    setSaved(false)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.legalName.trim()) {
      setError('Company name and legal name are required.')
      return
    }
    update((prev) => ({ ...prev, company: { ...form } }))
    setError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (!currentUser) return
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    const validation = validatePassword(newPassword)
    if (validation) {
      setPwError(validation)
      return
    }

    const user = data.users.find((u) => u.id === currentUser.id)
    if (!user) return

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      setPwError('Current password is incorrect.')
      return
    }

    const passwordHash = await hashPassword(newPassword)
    update((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, passwordHash } : u,
      ),
    }))
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 3000)
  }

  const previewCompany: Company = { ...form, logoUrl: logoPreview }

  return (
    <div className="page">
      <PageHeader
        title="Company Settings"
        subtitle="Manage your business profile and branding"
      />

      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-success">Settings saved successfully.</div>}

      <form onSubmit={handleSave} className="settings-layout">
        <section className="card settings-section">
          <h2>Company Logo</h2>
          <p className="section-desc">Upload your logo for the sidebar and dashboard. PNG, JPG, WebP, or SVG — max 512 KB.</p>

          <div className="logo-upload-area">
            <div className="logo-preview-box">
              <CompanyLogo company={previewCompany} size="lg" />
            </div>
            <div className="logo-upload-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="file-input-hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="btn-primary logo-upload-btn">
                Upload Logo
              </label>
              {logoPreview && (
                <button type="button" className="btn-secondary" onClick={removeLogo}>
                  Remove Logo
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card settings-section">
          <h2>Company Details</h2>
          <p className="section-desc">These details appear on your dashboard and documents.</p>

          <div className="form-grid">
            <label>
              Display Name
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="LUSABUSISIWE"
              />
            </label>
            <label>
              Legal Name
              <input
                value={form.legalName}
                onChange={(e) => updateField('legalName', e.target.value)}
                placeholder="LUSABUSISIWE (Pty) Ltd"
              />
            </label>
            <label className="full-width">
              Tagline
              <input
                value={form.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Construction & Project Management"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </label>
            <label className="full-width">
              Website
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://www.lusabusisiwe.co.za"
              />
            </label>
            <label className="full-width">
              Physical Address
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </label>
            <label>
              Company Registration No.
              <input
                value={form.registration}
                onChange={(e) => updateField('registration', e.target.value)}
              />
            </label>
            <label>
              VAT Number
              <input
                value={form.vatNumber}
                onChange={(e) => updateField('vatNumber', e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="card settings-section">
          <h2>Change Password</h2>
          <p className="section-desc">
            Update your password for <strong>{currentUser?.username}</strong>.
          </p>
          {pwError && <div className="alert alert-error">{pwError}</div>}
          {pwSaved && <div className="alert alert-success">Password updated successfully.</div>}
          <form onSubmit={handleChangePassword}>
            <div className="form-grid">
              <label className="full-width">
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, letter + number"
                  required
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>
            <div className="settings-actions" style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Update Password</button>
            </div>
          </form>
        </section>

        <section className="card settings-section settings-preview">
          <h2>Preview</h2>
          <p className="section-desc">How your company appears on the dashboard.</p>
          <div className="company-banner company-banner-preview">
            <CompanyLogo company={previewCompany} size="lg" />
            <div className="company-banner-info">
              <h2>{form.legalName || 'Your Company Name'}</h2>
              {form.tagline && <p className="company-tagline">{form.tagline}</p>}
              <p>{form.address || 'Address not set'}</p>
              <p className="text-muted">
                {form.registration && <>Reg: {form.registration}</>}
                {form.vatNumber && <> · VAT: {form.vatNumber}</>}
                {form.email && <> · {form.email}</>}
                {form.phone && <> · {form.phone}</>}
              </p>
              {form.website && (
                <p className="text-muted">
                  <a href={form.website} target="_blank" rel="noreferrer">{form.website}</a>
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="settings-actions">
          <button type="submit" className="btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  )
}
