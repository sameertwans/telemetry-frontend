import './App.css'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/home/HomePage'
import { VehiclePage } from './pages/vehicle/VehiclePage'

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/vehicles" element={<VehiclePage />} />
    </Routes>
  )
}

export default App
