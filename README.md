# BuildFlow — Construction Business Management

All-in-one platform for construction companies to manage customers, quotes, invoicing, projects, and HR.

## Features

- **Dashboard** — Business overview with revenue, active projects, and alerts
- **Customers** — CRM with contact management, status tracking, and project history
- **Quotes** — Create detailed estimates with line items and status workflow
- **Invoices & Billing** — Track payments, mark invoices paid, overdue alerts
- **Projects** — Job management with tasks, team assignment, and progress tracking
- **HR** — Employee directory, certifications, and time-off request management

## Local Development

```bash
npm install
npm run dev
```

## Data Persistence

All data is stored in browser localStorage. Sample construction company data is pre-loaded on first visit.

## Cloud Deployment

Configured for Cursor Cloud Agents via `.cursor/environment.json`. Dev server runs on port 5173.
