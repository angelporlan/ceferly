import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Categories } from './pages/Categories'
import { ExercisesList } from './pages/ExercisesList'
import { ExercisePlayer } from './pages/ExercisePlayer'
import { ResultsPage } from './pages/ResultsPage'
import { Shop } from './pages/Shop'
import { Leaderboard } from './pages/Leaderboard'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { PaymentSuccess } from './pages/PaymentSuccess'
import { PaymentCancel } from './pages/PaymentCancel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth standalone pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Immersive Exercise Player */}
        <Route path="/exercises/:id" element={<ExercisePlayer />} />

        {/* Main Application Layout pages */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/learn" replace />} />
          <Route path="/learn" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:subcategoryId/exercises" element={<ExercisesList />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
