import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import { extractPaginated } from '../utils/pagination';
import '../assets/css/AppointmentDashboard.css';

function CalendarDay({ day, label, onClick, status }) {
	// Determine color class based on status
	let statusClass = '';
	if (status === 'booked' || status === 'reserved') {
		statusClass = 'day-booked';
	} else if (status === 'available' || status === 'created') {
		statusClass = 'day-available';
	}

	return (
		<div 
			className={`day${day ? '' : ' empty'} ${statusClass}`} 
			onClick={onClick} 
			style={{ cursor: label || status ? 'pointer' : 'default' }}
		>
			<div className="num">{day}</div>
			{label && <div className={`chip ${statusClass}`}>{label}</div>}
		</div>
	);
}

export default function AppointmentDashboard() {
	const today = new Date();
	const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
	const [selectedYear, setSelectedYear] = useState(today.getFullYear());
	const [appointments, setAppointments] = useState([]);
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [meetingLink, setMeetingLink] = useState('');
	const [sendingMeetingLink, setSendingMeetingLink] = useState(false);
	const [meetingLinkError, setMeetingLinkError] = useState('');
	const [meetingLinkSuccess, setMeetingLinkSuccess] = useState('');
	const [cancellingAppointment, setCancellingAppointment] = useState(false);
	const [cancelError, setCancelError] = useState('');
	const [cancelSuccess, setCancelSuccess] = useState('');

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

	useEffect(() => {
		fetchAppointments();
	}, [selectedMonth, selectedYear]);

	const fetchAppointments = async () => {
		try {
			setLoading(true);
			setError('');
			// Calculate date range for the selected month
			// Use local date formatting to avoid timezone issues with toISOString()
			const startDateObj = new Date(selectedYear, selectedMonth, 1);
			const endDateObj = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month
			
			// Format dates as YYYY-MM-DD without timezone conversion
			const formatDate = (date) => {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};
			
			const startDate = formatDate(startDateObj);
			const endDate = formatDate(endDateObj);

			const response = await adminAPI.getAppointmentSlots({
				start_date: startDate,
				end_date: endDate,
				per_page: 200,
			});
			const { data } = extractPaginated(response.data);
			setAppointments(data);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load appointments');
			console.error('Error fetching appointments:', err);
		} finally {
			setLoading(false);
		}
	};

	// Build highlights object from all appointment slots (both created and reserved)
	const highlights = useMemo(() => {
		const highlightsObj = {};
		
		// Group slots by day first to handle multiple slots per day
		const slotsByDay = {};
		appointments.forEach((slot) => {
			if (slot.date) {
				const date = new Date(slot.date);
				const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
				const day = date.getDate();
				const key = `${monthKey}-${day}`;
				
				if (!slotsByDay[key]) {
					slotsByDay[key] = [];
				}
				slotsByDay[key].push({ slot, monthKey, day });
			}
		});

		// Process each day, preferring booked slots for display
		Object.values(slotsByDay).forEach((daySlots) => {
			const { monthKey, day } = daySlots[0];
			
			if (!highlightsObj[monthKey]) {
				highlightsObj[monthKey] = {};
			}

			// Find booked slots first (prefer showing booked status)
			const bookedSlot = daySlots.find(({ slot }) => !!slot.appointment);
			const slot = bookedSlot ? bookedSlot.slot : daySlots[0].slot;

			// Check if slot is booked/reserved (has appointment) or just created/available
			const isBooked = !!slot.appointment;
			const status = isBooked ? 'booked' : (slot.status || 'available');
			
			// Use client name if booked, or "Available" if just created
			const label = isBooked 
				? (slot.appointment?.user?.name || slot.appointment?.services?.[0]?.name || 'Booked')
				: (slot.status === 'available' ? 'Available' : 'Created');

			highlightsObj[monthKey][day] = {
				label,
				status
			};
		});
		
		return highlightsObj;
	}, [appointments]);

	const { calendarDays, currentHighlights } = useMemo(() => {
		const startOfMonth = new Date(selectedYear, selectedMonth, 1);
		const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
		const firstWeekDay = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
		const days = [];

		for (let i = 0; i < firstWeekDay; i += 1) {
			days.push(null);
		}
		for (let day = 1; day <= totalDays; day += 1) {
			days.push(day);
		}
		while (days.length % 7 !== 0) {
			days.push(null);
		}

		const key = `${selectedYear}-${selectedMonth}`;
		return { calendarDays: days, currentHighlights: highlights[key] ?? {} };
	}, [selectedMonth, selectedYear, highlights]);

	const handleDayClick = (day) => {
		if (!day) return;

		// Find all appointment slots for this day
		const daySlots = appointments.filter((slot) => {
			if (!slot.date) return false;
			const slotDate = new Date(slot.date);
			return slotDate.getDate() === day && slotDate.getMonth() === selectedMonth && slotDate.getFullYear() === selectedYear;
		});

		// Prefer booked slots over available ones, otherwise take the first one
		const appointment = daySlots.find((slot) => slot.appointment) || daySlots[0];

		setSelectedAppointment(appointment || null);
		setMeetingLink('');
		setMeetingLinkError('');
		setMeetingLinkSuccess('');
		setCancelError('');
		setCancelSuccess('');
	};

	const handleSendMeetingLink = async (e) => {
		e.preventDefault();
		
		if (!selectedAppointment || !selectedAppointment.id) {
			setMeetingLinkError('No appointment selected');
			return;
		}

		if (!meetingLink.trim()) {
			setMeetingLinkError('Please enter a meeting link');
			return;
		}

		try {
			setSendingMeetingLink(true);
			setMeetingLinkError('');
			setMeetingLinkSuccess('');
			
			const response = await adminAPI.sendMeetingLink(selectedAppointment.id, meetingLink);
			
			setMeetingLinkSuccess('Meeting link email sent successfully!');
			setMeetingLink('');
			
			// Clear success message after 5 seconds
			setTimeout(() => {
				setMeetingLinkSuccess('');
			}, 5000);
		} catch (err) {
			setMeetingLinkError(err.response?.data?.error || err.response?.data?.message || 'Failed to send meeting link email');
		} finally {
			setSendingMeetingLink(false);
		}
	};

	const handleCancelAppointment = async () => {
		if (!selectedAppointment || !selectedAppointment.id) {
			setCancelError('No appointment selected');
			return;
		}

		// Confirm cancellation
		if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
			return;
		}

		try {
			setCancellingAppointment(true);
			setCancelError('');
			setCancelSuccess('');
			
			const response = await adminAPI.cancelAppointment(selectedAppointment.id);
			
			setCancelSuccess('Appointment cancelled successfully!');
			
			// Refresh appointments to show updated status
			await fetchAppointments();
			
			// Update selected appointment to show new status
			if (selectedAppointment.appointment) {
				selectedAppointment.appointment.status = 'canceled';
			}
			
			// Clear success message after 5 seconds
			setTimeout(() => {
				setCancelSuccess('');
			}, 5000);
		} catch (err) {
			setCancelError(err.response?.data?.error || err.response?.data?.message || 'Failed to cancel appointment');
		} finally {
			setCancellingAppointment(false);
		}
	};

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	if (loading) {
		return (
			<div className="page">
				<SideNav />
				<div style={{ padding: '40px', textAlign: 'center' }}>Loading appointments...</div>
			</div>
		);
	}

	return (
		<div className="page">
			<SideNav />

			<motion.section
				className="container appointment-view"
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				style={{ display: 'block' }}
			>
				<div className="header">
					<h2 className="page-title" style={{ fontSize: 40 }}>Appointment Dashboard</h2>
				</div>
				{error && (
					<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}
				<div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
					<div className="card page-card appointment-calendar">
						<div className="calendar-toolbar">
							<div className="calendar-toolbar-title">
								<h3 className="page-title" style={{ fontSize: 22, marginBottom: 4, color: '#19435B' }}>
									Highlighted booked dates
								</h3>
								<p className="page-subtitle" style={{ margin: 0 }}>Select a month to explore upcoming bookings.</p>
							</div>
							<div className="controls">
								<select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
									{months.map((month, index) => (
										<option key={month} value={index}>
											{month}
										</option>
									))}
								</select>
								<select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
									{years.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="calendar-weekdays">
							{weekDays.map((day) => (
								<div key={day} className="weekday">
									{day}
								</div>
							))}
						</div>
						<div className="calendar">
							{calendarDays.map((day, index) => {
								const highlight = day && currentHighlights[day] ? currentHighlights[day] : null;
								return (
									<CalendarDay
										key={`${day ?? 'empty'}-${index}`}
										day={day}
										label={highlight ? (typeof highlight === 'string' ? highlight : highlight.label) : ''}
										status={highlight && typeof highlight === 'object' ? highlight.status : (highlight ? 'booked' : null)}
										onClick={() => handleDayClick(day)}
									/>
								);
							})}
						</div>
					</div>
					<div className="card page-card appointment-details">
						<h3 className="page-title" style={{ fontSize: 22, marginBottom: 14, color: '#19435B' }}>
							Appointment Details
						</h3>
						<div className="details">
							{selectedAppointment && selectedAppointment.appointment ? (
								<>
									<div>
										<strong>Client Name:</strong>{' '}
										{selectedAppointment.appointment.user?.name ||
											selectedAppointment.appointment.client?.name ||
											selectedAppointment.appointment.user_name ||
											selectedAppointment.appointment.client_name ||
											selectedAppointment.user?.name ||
											'N/A'}
									</div>
									<div>
										<strong>Date:</strong> {selectedAppointment.date || 'N/A'}
									</div>
									<div>
										<strong>Time:</strong> {selectedAppointment.time || 'N/A'}
									</div>
									<div>
										<strong>Services:</strong>{' '}
										{selectedAppointment.appointment.services?.map((s) => s.name).join(', ') || 'N/A'}
									</div>
									<div>
										<strong>Status:</strong>{' '}
										<span style={{
											padding: '4px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: '600',
											textTransform: 'uppercase',
											backgroundColor: 
												selectedAppointment.appointment.status === 'completed' ? '#4caf50' :
												selectedAppointment.appointment.status === 'confirmed' ? '#2196f3' :
												selectedAppointment.appointment.status === 'canceled' ? '#f44336' :
												'#ff9800', // pending
											color: 'white',
										}}>
											{selectedAppointment.appointment.status || 'N/A'}
										</span>
									</div>
									{/* <div>
										<strong>Slot Status:</strong> {selectedAppointment.status || 'N/A'}
									</div> */}
									
									{/* Cancel Appointment Button - Only show if not completed or already cancelled */}
									{selectedAppointment.appointment.status !== 'completed' && 
									 selectedAppointment.appointment.status !== 'canceled' && (
										<div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
											{cancelError && (
												<div style={{ 
													color: '#d32f2f', 
													backgroundColor: '#ffebee', 
													padding: '10px', 
													borderRadius: '4px', 
													marginBottom: '12px',
													fontSize: '14px'
												}}>
													{cancelError}
												</div>
											)}
											
											{cancelSuccess && (
												<div style={{ 
													color: '#2e7d32', 
													backgroundColor: '#e8f5e9', 
													padding: '10px', 
													borderRadius: '4px', 
													marginBottom: '12px',
													fontSize: '14px'
												}}>
													{cancelSuccess}
												</div>
											)}
											
											<button
												type="button"
												onClick={handleCancelAppointment}
												disabled={cancellingAppointment}
												style={{
													width: '100%',
													padding: '12px',
													backgroundColor: cancellingAppointment ? '#999' : '#f44336',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													fontSize: '16px',
													fontWeight: '500',
													cursor: cancellingAppointment ? 'not-allowed' : 'pointer',
													transition: 'background-color 0.3s',
												}}
												onMouseEnter={(e) => {
													if (!cancellingAppointment) {
														e.target.style.backgroundColor = '#d32f2f';
													}
												}}
												onMouseLeave={(e) => {
													if (!cancellingAppointment) {
														e.target.style.backgroundColor = '#f44336';
													}
												}}
											>
												{cancellingAppointment ? 'Cancelling...' : 'Cancel Appointment'}
											</button>
										</div>
									)}
									
									{/* Send Meeting Link Form */}
									<div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
										<h4 style={{ fontSize: '18px', marginBottom: '16px', color: '#19435B' }}>Send Meeting Link</h4>
										
										<form onSubmit={handleSendMeetingLink}>
											<div style={{ marginBottom: '16px' }}>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
													Meeting Link
												</label>
												<input
													type="url"
													value={meetingLink}
													onChange={(e) => {
														setMeetingLink(e.target.value);
														setMeetingLinkError('');
														setMeetingLinkSuccess('');
													}}
													placeholder="https://meet.google.com/xxx-xxxx-xxx"
													style={{
														width: '100%',
														padding: '10px 12px',
														border: '1px solid #ddd',
														borderRadius: '4px',
														fontSize: '14px',
														boxSizing: 'border-box',
													}}
													required
												/>
											</div>
											
											<div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
												<div><strong>Appointment Date:</strong> {selectedAppointment.date || 'N/A'}</div>
												<div><strong>Appointment Time:</strong> {selectedAppointment.time || 'N/A'}</div>
											</div>
											
											{meetingLinkError && (
												<div style={{ 
													color: '#d32f2f', 
													backgroundColor: '#ffebee', 
													padding: '10px', 
													borderRadius: '4px', 
													marginBottom: '12px',
													fontSize: '14px'
												}}>
													{meetingLinkError}
												</div>
											)}
											
											{meetingLinkSuccess && (
												<div style={{ 
													color: '#2e7d32', 
													backgroundColor: '#e8f5e9', 
													padding: '10px', 
													borderRadius: '4px', 
													marginBottom: '12px',
													fontSize: '14px'
												}}>
													{meetingLinkSuccess}
												</div>
											)}
											
											<button
												type="submit"
												disabled={sendingMeetingLink}
												style={{
													width: '100%',
													padding: '12px',
													backgroundColor: sendingMeetingLink ? '#19435B' : '#19435B',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													fontSize: '16px',
													fontWeight: '500',
													cursor: sendingMeetingLink ? 'not-allowed' : 'pointer',
													transition: 'background-color 0.3s',
												}}
												onMouseEnter={(e) => {
													if (!sendingMeetingLink) {
														e.target.style.backgroundColor = '#19435b';
													}
												}}
												onMouseLeave={(e) => {
													if (!sendingMeetingLink) {
														e.target.style.backgroundColor = 'rgb(69 119 107)';
													}
												}}
											>
												{sendingMeetingLink ? 'Sending...' : 'Send Email with Meeting Link'}
											</button>
										</form>
									</div>
								</>
							) : (
								<div style={{ color: '#999' }}>Click on a highlighted date to view details</div>
							)}
						</div>
					</div>
				</div>
			</motion.section>
		</div>
	);
}
