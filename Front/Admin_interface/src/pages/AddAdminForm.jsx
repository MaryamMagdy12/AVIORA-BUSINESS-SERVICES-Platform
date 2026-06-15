import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import '../assets/css/AddAdminForm.css';
import { validateForm, validationRules } from '../utils/validation';

export default function AddAdminForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		address: '',
		password: '',
		password_confirmation: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setFieldErrors({});

		// Frontend validation
		const { errors, hasErrors } = validateForm(formData, validationRules.admin);
		
		if (hasErrors) {
			setFieldErrors(errors);
			const firstError = Object.values(errors)[0];
			setError(firstError);
			return;
		}

		// Trim whitespace from passwords
		const password = formData.password.trim();
		const passwordConfirmation = formData.password_confirmation.trim();

		// Additional password confirmation check
		if (password !== passwordConfirmation) {
			setError('Passwords do not match');
			setFieldErrors({ password_confirmation: 'Passwords do not match' });
			return;
		}

		setLoading(true);

		try {
			await adminAPI.createAdmin({
				name: formData.name.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				address: formData.address.trim(),
				password: password,
				password_confirmation: passwordConfirmation,
			});
			navigate('/service-dashboard');
		} catch (err) {
			// Handle Laravel validation errors
			if (err.response?.status === 422 && err.response?.data?.errors) {
				setFieldErrors(err.response.data.errors);
				const firstError = Object.values(err.response.data.errors)[0];
				setError(Array.isArray(firstError) ? firstError[0] : firstError);
			} else {
				const errorData = err.response?.data || {};
				setError(errorData.message || errorData.error || 'Failed to create admin');
			}
			console.error('Error creating admin:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page page-centered">
			<SideNav />
			<motion.section
				className="card page-card container admin-form-wrapper"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.35 }}
			>
				<div className="admin-form-container">
					<h2 className="page-title">Add New Admin</h2>
					<p className="page-subtitle">Dashboard / Admins / Add</p>
					{error && (
						<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
							{error}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="form-grid">
							<div className="form-row">
								<label className="label">Full Name</label>
								<input
									className={`input ${fieldErrors.name ? 'error' : ''}`}
									placeholder="Name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
									disabled={loading}
								/>
								{fieldErrors.name && (
									<span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
										{Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
									</span>
								)}
							</div>
							<div className="form-row">
								<label className="label">Email Address</label>
								<input
									className={`input ${fieldErrors.email ? 'error' : ''}`}
									type="email"
									placeholder="name@company.com"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									required
									disabled={loading}
								/>
								{fieldErrors.email && (
									<span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
										{Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
									</span>
								)}
							</div>
							<div className="form-row">
								<label className="label">Phone Number</label>
								<input
									className={`input ${fieldErrors.phone ? 'error' : ''}`}
									placeholder="Phone Number"
									required
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									disabled={loading}
								/>
								{fieldErrors.phone && (
									<span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
										{Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}
									</span>
								)}
							</div>
							<div className="form-row">
								<label className="label">Address</label>
								<input
									className="input"
									placeholder="Address"
									value={formData.address}
									onChange={(e) => setFormData({ ...formData, address: e.target.value })}
									disabled={loading}
								/>
							</div>
							<div className="form-row">
								<label className="label">Password</label>
								<input
									className={`input ${fieldErrors.password ? 'error' : ''}`}
									type="password"
									placeholder="••••••••"
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									required
									disabled={loading}
								/>
								{fieldErrors.password && (
									<span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
										{Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
									</span>
								)}
							</div>
							<div className="form-row">
								<label className="label">Confirm Password</label>
								<input
									className={`input ${fieldErrors.password_confirmation ? 'error' : ''}`}
									type="password"
									placeholder="••••••••"
									value={formData.password_confirmation}
									onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
									required
									disabled={loading}
								/>
								{fieldErrors.password_confirmation && (
									<span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
										{Array.isArray(fieldErrors.password_confirmation) ? fieldErrors.password_confirmation[0] : fieldErrors.password_confirmation}
									</span>
								)}
							</div>
						</div>
						<div className="actions">
							<button type="submit" className="btn" disabled={loading}>
								{loading ? 'Saving...' : 'Save Admin'}
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
