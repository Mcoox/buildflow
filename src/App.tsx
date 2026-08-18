import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Assets } from './pages/Assets'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { HR } from './pages/HR'
import { Inventory } from './pages/Inventory'
import { Invoices } from './pages/Invoices'
import { Projects } from './pages/Projects'
import { Quotes } from './pages/Quotes'
import { Settings } from './pages/Settings'
import { Suppliers } from './pages/Suppliers'
import { Tutorial } from './pages/Tutorial'
import { useStore } from './store/useStore'

function AppRoutes() {
  const store = useStore()

  return (
    <Routes>
      <Route element={<Layout store={store} />}>
        <Route index element={<Dashboard store={store} />} />
        <Route path="customers" element={<Customers store={store} />} />
        <Route path="quotes" element={<Quotes store={store} />} />
        <Route path="invoices" element={<Invoices store={store} />} />
        <Route path="projects" element={<Projects store={store} />} />
        <Route path="suppliers" element={<Suppliers store={store} />} />
        <Route path="inventory" element={<Inventory store={store} />} />
        <Route path="assets" element={<Assets store={store} />} />
        <Route path="hr" element={<HR store={store} />} />
        <Route path="tutorial" element={<Tutorial store={store} />} />
        <Route path="settings" element={<Settings store={store} />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
