import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { HR } from './pages/HR'
import { Invoices } from './pages/Invoices'
import { Projects } from './pages/Projects'
import { Quotes } from './pages/Quotes'
import { Tutorial } from './pages/Tutorial'
import { useStore } from './store/useStore'

function AppRoutes() {
  const store = useStore()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard store={store} />} />
        <Route path="customers" element={<Customers store={store} />} />
        <Route path="quotes" element={<Quotes store={store} />} />
        <Route path="invoices" element={<Invoices store={store} />} />
        <Route path="projects" element={<Projects store={store} />} />
        <Route path="hr" element={<HR store={store} />} />
        <Route path="tutorial" element={<Tutorial store={store} />} />
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
