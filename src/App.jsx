import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import BarberDetailPage from './pages/BarberDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/barbers/:id" element={<BarberDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
