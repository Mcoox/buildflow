import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Employee, EmployeeStatus, TimeOffRequest } from '../types'
import { formatDate, generateId } from '../utils/format'

export function HR({ store }: { store: Store }) {
  const { data, update } = store
  const [tab, setTab] = useState<'employees' | 'timeoff'>('employees')
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const [empForm, setEmpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: 'Field',
    status: 'active' as EmployeeStatus,
    hireDate: '',
    hourlyRate: 0,
    certifications: '',
  })

  const [timeOffForm, setTimeOffForm] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as TimeOffRequest['type'],
    reason: '',
  })

  function openNewEmployee() {
    setEditing(null)
    setEmpForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: 'Field',
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      hourlyRate: 0,
      certifications: '',
    })
    setShowEmployeeModal(true)
  }

  function openEditEmployee(emp: Employee) {
    setEditing(emp)
    setEmpForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department,
      status: emp.status,
      hireDate: emp.hireDate,
      hourlyRate: emp.hourlyRate,
      certifications: emp.certifications.join(', '),
    })
    setShowEmployeeModal(true)
  }

  function saveEmployee() {
    if (!empForm.firstName.trim() || !empForm.lastName.trim()) return
    const certs = empForm.certifications.split(',').map((c) => c.trim()).filter(Boolean)
    if (editing) {
      update((prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === editing.id
            ? { ...e, ...empForm, certifications: certs }
            : e,
        ),
      }))
    } else {
      const newEmp: Employee = {
        id: generateId(),
        firstName: empForm.firstName,
        lastName: empForm.lastName,
        email: empForm.email,
        phone: empForm.phone,
        role: empForm.role,
        department: empForm.department,
        status: empForm.status,
        hireDate: empForm.hireDate,
        hourlyRate: empForm.hourlyRate,
        certifications: certs,
      }
      update((prev) => ({ ...prev, employees: [...prev.employees, newEmp] }))
    }
    setShowEmployeeModal(false)
  }

  function submitTimeOff() {
    if (!timeOffForm.employeeId || !timeOffForm.startDate) return
    const request: TimeOffRequest = {
      id: generateId(),
      ...timeOffForm,
      status: 'pending',
    }
    update((prev) => ({ ...prev, timeOffRequests: [...prev.timeOffRequests, request] }))
    setShowTimeOffModal(false)
  }

  function approveTimeOff(id: string, approved: boolean) {
    update((prev) => ({
      ...prev,
      timeOffRequests: prev.timeOffRequests.map((t) =>
        t.id === id ? { ...t, status: approved ? 'approved' : 'denied' } : t,
      ),
    }))
  }

  const activeCount = data.employees.filter((e) => e.status === 'active').length
  const onLeaveCount = data.employees.filter((e) => e.status === 'on-leave').length
  const pendingCount = data.timeOffRequests.filter((t) => t.status === 'pending').length

  return (
    <div className="page">
      <PageHeader
        title="Human Resources"
        subtitle="Manage your team, roles, and time off"
        action={
          tab === 'employees'
            ? <button type="button" className="btn-primary" onClick={openNewEmployee}>+ Add Employee</button>
            : <button type="button" className="btn-primary" onClick={() => setShowTimeOffModal(true)}>+ Request Time Off</button>
        }
      />

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <span className="stat-label">Active Employees</span>
          <span className="stat-value">{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">On Leave</span>
          <span className="stat-value accent-orange">{onLeaveCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Requests</span>
          <span className="stat-value accent-yellow">{pendingCount}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button type="button" className={`filter-tab ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>
            Employees
          </button>
          <button type="button" className={`filter-tab ${tab === 'timeoff' ? 'active' : ''}`} onClick={() => setTab('timeoff')}>
            Time Off
          </button>
        </div>
      </div>

      {tab === 'employees' ? (
        data.employees.length === 0 ? (
          <EmptyState message="No employees on file." />
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Rate</th>
                  <th>Certifications</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                    <td>{emp.role}</td>
                    <td>{emp.department}</td>
                    <td>
                      <div className="contact-cell">
                        <span>{emp.email}</span>
                        <span className="text-muted">{emp.phone}</span>
                      </div>
                    </td>
                    <td>${emp.hourlyRate}/hr</td>
                    <td>
                      <div className="cert-chips">
                        {emp.certifications.map((c) => (
                          <span key={c} className="chip chip-sm">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td><StatusBadge status={emp.status} /></td>
                    <td className="actions-cell">
                      <button type="button" className="btn-sm" onClick={() => openEditEmployee(emp)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        data.timeOffRequests.length === 0 ? (
          <EmptyState message="No time-off requests." />
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.timeOffRequests.map((req) => {
                  const emp = data.employees.find((e) => e.id === req.employeeId)
                  return (
                    <tr key={req.id}>
                      <td><strong>{emp ? `${emp.firstName} ${emp.lastName}` : '—'}</strong></td>
                      <td><StatusBadge status={req.type} /></td>
                      <td>{formatDate(req.startDate)} — {formatDate(req.endDate)}</td>
                      <td>{req.reason}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td className="actions-cell">
                        {req.status === 'pending' && (
                          <>
                            <button type="button" className="btn-sm btn-success" onClick={() => approveTimeOff(req.id, true)}>Approve</button>
                            <button type="button" className="btn-sm btn-danger" onClick={() => approveTimeOff(req.id, false)}>Deny</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {showEmployeeModal && (
        <Modal title={editing ? 'Edit Employee' : 'New Employee'} onClose={() => setShowEmployeeModal(false)} wide>
          <div className="form-grid">
            <label>
              First Name
              <input value={empForm.firstName} onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })} />
            </label>
            <label>
              Last Name
              <input value={empForm.lastName} onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} />
            </label>
            <label>
              Role
              <input value={empForm.role} onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })} />
            </label>
            <label>
              Department
              <select value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}>
                <option>Field</option>
                <option>Operations</option>
                <option>Sales</option>
                <option>Human Resources</option>
                <option>Administration</option>
              </select>
            </label>
            <label>
              Hourly Rate ($)
              <input type="number" value={empForm.hourlyRate} onChange={(e) => setEmpForm({ ...empForm, hourlyRate: Number(e.target.value) })} />
            </label>
            <label>
              Hire Date
              <input type="date" value={empForm.hireDate} onChange={(e) => setEmpForm({ ...empForm, hireDate: e.target.value })} />
            </label>
            <label>
              Status
              <select value={empForm.status} onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as EmployeeStatus })}>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </label>
            <label className="full-width">
              Certifications (comma-separated)
              <input value={empForm.certifications} onChange={(e) => setEmpForm({ ...empForm, certifications: e.target.value })} placeholder="OSHA 30, Forklift Certified" />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={saveEmployee}>Save Employee</button>
          </div>
        </Modal>
      )}

      {showTimeOffModal && (
        <Modal title="Request Time Off" onClose={() => setShowTimeOffModal(false)}>
          <div className="form-grid">
            <label>
              Employee
              <select value={timeOffForm.employeeId} onChange={(e) => setTimeOffForm({ ...timeOffForm, employeeId: e.target.value })}>
                <option value="">Select employee...</option>
                {data.employees.filter((e) => e.status === 'active').map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={timeOffForm.type} onChange={(e) => setTimeOffForm({ ...timeOffForm, type: e.target.value as TimeOffRequest['type'] })}>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
              </select>
            </label>
            <label>
              Start Date
              <input type="date" value={timeOffForm.startDate} onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })} />
            </label>
            <label>
              End Date
              <input type="date" value={timeOffForm.endDate} onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })} />
            </label>
            <label className="full-width">
              Reason
              <textarea value={timeOffForm.reason} onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowTimeOffModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={submitTimeOff}>Submit Request</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
