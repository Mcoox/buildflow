import { PageHeader } from '../components/ui'
import { COMPANY } from '../config/company'
import type { Store } from '../store/useStore'

const TUTORIAL_SECTIONS = [
  {
    title: 'Dashboard',
    description: 'View your business overview — active projects, revenue in Rands, outstanding invoices, and quick actions.',
  },
  {
    title: 'Customers',
    description: 'Add and manage clients. Search by name or company, track leads, and link customers to projects.',
  },
  {
    title: 'Quotes',
    description: 'Create detailed estimates with line items. Track status from draft to sent to accepted.',
  },
  {
    title: 'Invoices & Billing',
    description: 'Issue invoices in ZAR, track payments, mark invoices as paid, and monitor overdue accounts.',
  },
  {
    title: 'Projects',
    description: 'Manage construction jobs with tasks, team assignments, budgets, and progress tracking.',
  },
  {
    title: 'HR',
    description: 'Maintain your employee directory, certifications, and approve or deny time-off requests.',
  },
  {
    title: 'Suppliers',
    description: 'Manage vendors, payment terms, and link suppliers to your inventory items.',
  },
  {
    title: 'Inventory',
    description: 'Track stock levels, SKUs, warehouse locations, and get low-stock alerts.',
  },
  {
    title: 'Assets',
    description: 'Register vehicles, machinery, and tools. Assign to projects and track maintenance schedules.',
  },
]

export function Tutorial({ store }: { store: Store }) {
  const { company } = store.data

  return (
    <div className="page">
      <PageHeader
        title="User Tutorial"
        subtitle={`Learn how to use ${company.name} construction management`}
      />

      <div className="tutorial-hero card">
        <div className="tutorial-video-wrap">
          <video
            controls
            preload="metadata"
            playsInline
            className="tutorial-video"
            poster="/tutorial-poster.png"
          >
            <source src="/tutorial.mp4?v=2" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="tutorial-download">
          <h2>Download Tutorial Video</h2>
          <p>Watch the step-by-step walkthrough of all {COMPANY.name} features, or download the MP4 to share with your team.</p>
          <a href="/tutorial.mp4?v=2" download="LUSABUSISIWE-BuildFlow-Tutorial.mp4" className="btn-primary tutorial-download-btn">
            ⬇️ Download MP4 Tutorial
          </a>
        </div>
      </div>

      <h2 className="section-title">What You'll Learn</h2>
      <div className="tutorial-grid">
        {TUTORIAL_SECTIONS.map((section, i) => (
          <div key={section.title} className="tutorial-card card">
            <span className="tutorial-step">{i + 1}</span>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </div>
        ))}
      </div>

      <div className="tutorial-tips card">
        <h3>Quick Tips</h3>
        <ul>
          <li>All amounts are displayed in <strong>South African Rands (ZAR)</strong></li>
          <li>Your data is saved automatically in the browser</li>
          <li>Use the sidebar to navigate between modules</li>
          <li>Click any project card to view tasks and team details</li>
          <li>Filter quotes and invoices by status using the tabs above each table</li>
        </ul>
      </div>
    </div>
  )
}
