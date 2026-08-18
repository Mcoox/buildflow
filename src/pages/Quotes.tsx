import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Quote, QuoteLineItem, QuoteStatus } from '../types'
import { formatCurrency, formatDate, generateId, generateNumber, lineItemsTotal } from '../utils/format'

export function Quotes({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const emptyLineItem = (): QuoteLineItem => ({
    id: generateId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  })

  const [form, setForm] = useState({
    customerId: '',
    projectName: '',
    status: 'draft' as QuoteStatus,
    lineItems: [emptyLineItem()],
    validUntil: '',
    notes: '',
  })

  function openNew() {
    setEditing(null)
    setForm({
      customerId: data.customers[0]?.id ?? '',
      projectName: '',
      status: 'draft',
      lineItems: [emptyLineItem()],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  function openEdit(quote: Quote) {
    setEditing(quote)
    setForm({
      customerId: quote.customerId,
      projectName: quote.projectName,
      status: quote.status,
      lineItems: [...quote.lineItems],
      validUntil: quote.validUntil,
      notes: quote.notes,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.customerId || !form.projectName.trim()) return
    if (editing) {
      update((prev) => ({
        ...prev,
        quotes: prev.quotes.map((q) =>
          q.id === editing.id ? { ...q, ...form } : q,
        ),
      }))
    } else {
      const newQuote: Quote = {
        id: generateId(),
        number: generateNumber('QT', data.quotes.length),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      }
      update((prev) => ({ ...prev, quotes: [...prev.quotes, newQuote] }))
    }
    setShowModal(false)
  }

  function updateLineItem(index: number, field: keyof QuoteLineItem, value: string | number) {
    const items = [...form.lineItems]
    items[index] = { ...items[index], [field]: value }
    setForm({ ...form, lineItems: items })
  }

  function addLineItem() {
    setForm({ ...form, lineItems: [...form.lineItems, emptyLineItem()] })
  }

  function removeLineItem(index: number) {
    if (form.lineItems.length <= 1) return
    setForm({ ...form, lineItems: form.lineItems.filter((_, i) => i !== index) })
  }

  const filtered = data.quotes.filter((q) => filter === 'all' || q.status === filter)
  const total = lineItemsTotal(form.lineItems)

  return (
    <div className="page">
      <PageHeader
        title="Quotes"
        subtitle="Create and manage project estimates"
        action={<button type="button" className="btn-primary" onClick={openNew}>+ New Quote</button>}
      />

      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'draft', 'sent', 'accepted', 'rejected'].map((s) => (
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
        <EmptyState message="No quotes found." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Project</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => {
                const customer = data.customers.find((c) => c.id === quote.customerId)
                return (
                  <tr key={quote.id}>
                    <td><strong>{quote.number}</strong></td>
                    <td>{quote.projectName}</td>
                    <td>{customer?.company ?? '—'}</td>
                    <td>{formatCurrency(lineItemsTotal(quote.lineItems))}</td>
                    <td>{formatDate(quote.validUntil)}</td>
                    <td><StatusBadge status={quote.status} /></td>
                    <td className="actions-cell">
                      <button type="button" className="btn-sm" onClick={() => openEdit(quote)}>Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? `Edit ${editing.number}` : 'New Quote'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              Customer
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer...</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Project Name
              <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label>
              Valid Until
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
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
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateLineItem(i, 'quantity', Number(e.target.value))}
                className="line-qty"
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(i, 'unitPrice', Number(e.target.value))}
                className="line-price"
              />
              <span className="line-total">{formatCurrency(item.quantity * item.unitPrice)}</span>
              <button type="button" className="btn-icon" onClick={() => removeLineItem(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn-sm" onClick={addLineItem}>+ Add Line Item</button>
          <div className="quote-total">Total: <strong>{formatCurrency(total)}</strong></div>

          <label className="full-width">
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>Save Quote</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
