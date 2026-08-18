import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { InventoryCategory, InventoryItem } from '../types'
import { formatCurrency, generateId } from '../utils/format'

export function Inventory({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const emptyForm = () => ({
    sku: '',
    name: '',
    category: 'other' as InventoryCategory,
    supplierId: data.suppliers[0]?.id ?? '',
    quantity: 0,
    unit: 'units',
    reorderLevel: 10,
    unitCost: 0,
    location: '',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [form, setForm] = useState(emptyForm())

  function stockStatus(item: InventoryItem) {
    return item.quantity <= item.reorderLevel ? 'low' : 'ok'
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  function openEdit(item: InventoryItem) {
    setEditing(item)
    setForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      supplierId: item.supplierId,
      quantity: item.quantity,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      location: item.location,
      lastRestocked: item.lastRestocked,
      notes: item.notes,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.sku.trim()) return
    if (editing) {
      update((prev) => ({
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.id === editing.id ? { ...i, ...form } : i,
        ),
      }))
    } else {
      const newItem: InventoryItem = {
        id: generateId(),
        ...form,
      }
      update((prev) => ({ ...prev, inventory: [...prev.inventory, newItem] }))
    }
    setShowModal(false)
  }

  function adjustStock(id: string, delta: number) {
    update((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
      ),
    }))
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this inventory item?')) return
    update((prev) => ({ ...prev, inventory: prev.inventory.filter((i) => i.id !== id) }))
  }

  const filtered = data.inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      item.category === filter ||
      (filter === 'low' && stockStatus(item) === 'low')
    return matchesSearch && matchesFilter
  })

  const lowStock = data.inventory.filter((i) => stockStatus(i) === 'low').length
  const totalValue = data.inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)

  return (
    <div className="page">
      <PageHeader
        title="Inventory"
        subtitle="Track materials, stock levels, and warehouse locations"
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            + Add Item
          </button>
        }
      />

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Total SKUs</span>
          <span className="stat-value">{data.inventory.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Alerts</span>
          <span className="stat-value accent-yellow">{lowStock}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stock Value</span>
          <span className="stat-value accent-green">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="alert alert-warning">
          ⚠️ {lowStock} item{lowStock > 1 ? 's' : ''} below reorder level — review stock below
        </div>
      )}

      <div className="toolbar toolbar-split">
        <input
          type="search"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-tabs">
          {['all', 'low', 'cement', 'steel', 'timber', 'electrical', 'safety'].map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'low' ? 'Low Stock' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No inventory items found." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item</th>
                <th>Supplier</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Value</th>
                <th>Location</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const supplier = data.suppliers.find((s) => s.id === item.supplierId)
                return (
                  <tr key={item.id} className={stockStatus(item) === 'low' ? 'row-warning' : ''}>
                    <td><code>{item.sku}</code></td>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="text-muted">{item.category}</div>
                    </td>
                    <td>{supplier?.name ?? '—'}</td>
                    <td>
                      <div className="qty-controls">
                        <button type="button" className="btn-icon" onClick={() => adjustStock(item.id, -1)}>−</button>
                        <span>{item.quantity} {item.unit}</span>
                        <button type="button" className="btn-icon" onClick={() => adjustStock(item.id, 1)}>+</button>
                      </div>
                    </td>
                    <td>{formatCurrency(item.unitCost)}</td>
                    <td>{formatCurrency(item.quantity * item.unitCost)}</td>
                    <td className="text-muted">{item.location}</td>
                    <td><StatusBadge status={stockStatus(item)} /></td>
                    <td className="actions-cell">
                      <button type="button" className="btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button type="button" className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Inventory Item' : 'New Inventory Item'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              SKU
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </label>
            <label>
              Item Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as InventoryCategory })}>
                <option value="cement">Cement</option>
                <option value="steel">Steel</option>
                <option value="timber">Timber</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="safety">Safety</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Supplier
              <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Select supplier...</option>
                {data.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </label>
            <label>
              Unit
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="bags, rolls, units" />
            </label>
            <label>
              Reorder Level
              <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </label>
            <label>
              Unit Cost (ZAR)
              <input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
            </label>
            <label>
              Last Restocked
              <input type="date" value={form.lastRestocked} onChange={(e) => setForm({ ...form, lastRestocked: e.target.value })} />
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
            <button type="button" className="btn-primary" onClick={handleSave}>Save Item</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
