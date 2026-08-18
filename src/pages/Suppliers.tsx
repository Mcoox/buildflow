import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Supplier, SupplierCategory, SupplierStatus } from '../types'
import { generateId } from '../utils/format'

export function Suppliers({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const emptyForm = () => ({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    category: 'materials' as SupplierCategory,
    status: 'active' as SupplierStatus,
    paymentTerms: 'Net 30',
    notes: '',
  })

  const [form, setForm] = useState(emptyForm())

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setForm({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      status: supplier.status,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editing) {
      update((prev) => ({
        ...prev,
        suppliers: prev.suppliers.map((s) =>
          s.id === editing.id ? { ...s, ...form } : s,
        ),
      }))
    } else {
      const newSupplier: Supplier = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      }
      update((prev) => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }))
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this supplier?')) return
    update((prev) => ({ ...prev, suppliers: prev.suppliers.filter((s) => s.id !== id) }))
  }

  const inventoryCount = (supplierId: string) =>
    data.inventory.filter((i) => i.supplierId === supplierId).length

  const filtered = data.suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.category === filter || s.status === filter
    return matchesSearch && matchesFilter
  })

  const activeCount = data.suppliers.filter((s) => s.status === 'active').length

  return (
    <div className="page">
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendors and procurement partners"
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            + Add Supplier
          </button>
        }
      />

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Total Suppliers</span>
          <span className="stat-value">{data.suppliers.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value accent-green">{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Inventory Items Linked</span>
          <span className="stat-value">{data.inventory.length}</span>
        </div>
      </div>

      <div className="toolbar toolbar-split">
        <input
          type="search"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-tabs">
          {['all', 'materials', 'equipment', 'services', 'subcontractor', 'active'].map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No suppliers found." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Payment Terms</th>
                <th>Items</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <strong>{supplier.name}</strong>
                    <div className="text-muted">{supplier.address}</div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <span>{supplier.contactName}</span>
                      <span className="text-muted">{supplier.email}</span>
                      <span className="text-muted">{supplier.phone}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={supplier.category} /></td>
                  <td>{supplier.paymentTerms}</td>
                  <td>{inventoryCount(supplier.id)}</td>
                  <td><StatusBadge status={supplier.status} /></td>
                  <td className="actions-cell">
                    <button type="button" className="btn-sm" onClick={() => openEdit(supplier)}>Edit</button>
                    <button type="button" className="btn-sm btn-danger" onClick={() => handleDelete(supplier.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Supplier' : 'New Supplier'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              Company Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Contact Person
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SupplierCategory })}>
                <option value="materials">Materials</option>
                <option value="equipment">Equipment</option>
                <option value="services">Services</option>
                <option value="subcontractor">Subcontractor</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SupplierStatus })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label>
              Payment Terms
              <input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
            </label>
            <label className="full-width">
              Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="full-width">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
