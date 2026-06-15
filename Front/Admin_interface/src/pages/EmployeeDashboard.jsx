import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import '../assets/css/EmployeeDashboard.css';

const employees = Array.from({ length: 8 }).map((_, i) => ({
	id: i + 1,
	name: ['Maryam', 'Alex', 'Jordan', 'Taylor', 'Sam', 'Riley', 'Jamie', 'Chris'][i],
	dept: ['HR', 'Design', 'Finance', 'Ops'][i % 4],
	status: ['Verified', 'Pending'][i % 2],
	tasks: Math.floor(Math.random() * 80) + 20
}));

export default function EmployeeDashboard() {
	return (
		<div className="page">
			<SideNav />
			<motion.section
				className="container"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				style={{width: '100%'}}
			>
				<h2 className="page-title" style={{ fontSize: 40, marginBottom: 12 }}>Employee Dashboard</h2>
				<div className="card page-card">
					<table className="table">
						<thead>
							<tr>
								<th>Employee Name</th>
								<th>Role / Department</th>
								<th>Status</th>
								<th>Tasks Completed</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{employees.map(e => (
								<tr key={e.id}>
									<td>{e.name}</td>
									<td>{e.dept}</td>
									<td>
										<span className={`pill ${e.status === 'Verified' ? 'ok' : 'warn'}`}>{e.status}</span>
									</td>
									<td>{e.tasks}</td>
									<td style={{ textAlign: 'right' }}>
										<button className="btn" style={{ padding: '6px 10px' }}>Verify</button>{' '}
										<button className="btn secondary" style={{ padding: '6px 10px' }}>Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.section>
		</div>
	);
}


