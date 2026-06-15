const NAVY = '#19435B';
const GREEN = '#6B8F71';
const LIGHT = '#E9F6FB';
const LIGHT_GREEN = '#8FB396';

export function AvioraMark({ className = '', size = 48, theme = 'light' }) {
	const primary = theme === 'dark' ? LIGHT : NAVY;
	const accent = theme === 'dark' ? LIGHT_GREEN : GREEN;

	return (
		<svg
			className={className}
			width={size}
			height={size * 0.88}
			viewBox="0 0 64 56"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Aviora"
		>
			<path d="M6 50 L32 4 L32 34 L18 50 Z" fill={primary} />
			<path d="M32 4 L58 50 L46 50 L32 28 Z" fill={accent} />
			<rect x="16" y="36" width="32" height="7" rx="1" fill={primary} />
		</svg>
	);
}

export default function AvioraLogo({ variant = 'full', className = '', markSize = 40 }) {
	if (variant === 'icon') {
		return <AvioraMark className={className} size={markSize} />;
	}

	return (
		<svg
			className={className}
			viewBox="0 0 220 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Aviora Business Services"
		>
			<g transform="translate(78 0)">
				<path d="M6 38 L32 0 L32 26 L18 38 Z" fill={NAVY} />
				<path d="M32 0 L58 38 L46 38 L32 18 Z" fill={GREEN} />
				<rect x="16" y="26" width="32" height="6" rx="1" fill={NAVY} />
			</g>
			<text x="110" y="58" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="28" fontWeight="700" letterSpacing="4">
				<tspan fill={GREEN}>A</tspan>
				<tspan fill={NAVY}>VIOR</tspan>
				<tspan fill={GREEN}>A</tspan>
			</text>
			<line x1="52" y1="74" x2="88" y2="74" stroke={GREEN} strokeWidth="1.5" />
			<text x="110" y="88" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="9" fontWeight="600" fill={NAVY} letterSpacing="2.5">
				BUSINESS SERVICES
			</text>
			<line x1="132" y1="74" x2="168" y2="74" stroke={GREEN} strokeWidth="1.5" />
		</svg>
	);
}
