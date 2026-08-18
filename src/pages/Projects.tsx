import { useState } from 'react'
import { EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import type { Store } from '../store/useStore'
import type { Project, ProjectStatus, ProjectTask } from '../types'
import { formatCurrency, formatDate, generateId } from '../utils/format'

export function Projects({ store }: { store: Store }) {
  const { data, update } = store
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState<Project | null>(null)
  const [editing, setEditing] = useState<Project | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [newTask, setNewTask] = useState('')

  const [form, setForm] = useState({
    name: '',
    customerId: '',
    status: 'planning' as ProjectStatus,
    address: '',
    budget: 0,
    startDate: '',
    endDate: '',
    description: '',
    teamIds: [] as string[],
  })

  function openNew() {
    setEditing(null)
    setForm({
      name: '',
      customerId: data.customers[0]?.id ?? '',
      status: 'planning',
      address: '',
      budget: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
      teamIds: [],
    })
    setShowModal(true)
  }

  function openEdit(project: Project) {
    setEditing(project)
    setForm({
      name: project.name,
      customerId: project.customerId,
      status: project.status,
      address: project.address,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description,
      teamIds: [...project.teamIds],
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.customerId) return
    if (editing) {
      update((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === editing.id ? { ...p, ...form } : p,
        ),
      }))
    } else {
      const newProject: Project = {
        id: generateId(),
        ...form,
        tasks: [],
      }
      update((prev) => ({ ...prev, projects: [...prev.projects, newProject] }))
    }
    setShowModal(false)
  }

  function toggleTask(projectId: string, taskId: string) {
    update((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : p,
      ),
    }))
    if (showDetail) {
      const updated = data.projects.find((p) => p.id === projectId)
      if (updated) {
        setShowDetail({
          ...updated,
          tasks: updated.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        })
      }
    }
  }

  function addTask(projectId: string) {
    if (!newTask.trim()) return
    const task: ProjectTask = {
      id: generateId(),
      title: newTask,
      assigneeId: null,
      completed: false,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    }
    update((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p,
      ),
    }))
    setNewTask('')
    if (showDetail) {
      setShowDetail({ ...showDetail, tasks: [...showDetail.tasks, task] })
    }
  }

  function toggleTeamMember(employeeId: string) {
    setForm((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(employeeId)
        ? prev.teamIds.filter((id) => id !== employeeId)
        : [...prev.teamIds, employeeId],
    }))
  }

  const filtered = data.projects.filter((p) => filter === 'all' || p.status === filter)

  return (
    <div className="page">
      <PageHeader
        title="Projects"
        subtitle="Manage construction jobs and timelines"
        action={<button type="button" className="btn-primary" onClick={openNew}>+ New Project</button>}
      />

      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'planning', 'in-progress', 'on-hold', 'completed'].map((s) => (
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
        <EmptyState message="No projects found." />
      ) : (
        <div className="project-grid">
          {filtered.map((project) => {
            const customer = data.customers.find((c) => c.id === project.customerId)
            const completedTasks = project.tasks.filter((t) => t.completed).length
            const progress = project.tasks.length
              ? Math.round((completedTasks / project.tasks.length) * 100)
              : 0

            return (
              <div key={project.id} className="project-card card" onClick={() => setShowDetail(project)}>
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-muted">{customer?.company}</p>
                <p className="project-address">{project.address}</p>
                <div className="project-meta">
                  <span>Budget: {formatCurrency(project.budget)}</span>
                  <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                </div>
                {project.tasks.length > 0 && (
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                    <span className="progress-label">{completedTasks}/{project.tasks.length} tasks</span>
                  </div>
                )}
                <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="btn-sm" onClick={() => openEdit(project)}>Edit</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showDetail && (
        <Modal title={showDetail.name} onClose={() => setShowDetail(null)} wide>
          <div className="project-detail">
            <div className="detail-row">
              <StatusBadge status={showDetail.status} />
              <span>Budget: <strong>{formatCurrency(showDetail.budget)}</strong></span>
            </div>
            <p>{showDetail.description}</p>
            <p className="text-muted">{showDetail.address}</p>

            <h3 className="section-title">Team</h3>
            <div className="team-chips">
              {showDetail.teamIds.map((id) => {
                const emp = data.employees.find((e) => e.id === id)
                return emp ? (
                  <span key={id} className="chip">{emp.firstName} {emp.lastName} — {emp.role}</span>
                ) : null
              })}
              {showDetail.teamIds.length === 0 && <span className="text-muted">No team assigned</span>}
            </div>

            <h3 className="section-title">Tasks</h3>
            <ul className="task-list">
              {showDetail.tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(showDetail.id, task.id)}
                    />
                    {task.title}
                  </label>
                  <span className="text-muted">Due {formatDate(task.dueDate)}</span>
                </li>
              ))}
            </ul>
            <div className="add-task-row">
              <input
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask(showDetail.id)}
              />
              <button type="button" className="btn-sm" onClick={() => addTask(showDetail.id)}>Add</button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)} wide>
          <div className="form-grid">
            <label>
              Project Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Customer
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label>
              Budget (ZAR)
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            </label>
            <label>
              Start Date
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label>
              End Date
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </label>
            <label className="full-width">
              Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="full-width">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </label>
          </div>

          <h3 className="section-title">Assign Team</h3>
          <div className="team-select">
            {data.employees.filter((e) => e.status === 'active').map((emp) => (
              <label key={emp.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.teamIds.includes(emp.id)}
                  onChange={() => toggleTeamMember(emp.id)}
                />
                {emp.firstName} {emp.lastName} — {emp.role}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave}>Save Project</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
