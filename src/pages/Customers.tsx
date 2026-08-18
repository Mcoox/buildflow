import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Customer, CustomerStatus } from '../types'
import { formatDate, generateId } from '../utils/format'

export function Customers({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm())

  function emptyForm() {
    return { name: '', company: '', email: '', phone: '', address: '', status: 'lead' as CustomerStatus, notes: '' }
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    setForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      notes: customer.notes,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editing) {
      update((prev) => ({
        ...prev,
        customers: prev.customers.map((c) =>
          c.id === editing.id ? { ...c, ...form } : c,
        ),
      }))
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      }
      update((prev) => ({ ...prev, customers: [...prev.customers, newCustomer] }))
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this customer?')) return
    update((prev) => ({ ...prev, customers: prev.customers.filter((c) => c.id !== id) }))
  }

  const filtered = data.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  )

  const projectCount = (customerId: string) =>
    data.projects.filter((p) => p.customerId === customerId).length

  return (
    <div className="page">
      <PageHeader
        title="Customers"
        subtitle="Manage your client relationships"
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            + Add Customer
          </button>
        }
      />

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No customers found. Add your first customer to get started." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Projects</th>
                <th>Status</th>
                <th>Since</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.company}</td>
                  <td>
                    <div className="contact-cell">
                      <span>{customer.email}</span>
                      <span className="text-muted">{customer.phone}</span>
                    </div>
                  </td>
                  <td>{projectCount(customer.id)}</td>
                  <td><StatusBadge status={customer.status} /></td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td className="actions-cell">
                    <button type="button" className="btn-sm" onClick={() => openEdit(customer)}>Edit</button>
                    <button type="button" className="btn-sm btn-danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Customer' : 'New Customer'} onClose={() => setShowModal(false)}>
          <div className="form-grid">
            <label>
              Contact Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Company
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="full-width">
              Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}>
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="full-width">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
