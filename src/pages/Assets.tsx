import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Asset, AssetCategory, AssetStatus } from '../types'
import { formatCurrency, formatDate, generateId, generateNumber } from '../utils/format'

export function Assets({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const emptyForm = () => ({
    assetTag: '',
    name: '',
    category: 'equipment' as AssetCategory,
    status: 'available' as AssetStatus,
    projectId: '',
    employeeId: '',
    purchaseDate: '',
    purchaseCost: 0,
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    location: '',
    notes: '',
  })

  const [form, setForm] = useState(emptyForm())

  function openNew() {
    setEditing(null)
    setForm({
      ...emptyForm(),
      assetTag: generateNumber('AST', data.assets.length),
      purchaseDate: new Date().toISOString().split('T')[0],
    })
    setShowModal(true)
  }

  function openEdit(asset: Asset) {
    setEditing(asset)
    setForm({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      status: asset.status,
      projectId: asset.projectId ?? '',
      employeeId: asset.employeeId ?? '',
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      lastMaintenanceDate: asset.lastMaintenanceDate,
      nextMaintenanceDate: asset.nextMaintenanceDate,
      location: asset.location,
      notes: asset.notes,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    const payload = {
      assetTag: form.assetTag,
      name: form.name,
      category: form.category,
      status: form.status,
      projectId: form.projectId || null,
      employeeId: form.employeeId || null,
      purchaseDate: form.purchaseDate,
      purchaseCost: form.purchaseCost,
      lastMaintenanceDate: form.lastMaintenanceDate,
      nextMaintenanceDate: form.nextMaintenanceDate,
      location: form.location,
      notes: form.notes,
    }
    if (editing) {
      update((prev) => ({
        ...prev,
        assets: prev.assets.map((a) =>
          a.id === editing.id ? { ...a, ...payload } : a,
        ),
      }))
    } else {
      const newAsset: Asset = { id: generateId(), ...payload }
      update((prev) => ({ ...prev, assets: [...prev.assets, newAsset] }))
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this asset?')) return
    update((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== id) }))
  }

  const filtered = data.assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || asset.category === filter || asset.status === filter
    return matchesSearch && matchesFilter
  })

  const totalValue = data.assets.reduce((sum, a) => sum + a.purchaseCost, 0)
  const inUse = data.assets.filter((a) => a.status === 'in-use').length
  const maintenanceDue = data.assets.filter(
    (a) => a.nextMaintenanceDate && new Date(a.nextMaintenanceDate) <= new Date(Date.now() + 14 * 86400000),
  ).length

  return (
    <div className="page">
      <PageHeader
        title="Asset Management"
        subtitle="Track vehicles, machinery, tools, and equipment"
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            + Add Asset
          </button>
        }
      />

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Total Assets</span>
          <span className="stat-value">{data.assets.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In Use</span>
          <span className="stat-value accent-orange">{inUse}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Portfolio Value</span>
          <span className="stat-value accent-green">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {maintenanceDue > 0 && (
        <div className="alert alert-warning">
          🔧 {maintenanceDue} asset{maintenanceDue > 1 ? 's' : ''} due for maintenance within 14 days
        </div>
      )}

      <div className="toolbar toolbar-split">
        <input
          type="search"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-tabs">
          {['all', 'vehicle', 'machinery', 'tools', 'equipment', 'available', 'in-use', 'maintenance'].map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No assets found." />
      ) : (
        <div className="project-grid">
          {filtered.map((asset) => {
            const project = data.projects.find((p) => p.id === asset.projectId)
            const employee = data.employees.find((e) => e.id === asset.employeeId)
            const maintenanceSoon =
              asset.nextMaintenanceDate &&
              new Date(asset.nextMaintenanceDate) <= new Date(Date.now() + 14 * 86400000)

            return (
              <div key={asset.id} className="project-card card">
                <div className="project-card-header">
                  <div>
                    <code className="asset-tag">{asset.assetTag}</code>
                    <h3>{asset.name}</h3>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
                <p className="text-muted">{asset.category} · {formatCurrency(asset.purchaseCost)}</p>
                <p className="project-address">{asset.location}</p>
                <div className="project-meta">
                  {project && <span>Project: {project.name}</span>}
                  {employee && <span>Assigned: {employee.firstName} {employee.lastName}</span>}
                  <span>Next service: {asset.nextMaintenanceDate ? formatDate(asset.nextMaintenanceDate) : '—'}</span>
                </div>
                {maintenanceSoon && (
                  <div className="chip chip-warning">Maintenance due soon</div>
                )}
                <div className="project-card-actions">
                  <button type="button" className="btn-sm" onClick={() => openEdit(asset)}>Edit</button>
                  <button type="button" className="btn-sm btn-danger" onClick={() => handleDelete(asset.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? `Edit ${editing.assetTag}` : 'New Asset'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              Asset Tag
              <input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} />
            </label>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}>
                <option value="vehicle">Vehicle</option>
                <option value="machinery">Machinery</option>
                <option value="tools">Tools</option>
                <option value="equipment">Equipment</option>
                <option value="it">IT</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssetStatus })}>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </label>
            <label>
              Assigned Project
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">None</option>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Assigned Employee
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">None</option>
                {data.employees.filter((e) => e.status === 'active').map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </label>
            <label>
              Purchase Date
              <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            </label>
            <label>
              Purchase Cost (ZAR)
              <input type="number" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: Number(e.target.value) })} />
            </label>
            <label>
              Last Maintenance
              <input type="date" value={form.lastMaintenanceDate} onChange={(e) => setForm({ ...form, lastMaintenanceDate: e.target.value })} />
            </label>
            <label>
              Next Maintenance
              <input type="date" value={form.nextMaintenanceDate} onChange={(e) => setForm({ ...form, nextMaintenanceDate: e.target.value })} />
            </label>
            <label className="full-width">
              Location
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label className="full-width">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>Save Asset</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
