import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AddAdminForm from './pages/AddAdminForm.jsx';
import PaymentConfirmation from './pages/PaymentConfirmation.jsx';
import AddAppointmentForm from './pages/AddAppointmentForm.jsx';
import AppointmentDashboard from './pages/AppointmentDashboard.jsx';
import PaymentDashboard from './pages/PaymentDashboard.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import ServiceDashboard from './pages/ServiceDashboard.jsx';
import AddServiceForm from './pages/AddServiceForm.jsx';
import ContactDashboard from './pages/ContactDashboard.jsx';
import Login from './pages/Login.jsx';
import TopNav from './components/TopNav.jsx';
import './styles/app.css';

export default function App() {
	const location = useLocation();
	const { isAuthenticated } = useAuth();
	const hideTopNav = location.pathname === '/login';

	return (
		<div className="app-shell">
			{!hideTopNav && <TopNav />}
			<main className="app-main">
				<AnimatePresence mode="wait">
					<Routes>
						<Route
							path="/login"
							element={isAuthenticated ? <Navigate to="/service-dashboard" replace /> : <Login />}
						/>
						<Route
							path="/"
							element={
								<ProtectedRoute requireAdmin>
									<ServiceDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/service-dashboard"
							element={
								<ProtectedRoute requireAdmin>
									<ServiceDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/ServiceDashboard"
							element={
								<ProtectedRoute requireAdmin>
									<ServiceDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/add-service/:id?"
							element={
								<ProtectedRoute requireAdmin>
									<AddServiceForm />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/add-admin"
							element={
								<ProtectedRoute requireAdmin>
									<AddAdminForm />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/payment-confirm"
							element={
								<ProtectedRoute requireAdmin>
									<PaymentConfirmation />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/add-appointment"
							element={
								<ProtectedRoute requireAdmin>
									<AddAppointmentForm />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/appointments"
							element={
								<ProtectedRoute requireAdmin>
									<AppointmentDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/payments"
							element={
								<ProtectedRoute requireAdmin>
									<PaymentDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/clients"
							element={
								<ProtectedRoute requireAdmin>
									<ClientDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/contacts"
							element={
								<ProtectedRoute requireAdmin>
									<ContactDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/employees"
							element={
								<ProtectedRoute requireAdmin>
									<EmployeeDashboard />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</AnimatePresence>
			</main>
		</div>
	);
}


