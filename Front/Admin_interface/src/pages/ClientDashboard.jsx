import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiActivity, FiHash, FiX, FiDollarSign, FiCalendar, FiUser, FiMail, FiPhone, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import { extractPaginated } from '../utils/pagination';
import { useModal } from '../context/ModalContext';
import '../assets/css/ClientDashboard.css';

export default function ClientDashboard() {
	const { alert, confirm } = useModal();
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedClient, setSelectedClient] = useState(null);
	const [clientDetails, setClientDetails] = useState(null);
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [stats, setStats] = useState({
		totalClients: 0,
		totalAppointments: 0,
		completedAppointments: 0,
	});

	useEffect(() => {
		fetchClients(page);
	}, [page]);

	const fetchClients = async (pageNum = 1) => {
		try {
			setLoading(true);
			setError('');
			const response = await adminAPI.getClients({ page: pageNum, per_page: 25 });
			const { data: clientsData, meta: pageMeta } = extractPaginated(response.data);
			setClients(clientsData);
			setMeta(pageMeta);

			const totalClients = pageMeta?.total ?? clientsData.length;
			const totalAppointments = clientsData.reduce((sum, client) => sum + (client.appointments_count || 0), 0);

			setStats({
				totalClients,
				totalAppointments,
				completedAppointments: 0,
			});
		} catch (err) {
			setError(err.response?.data?.message || 'There are no clients yet');
			console.error('Error fetching clients:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleView = async (clientId) => {
		try {
			setLoadingDetails(true);
			setSelectedClient(clientId);
			
			// Fetch full client details (includes payments)
			const clientResponse = await adminAPI.getClient(clientId);
			const clientData = clientResponse.data;
			
			// Fetch client appointments
			const appointmentsResponse = await adminAPI.getClientAppointments(clientId);
			const appointments = appointmentsResponse.data || [];
			
			// Extract payments from client data and filter pending ones
			const allPayments = clientData.payments || [];
			const pendingPayments = allPayments.filter(payment => 
				payment.status === 'pending' || payment.status === 'unpaid' || payment.status === 'failed'
			);
			
			setClientDetails({
				...clientData,
				appointments,
				allPayments,
				pendingPayments,
			});
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to load client details', 'Error', 'error');
			console.error('Error fetching client details:', err);
			setSelectedClient(null);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleCloseModal = () => {
		setSelectedClient(null);
		setClientDetails(null);
	};

	const handleDelete = async (id) => {
		const confirmed = await confirm(
			'Are you sure you want to delete this client?',
			'Delete Client',
			'warning'
		);
		if (!confirmed) {
			return;
		}

		try {
			await adminAPI.deleteClient(id);
			fetchClients(); // Refresh list
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to delete client', 'Error', 'error');
			console.error('Error deleting client:', err);
		}
	};

	if (loading) {
		return (
			<div className="page">
				<SideNav />
				<div style={{ padding: '40px', textAlign: 'center' }}>Loading clients...</div>
			</div>
		);
	}

	return (
		<div className="page">
			<SideNav />
			<motion.section
				className="container"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
			>
				<div className="client-header">
					<h2 className="page-title" style={{ fontSize: 40 }}>Client Dashboard</h2>
					<p className="page-subtitle">Overview of client activity and appointments</p>
				</div>
				{error && (
					<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}
				<div className="metrics-grid">
					<div className="metric-card">
						<div className="metric-icon success">
							<FiCheckCircle />
						</div>
						<div className="metric-body">
							<h4>Total Clients</h4>
							<div className="progress">
								<div className="bar success" style={{ width: `${Math.min((stats.totalClients / 100) * 100, 100)}%` }} />
							</div>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.totalClients}</p>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon warning">
							<FiActivity />
						</div>
						<div className="metric-body">
							<h4>Total Appointments</h4>
							<div className="progress">
								<div className="bar warning" style={{ width: `${Math.min((stats.totalAppointments / 200) * 100, 100)}%` }} />
							</div>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.totalAppointments}</p>
						</div>
					</div>
					<div className="metric-card highlight">
						<div className="metric-icon highlight">
							<FiHash />
						</div>
						<div className="metric-body">
							<h4>Completed Appointments</h4>
							<p className="metric-value">{stats.completedAppointments}</p>
						</div>
					</div>
				</div>

				<div className="card page-card">
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Total Appointments</th>
								<th>Total Spent</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{clients.length === 0 ? (
								<tr>
									<td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
										No clients found
									</td>
								</tr>
							) : (
								clients.map((client) => (
									<tr key={client.id}>
										<td>{client.name}</td>
										<td>{client.email}</td>
										<td>{client.phone || 'N/A'}</td>
										<td>{client.appointments_count || 0}</td>
										<td>${client.statistics?.total_spent || 0}</td>
										<td>
											<button 
												className="btn" 
												style={{ padding: '6px 10px' }}
												onClick={() => handleView(client.id)}
											>
												View
											</button>
											<button
												className="btn secondary"
												style={{ padding: '6px 10px', marginLeft: 8 }}
												onClick={() => handleDelete(client.id)}
											>
												Delete
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
					{meta && meta.last_page > 1 && (
						<div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
							<button type="button" className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
							<span>Page {meta.current_page} of {meta.last_page}</span>
							<button type="button" className="btn secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
						</div>
					)}
				</div>
			</motion.section>

			{/* Client Details Modal */}
			<AnimatePresence>
				{selectedClient && (
					<div 
						className="modal-overlay" 
						onClick={handleCloseModal}
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0, 0, 0, 0.6)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 1000,
							padding: '20px',
						}}
					>
						<motion.div
							className="card"
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.2 }}
							onClick={(e) => e.stopPropagation()}
							style={{
								maxWidth: '800px',
								width: '100%',
								maxHeight: '90vh',
								overflowY: 'auto',
								position: 'relative',
							}}
						>
							{loadingDetails ? (
								<div style={{ padding: '40px', textAlign: 'center' }}>Loading client details...</div>
							) : clientDetails ? (
								<>
									<button
										onClick={handleCloseModal}
										style={{
											position: 'absolute',
											top: '16px',
											right: '16px',
											background: 'transparent',
											border: 'none',
											fontSize: '24px',
											cursor: 'pointer',
											color: '#666',
											padding: '4px 8px',
										}}
									>
										<FiX />
									</button>

									<div style={{ padding: '24px' }}>
										<h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#19435B' }}>
											Client Details
										</h2>

										{/* Pending Payments Alert */}
										{clientDetails.pendingPayments && clientDetails.pendingPayments.length > 0 && (
											<div
												style={{
													background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
													color: 'white',
													padding: '16px 20px',
													borderRadius: '12px',
													marginBottom: '24px',
													display: 'flex',
													alignItems: 'center',
													gap: '12px',
													boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
												}}
											>
												<FiAlertCircle size={24} />
												<div style={{ flex: 1 }}>
													<strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
														Pending Payments Alert!
													</strong>
													<div style={{ fontSize: '14px', opacity: 0.95 }}>
														{clientDetails.pendingPayments.length} pending payment{clientDetails.pendingPayments.length > 1 ? 's' : ''} 
														{' '}totaling ${clientDetails.pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
													</div>
												</div>
											</div>
										)}

										{/* Client Information */}
										<div style={{ marginBottom: '24px' }}>
											<h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#19435B', display: 'flex', alignItems: 'center', gap: '8px' }}>
												<FiUser /> Personal Information
											</h3>
											<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
												<div>
													<label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Name</label>
													<div style={{ fontSize: '16px', marginTop: '4px' }}>{clientDetails.name || 'N/A'}</div>
												</div>
												<div>
													<label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Email</label>
													<div style={{ fontSize: '16px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
														<FiMail size={14} /> {clientDetails.email || 'N/A'}
													</div>
												</div>
												<div>
													<label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Phone</label>
													<div style={{ fontSize: '16px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
														<FiPhone size={14} /> {clientDetails.phone || 'N/A'}
													</div>
												</div>
												<div>
													<label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Company</label>
													<div style={{ fontSize: '16px', marginTop: '4px' }}>{clientDetails.company_name || 'N/A'}</div>
												</div>
												<div style={{ gridColumn: '1 / -1' }}>
													<label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Address</label>
													<div style={{ fontSize: '16px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
														<FiMapPin size={14} /> {clientDetails.address || 'N/A'}
													</div>
												</div>
											</div>
										</div>

										{/* Statistics */}
										{clientDetails.statistics && (
											<div style={{ marginBottom: '24px' }}>
												<h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#19435B', display: 'flex', alignItems: 'center', gap: '8px' }}>
													<FiActivity /> Statistics
												</h3>
												<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
													<div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
														<div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Appointments</div>
														<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#19435B' }}>
															{clientDetails.statistics.total_appointments || 0}
														</div>
													</div>
													<div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
														<div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Payments</div>
														<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#19435B' }}>
															{clientDetails.statistics.total_payments || 0}
														</div>
													</div>
													<div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
														<div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Spent</div>
														<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#19435B', display: 'flex', alignItems: 'center', gap: '4px' }}>
															<FiDollarSign size={20} /> {clientDetails.statistics.total_spent?.toFixed(2) || '0.00'}
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Appointments */}
										{clientDetails.appointments && clientDetails.appointments.length > 0 && (
											<div style={{ marginBottom: '24px' }}>
												<h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#19435B', display: 'flex', alignItems: 'center', gap: '8px' }}>
													<FiCalendar /> Appointments ({clientDetails.appointments.length})
												</h3>
												<div style={{ maxHeight: '200px', overflowY: 'auto' }}>
													{clientDetails.appointments.map((apt) => (
														<div
															key={apt.id}
															style={{
																padding: '12px',
																background: '#f9f9f9',
																borderRadius: '8px',
																marginBottom: '8px',
																borderLeft: '4px solid #255f66',
															}}
														>
															<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
																<div>
																	<strong>{apt.appointment_slot?.date || 'N/A'}</strong> at {apt.appointment_slot?.time || 'N/A'}
																</div>
																<span
																	style={{
																		padding: '4px 12px',
																		borderRadius: '12px',
																		fontSize: '12px',
																		fontWeight: 600,
																		background: apt.status === 'confirmed' ? '#4caf50' : apt.status === 'pending' ? '#ff9800' : '#f44336',
																		color: 'white',
																	}}
																>
																	{apt.status || 'N/A'}
																</span>
															</div>
															{apt.services && apt.services.length > 0 && (
																<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
																	Services: {apt.services.map(s => s.name).join(', ')}
																</div>
															)}
														</div>
													))}
												</div>
											</div>
										)}

										{/* Pending Payments Details */}
										{clientDetails.pendingPayments && clientDetails.pendingPayments.length > 0 && (
											<div>
												<h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#19435B', display: 'flex', alignItems: 'center', gap: '8px' }}>
													<FiDollarSign /> Pending Payments ({clientDetails.pendingPayments.length})
												</h3>
												<div style={{ maxHeight: '200px', overflowY: 'auto' }}>
													{clientDetails.pendingPayments.map((payment) => (
														<div
															key={payment.id}
															style={{
																padding: '12px',
																background: '#fff3f3',
																borderRadius: '8px',
																marginBottom: '8px',
																borderLeft: '4px solid #ff6b6b',
															}}
														>
															<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
																<div>
																	<strong>Payment #{payment.id}</strong>
																	<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
																		{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
																	</div>
																</div>
																<div style={{ textAlign: 'right' }}>
																	<div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>
																		${parseFloat(payment.amount || 0).toFixed(2)}
																	</div>
																	<span
																		style={{
																			padding: '4px 12px',
																			borderRadius: '12px',
																			fontSize: '12px',
																			fontWeight: 600,
																			background: '#ff6b6b',
																			color: 'white',
																			display: 'inline-block',
																			marginTop: '4px',
																		}}
																	>
																		{payment.status || 'Pending'}
																	</span>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</>
							) : null}
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
