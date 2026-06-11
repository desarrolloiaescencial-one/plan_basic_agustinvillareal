import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './hooks/useToast.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

import HomePage           from './pages/HomePage.jsx'
import LoginPage          from './pages/LoginPage.jsx'
import RegisterPage       from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage  from './pages/ResetPasswordPage.jsx'
import NotFoundPage       from './pages/NotFoundPage.jsx'
import AdminPage          from './pages/AdminPage.jsx'

import DashboardPage       from './dashboard/DashboardPage.jsx'
import BetsPage            from './dashboard/BetsPage.jsx'
import PartidosPage        from './dashboard/FixturePage.jsx'
import MisPrediccionesPage from './dashboard/MisPredesPage.jsx'
import ManualPage          from './dashboard/ManualPage.jsx'
import ManualUser          from './pages/ManualUser.jsx'
import RankingPageUser     from './pages/RankingPageUser.jsx'
import RankingWrapper      from './pages/RankingWrapper.jsx'
// import ApuestaManualPostMundial from './pages/ApuestaManualPostMundial.jsx'
// import ApuestaManualAdmin from './pages/ApuestaManualPostMundial.jsx'


 
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Públicas */}
            <Route path="/home"             element={<HomePage />} />
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/register"         element={<RegisterPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />
            <Route path="/"                 element={<HomePage />} />

            {/* Usuario autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"        element={<DashboardPage />} />
              <Route path="/apuestas"         element={<BetsPage />} />
              <Route path="/partidos"         element={<PartidosPage />} />
              <Route path="/mis-predicciones" element={<MisPrediccionesPage />} />
              <Route path="/manual"           element={<ManualUser />} />
              <Route path="/ranking"          element={<RankingWrapper />} />
            </Route>

            {/* Solo admin */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin"               element={<AdminPage />} />
              <Route path="/manual-admin"        element={<ManualPage />} />
              {/* <Route path="/apuesta-manual-admin" element={<ApuestaManualPostMundial />} /> */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}