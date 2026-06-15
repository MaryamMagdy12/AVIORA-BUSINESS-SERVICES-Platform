import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import { extractPaginated } from '../utils/pagination';
import '../assets/css/PaymentDashboard.css';

export default function PaymentDashboard() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [confirmingId, setConfirmingId] = useState(null);
	const [metrics, setMetrics] = useState({
		paid: { value: 0, count: 0 },
		pending: { value: 0, count: 0 },
		failed: { value: 0, count: 0 },
	});

	useEffect(() => {
		fetchPayments(page);
	}, [page]);

	const fetchPayments = async (pageNum = 1) => {
		try {
			setLoading(true);
			setError('');
			const response = await adminAPI.getPayments({ page: pageNum, per_page: 25 });
			const { data: paymentsData, meta: pageMeta } = extractPaginated(response.data);
			setPayments(paymentsData);
			setMeta(pageMeta);

			// Calculate metrics
			const paid = paymentsData.filter((p) => p.status === 'paid');
			const pending = paymentsData.filter((p) => p.status === 'pending');
			const failed = paymentsData.filter((p) => p.status === 'failed');

			setMetrics({
				paid: {
					value: paid.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
					count: paid.length,
				},
				pending: {
					value: pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
					count: pending.length,
				},
				failed: {
					value: failed.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
					count: failed.length,
				},
			});
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load payments');
			console.error('Error fetching payments:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmPayment = async (paymentId) => {
		try {
			setConfirmingId(paymentId);
			await adminAPI.confirmPayment(paymentId);
			await fetchPayments(page);
		} catch (err) {
			setError(err.response?.data?.error || err.response?.data?.message || 'Failed to confirm payment');
		} finally {
			setConfirmingId(null);
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="page">
				<SideNav />
				<div style={{ padding: '40px', textAlign: 'center' }}>Loading payments...</div>
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
				style={{ width: '90%' }}
			>
				<div className="header">
					<h2 className="page-title" style={{ fontSize: 40 }}>Payment Dashboard</h2>
				</div>
				{error && (
					<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}
				<div className="kpi">
					<div className="card metric paid">
						<div className="metric-icon">
							<FiCheckCircle />
						</div>
						<div className="metric-copy">
							<h4>Paid</h4>
							<p className="metric-value">{formatCurrency(metrics.paid.value)}</p>
							<span className="metric-note">{metrics.paid.count} cleared invoices</span>
						</div>
					</div>
					<div className="card metric pending">
						<div className="metric-icon">
							<FiClock />
						</div>
						<div className="metric-copy">
							<h4>Pending</h4>
							<p className="metric-value">{formatCurrency(metrics.pending.value)}</p>
							<span className="metric-note">{metrics.pending.count} awaiting confirmation</span>
						</div>
					</div>
					<div className="card metric overdue">
						<div className="metric-icon">
							<FiAlertTriangle />
						</div>
						<div className="metric-copy">
							<h4>Failed</h4>
							<p className="metric-value">{formatCurrency(metrics.failed.value)}</p>
							<span className="metric-note">{metrics.failed.count} failed payments</span>
						</div>
					</div>
				</div>
				<div className="card page-card">
					<h2 className="page-title" style={{ fontSize: 25, color: '#19435b' }}>Payments</h2>
					<table className="table">
						<thead>
							<tr>
								<th>Client Name</th>
								<th>Services</th>
								<th>Date</th>
								<th>Amount</th>
								<th>Status</th>
								<th>Transaction ID</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{payments.length === 0 ? (
								<tr>
									<td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
										No payments found
									</td>
								</tr>
							) : (
								payments.map((payment) => (
									<tr key={payment.id}>
										<td>{payment.user?.name || 'N/A'}</td>
										<td>
											{payment.appointment?.services?.length > 0
												? payment.appointment.services.map((s) => s.name).join(', ')
												: 'N/A'}
										</td>
										<td>{new Date(payment.created_at).toLocaleDateString()}</td>
										<td>{formatCurrency(payment.amount)}</td>
										<td>
											<span
												className={`pill ${
													payment.status === 'paid'
														? 'ok'
														: payment.status === 'pending'
														? 'warn'
														: 'error'
												}`}
											>
												{payment.status}
											</span>
										</td>
										<td style={{ fontSize: 12 }}>{payment.transaction_id || 'N/A'}</td>
										<td>
											{payment.status === 'pending' && (
												<button
													type="button"
													className="btn"
													disabled={confirmingId === payment.id}
													onClick={() => handleConfirmPayment(payment.id)}
												>
													{confirmingId === payment.id ? 'Confirming...' : 'Mark Paid'}
												</button>
											)}
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
		</div>
	);
}
