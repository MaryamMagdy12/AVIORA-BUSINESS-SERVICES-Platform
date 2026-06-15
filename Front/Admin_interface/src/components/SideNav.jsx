import { NavLink } from 'react-router-dom';
import {
	FiGrid,
	FiUsers,
	FiCalendar,
	FiCreditCard,
	FiBriefcase,
	FiPlusSquare,
	FiUserPlus,
	FiClipboard,
	FiLogIn,
	FiPackage,
	FiMail
} from 'react-icons/fi';
import '../assets/css/SideNav.css';
import { AvioraMark } from './AvioraLogo';

const navLinks = [
	{ to: '/service-dashboard', label: 'Services', icon: FiGrid },
	{ to: '/clients', label: 'Clients', icon: FiUsers },
	{ to: '/appointments', label: 'Appointments', icon: FiCalendar },
	{ to: '/payments', label: 'Payments', icon: FiCreditCard },
	{ to: '/contacts', label: 'Contact Messages', icon: FiMail },
	{ to: '/employees', label: 'Employees', icon: FiBriefcase },
	{ to: '/add-appointment', label: 'Add Appointment', icon: FiPlusSquare },
	{ to: '/add-service', label: 'Add Service', icon: FiPackage },
	{ to: '/add-admin', label: 'Add Admin', icon: FiUserPlus },
	{ to: '/payment-confirm', label: 'Confirm Payment', icon: FiClipboard },
	{ to: '/login', label: 'Login', icon: FiLogIn }
];

export default function SideNav() {
	return (
		<aside className="side-nav">
			<div className="logo">
				<AvioraMark className="side-nav-mark" size={44} theme="dark" />
			</div>
			<nav className="side-links">
				{navLinks.map(({ to, label, icon: Icon }) => (
					<NavLink key={to} to={to} data-label={label} aria-label={label}>
						<Icon />
					</NavLink>
				))}
			</nav>
		</aside>
	);
}
