import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Login.css';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const result = await login(email, password);

		if (result.success) {
			// Admin interface - always redirect to services dashboard
			navigate('/service-dashboard');
		} else {
			setError(result.error || 'Login failed. Please check your credentials.');
		}

		setLoading(false);
	};

	return (
		<div className="login-wrap">
			<motion.div
				className="login-card"
				initial={{ opacity: 0, scale: 0.96, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
			>
				<h2 className="page-title" style={{ textAlign: 'center', color: '#19435B' }}>
					Login
				</h2>
				{error && (
					<div style={{ color: 'red', marginBottom: 12, padding: '8px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}
				<form className="form" onSubmit={handleSubmit}>
					<label className="label">Email</label>
					<input
						className="input"
						type="email"
						placeholder="you@company.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
					/>
					<label className="label">Password</label>
					<input
						className="input"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
					/>
					<button
						className="btn"
						type="submit"
						style={{ width: '100%', marginTop: 12 }}
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
					<div className="login-actions">
						<a href="#">Forgot Password?</a>
						<a href="#">Create Account?</a>
					</div>
				</form>
			</motion.div>
		</div>
	);
}
