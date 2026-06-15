import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import { extractPaginated } from '../utils/pagination';
import { useModal } from '../context/ModalContext';
import '../assets/css/PaymentConfirmation.css';

export default function PaymentConfirmation() {
	const navigate = useNavigate();
	const { alert } = useModal();
	const [clients, setClients] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [selectedClientId, setSelectedClientId] = useState('');
	const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
	const [appointmentServices, setAppointmentServices] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [amount, setAmount] = useState('');
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchClients();
	}, []);

	useEffect(() => {
		if (selectedClientId) {
			fetchClientAppointments();
		} else {
			setAppointments([]);
			setSelectedAppointmentId('');
		}
	}, [selectedClientId]);

	useEffect(() => {
		if (selectedAppointmentId) {
			fetchAppointmentServices();
		} else {
			setAppointmentServices([]);
			setTotalPrice(0);
		}
	}, [selectedAppointmentId]);

	const fetchClients = async () => {
		try {
			const response = await adminAPI.getClients();
			const { data } = extractPaginated(response.data);
			setClients(data);
		} catch (err) {
			setError('Failed to load clients');
			console.error('Error fetching clients:', err);
		}
	};

	const fetchClientAppointments = async () => {
		try {
			setFetching(true);
			setError('');
			// Fetch appointments directly from the appointments API for this client
			const response = await adminAPI.getClientAppointments(selectedClientId);
			const allAppointments = response.data || [];
			
			// Filter appointments that are pending or confirmed
			const pendingAppointments = allAppointments.filter(
				(apt) => apt.status === 'pending' || apt.status === 'confirmed'
			);
			setAppointments(pendingAppointments);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load appointments');
			console.error('Error fetching appointments:', err);
			setAppointments([]);
		} finally {
			setFetching(false);
		}
	};

	const fetchAppointmentServices = async () => {
		try {
			setFetching(true);
			const response = await adminAPI.getAppointmentServices(selectedAppointmentId);
			const services = response.data.services || [];
			setAppointmentServices(services);

			// Calculate total (if services have prices, otherwise use amount input)
			const calculatedTotal = services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0);
			setTotalPrice(calculatedTotal);
			if (!amount) {
				setAmount(calculatedTotal.toString());
			}
		} catch (err) {
			setError('Failed to load appointment services');
			console.error('Error fetching appointment services:', err);
		} finally {
			setFetching(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!selectedAppointmentId) {
			setError('Please select an appointment');
			return;
		}

		if (!amount || parseFloat(amount) <= 0) {
			setError('Please enter a valid amount');
			return;
		}

		setLoading(true);

		try {
			const response = await adminAPI.createPayment({
				appointment_id: parseInt(selectedAppointmentId),
				amount: parseFloat(amount),
				method: 'online',
			});

			const payment = response.data?.data ?? response.data;
			await alert(`Payment created successfully! Payment link: ${payment.payment_link}`, 'Success', 'success');
			navigate('/payments');
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create payment');
			console.error('Error creating payment:', err);
		} finally {
			setLoading(false);
		}
	};

	const selectedClient = clients.find((c) => c.id === parseInt(selectedClientId));
	const selectedAppointment = appointments.find((a) => a.id === parseInt(selectedAppointmentId));

	return (
		<div className="page page-centered">
			<SideNav />
			<motion.section
				className="card page-card container confirmation-wrapper"
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				style={{width: 'fit-content'}}
			>
				<div className="confirmation-container">
					<h2 className="page-title">Confirm Payment</h2>
					<p className="page-subtitle">Payment Confirmation</p>

					{error && (
						<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="form-grid">
							<div className="form-row">
								<label className="label">Client Name</label>
								<select
									className="select"
									value={selectedClientId}
									onChange={(e) => setSelectedClientId(e.target.value)}
									required
									disabled={loading || fetching}
								>
									<option value="">Select Client</option>
									{clients.map((client) => (
										<option key={client.id} value={client.id}>
											{client.name} ({client.email})
										</option>
									))}
								</select>
							</div>

							{selectedClientId && (
								<div className="form-row">
									<label className="label">Appointment</label>
									<select
										className="select"
										value={selectedAppointmentId}
										onChange={(e) => setSelectedAppointmentId(e.target.value)}
										required
										disabled={loading || fetching || appointments.length === 0}
									>
										<option value="">Select Appointment</option>
										{appointments.map((appointment) => (
											<option key={appointment.id} value={appointment.id}>
												{appointment.appointment_slot?.date} {appointment.appointment_slot?.time} -{' '}
												{appointment.status}
											</option>
										))}
									</select>
								</div>
							)}

							{selectedAppointmentId && appointmentServices.length > 0 && (
								<div className="form-row">
									<label className="label">Services</label>
									<div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
										{appointmentServices.map((service, index) => (
											<div key={index} style={{ marginBottom: 8 }}>
												<strong>{service.name}</strong>
												{service.price && <span style={{ float: 'right' }}>${service.price}</span>}
											</div>
										))}
									</div>
								</div>
							)}

							<div className="form-row">
								<label className="label">Total Price</label>
								<input
									className="input"
									type="number"
									step="0.01"
									min="0"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder={totalPrice > 0 ? `Suggested: $${totalPrice}` : 'Enter amount'}
									required
									disabled={loading}
								/>
							</div>
						</div>

						<div className="actions">
							<button type="submit" className="btn" disabled={loading || fetching || !selectedAppointmentId}>
								{loading ? 'Creating Payment...' : 'Confirm Payment'}
							</button>
							<button type="button" className="btn secondary" onClick={() => navigate(-1)} disabled={loading}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</motion.section>
		</div>
	);
}
