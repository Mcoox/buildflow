import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Invoice, InvoiceStatus, QuoteLineItem } from '../types'
import { formatCurrency, formatDate, generateId, generateNumber, lineItemsTotal } from '../utils/format'

export function Invoices({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const emptyLineItem = (): QuoteLineItem => ({
    id: generateId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  })

  const [form, setForm] = useState({
    customerId: '',
    projectId: '',
    status: 'draft' as InvoiceStatus,
    lineItems: [emptyLineItem()],
    dueDate: '',
    notes: '',
  })

  function openNew() {
    setEditing(null)
    setForm({
      customerId: data.customers[0]?.id ?? '',
      projectId: '',
      status: 'draft',
      lineItems: [emptyLineItem()],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  function openEdit(invoice: Invoice) {
    setEditing(invoice)
    setForm({
      customerId: invoice.customerId,
      projectId: invoice.projectId ?? '',
      status: invoice.status,
      lineItems: [...invoice.lineItems],
      dueDate: invoice.dueDate,
      notes: invoice.notes,
    })
    setShowModal(true)
  }

  function markPaid(id: string) {
    update((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === id
          ? { ...i, status: 'paid' as InvoiceStatus, paidDate: new Date().toISOString().split('T')[0] }
          : i,
      ),
    }))
  }

  function handleSave() {
    if (!form.customerId) return
    if (editing) {
      update((prev) => ({
        ...prev,
        invoices: prev.invoices.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                customerId: form.customerId,
                projectId: form.projectId || null,
                status: form.status,
                lineItems: form.lineItems,
                dueDate: form.dueDate,
                notes: form.notes,
              }
            : i,
        ),
      }))
    } else {
      const newInvoice: Invoice = {
        id: generateId(),
        number: generateNumber('INV', data.invoices.length),
        customerId: form.customerId,
        projectId: form.projectId || null,
        quoteId: null,
        status: form.status,
        lineItems: form.lineItems,
        dueDate: form.dueDate,
        paidDate: null,
        notes: form.notes,
        createdAt: new Date().toISOString().split('T')[0],
      }
      update((prev) => ({ ...prev, invoices: [...prev.invoices, newInvoice] }))
    }
    setShowModal(false)
  }

  function updateLineItem(index: number, field: keyof QuoteLineItem, value: string | number) {
    const items = [...form.lineItems]
    items[index] = { ...items[index], [field]: value }
    setForm({ ...form, lineItems: items })
  }

  const filtered = data.invoices.filter((i) => filter === 'all' || i.status === filter)

  const totalOutstanding = data.invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)

  const totalPaid = data.invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)

  return (
    <div className="page">
      <PageHeader
        title="Invoices & Billing"
        subtitle="Track payments and outstanding balances"
        action={<button type="button" className="btn-primary" onClick={openNew}>+ New Invoice</button>}
      />

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Total Collected</span>
          <span className="stat-value accent-green">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value accent-yellow">{formatCurrency(totalOutstanding)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Invoices</span>
          <span className="stat-value">{data.invoices.length}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((s) => (
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
        <EmptyState message="No invoices found." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => {
                const customer = data.customers.find((c) => c.id === invoice.customerId)
                const project = data.projects.find((p) => p.id === invoice.projectId)
                return (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.number}</strong></td>
                    <td>{customer?.company ?? '—'}</td>
                    <td>{project?.name ?? '—'}</td>
                    <td>{formatCurrency(lineItemsTotal(invoice.lineItems))}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td className="actions-cell">
                      {invoice.status !== 'paid' && (
                        <button type="button" className="btn-sm btn-success" onClick={() => markPaid(invoice.id)}>
                          Mark Paid
                        </button>
                      )}
                      <button type="button" className="btn-sm" onClick={() => openEdit(invoice)}>Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? `Edit ${editing.number}` : 'New Invoice'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              Customer
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer...</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company}</option>
                ))}
              </select>
            </label>
            <label>
              Project (optional)
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">None</option>
                {data.projects
                  .filter((p) => p.customerId === form.customerId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label>
              Due Date
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </label>
          </div>

          <h3 className="section-title">Line Items</h3>
          {form.lineItems.map((item, i) => (
            <div key={item.id} className="line-item-row">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                className="line-desc"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(i, 'quantity', Number(e.target.value))}
                className="line-qty"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(i, 'unitPrice', Number(e.target.value))}
                className="line-price"
              />
              <span className="line-total">{formatCurrency(item.quantity * item.unitPrice)}</span>
            </div>
          ))}

          <label className="full-width">
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>Save Invoice</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
