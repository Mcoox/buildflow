export type CustomerStatus = 'active' | 'lead' | 'inactive'

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  status: CustomerStatus
  notes: string
  createdAt: string
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface QuoteLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Quote {
  id: string
  number: string
  customerId: string
  projectName: string
  status: QuoteStatus
  lineItems: QuoteLineItem[]
  validUntil: string
  notes: string
  createdAt: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  number: string
  customerId: string
  projectId: string | null
  quoteId: string | null
  status: InvoiceStatus
  lineItems: QuoteLineItem[]
  dueDate: string
  paidDate: string | null
  notes: string
  createdAt: string
}

export type ProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'

export interface ProjectTask {
  id: string
  title: string
  assigneeId: string | null
  completed: boolean
  dueDate: string
}

export interface Project {
  id: string
  name: string
  customerId: string
  status: ProjectStatus
  address: string
  budget: number
  startDate: string
  endDate: string
  description: string
  tasks: ProjectTask[]
  teamIds: string[]
}

export type EmployeeStatus = 'active' | 'on-leave' | 'terminated'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  department: string
  status: EmployeeStatus
  hireDate: string
  hourlyRate: number
  certifications: string[]
}

export interface TimeOffRequest {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  type: 'vacation' | 'sick' | 'personal'
  status: 'pending' | 'approved' | 'denied'
  reason: string
}

export interface Company {
  name: string
  legalName: string
  email: string
  phone: string
  address: string
  registration: string
  vatNumber: string
}

export interface AppData {
  company: Company
  customers: Customer[]
  quotes: Quote[]
  invoices: Invoice[]
  projects: Project[]
  employees: Employee[]
  timeOffRequests: TimeOffRequest[]
}
