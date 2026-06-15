import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import '../assets/css/AddAppointmentForm.css';

export default function AddAppointmentForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		date: '',
		time: '',
		status: 'available',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		if (!formData.date || !formData.time) {
			setError('Date and time are required');
			setLoading(false);
			return;
		}

		try {
			await adminAPI.createAppointmentSlot({
				date: formData.date,
				time: formData.time,
				status: formData.status,
			});
			navigate('/appointments');
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create appointment slot');
			console.error('Error creating appointment slot:', err);
		} finally {
			setLoading(false);
		}
	};

	// Set minimum date to today
	const today = new Date().toISOString().split('T')[0];

	return (
		<div className="page page-centered">
			<SideNav />
			<motion.section
				className="card page-card container form-wrapper"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				style={{ width: 'fit-content' }}
			>
				<div className="form-container">
					<h2 className="page-title" style={{ color: '#19435B', textAlign: 'center' }}>
						Add New Appointment
					</h2>
					<p className="page-subtitle">Dashboard / Appointments / Add</p>
					{error && (
						<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
							{error}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="form-grid single-column">
							<div className="form-row">
								<label className="label">Appointment Date</label>
								<input
									className="input"
									type="date"
									value={formData.date}
									onChange={(e) => setFormData({ ...formData, date: e.target.value })}
									min={today}
									required
									disabled={loading}
								/>
							</div>
							<div className="form-row">
								<label className="label">Appointment Time</label>
								<input
									className="input"
									type="time"
									value={formData.time}
									onChange={(e) => setFormData({ ...formData, time: e.target.value })}
									required
									disabled={loading}
								/>
							</div>
							<div className="form-row">
								<label className="label">Status</label>
								<select
									className="select"
									value={formData.status}
									onChange={(e) => setFormData({ ...formData, status: e.target.value })}
									disabled={loading}
								>
									<option value="available">Available</option>
									<option value="reserved">Reserved</option>
									<option value="canceled">Canceled</option>
								</select>
							</div>
						</div>
						<div className="actions" style={{ justifyContent: 'center' }}>
							<button type="submit" className="btn" disabled={loading}>
								{loading ? 'Saving...' : 'Save Appointment'}
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
