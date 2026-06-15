import { FiBell, FiBellOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AvioraLogo from './AvioraLogo';

export default function TopNav() {
	const { user } = useAuth();
	const initials = user?.name
		? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
		: 'AD';

	return (
		<header className="app-topbar">
			<nav className="topnav-card">
				<div className="topnav-logo">
					<AvioraLogo className="topnav-logo-svg" />
				</div>
				<div className="topnav-title">
					<span className="name">{user?.name || 'Admin'}</span>
					<span className="role">{user?.is_admin ? 'Admin' : user?.role || 'User'}</span>
				</div>
				<div className="topnav-actions">
					<button type="button" className="icon-btn" aria-label="Notifications">
						<FiBell />
					</button>
					<button type="button" className="icon-btn has-indicator" aria-label="Alerts">
						<FiBellOff />
						<span className="dot" />
					</button>
					<div className="avatar" aria-hidden="true">
						<span className="avatar-initials">{initials}</span>
					</div>
				</div>
			</nav>
		</header>
	);
}
