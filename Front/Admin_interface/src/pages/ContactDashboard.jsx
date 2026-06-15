import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiMessageSquare, FiUser, FiPhone, FiCalendar, FiCheckCircle, FiX, FiArchive, FiSend, FiRefreshCw } from 'react-icons/fi';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api';
import { extractPaginated } from '../utils/pagination';
import { useModal } from '../context/ModalContext';
import '../assets/css/ContactDashboard.css';

export default function ContactDashboard() {
	const { alert } = useModal();
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [filter, setFilter] = useState('all'); // all, new, replied, archived
	const [replyText, setReplyText] = useState('');
	const [sendingReply, setSendingReply] = useState(false);
	
	const [stats, setStats] = useState({
		total: 0,
		new: 0,
		replied: 0,
		archived: 0,
	});

	useEffect(() => {
		fetchMessages();
	}, [filter]);

	const fetchMessages = async () => {
		try {
			setLoading(true);
			setError('');
			const params = filter !== 'all' ? { status: filter } : {};
			const response = await adminAPI.getContacts(params);
			const { data: messagesData } = extractPaginated(response.data);
			setMessages(messagesData);

			// Calculate statistics
			const total = messagesData.length;
			const newCount = messagesData.filter(msg => msg.status === 'new').length;
			const repliedCount = messagesData.filter(msg => msg.status === 'replied').length;
			const archivedCount = messagesData.filter(msg => msg.status === 'archived').length;

			setStats({
				total,
				new: newCount,
				replied: repliedCount,
				archived: archivedCount,
			});
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load contact messages');
			console.error('Error fetching messages:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleView = (message) => {
		setSelectedMessage(message);
		setReplyText('');
	};

	const handleCloseModal = () => {
		setSelectedMessage(null);
		setReplyText('');
	};

	const handleReply = async () => {
		if (!replyText.trim() || replyText.trim().length < 10) {
			await alert('Reply message must be at least 10 characters long', 'Validation Error', 'warning');
			return;
		}

		try {
			setSendingReply(true);
			await adminAPI.replyToContact(selectedMessage.id, { reply_message: replyText });
			await alert('Reply sent successfully!', 'Success', 'success');
			handleCloseModal();
			fetchMessages(); // Refresh list
		} catch (err) {
			await alert(err.response?.data?.error || 'Failed to send reply', 'Error', 'error');
			console.error('Error sending reply:', err);
		} finally {
			setSendingReply(false);
		}
	};

	const handleArchive = async (id) => {
		try {
			await adminAPI.updateContact(id, { status: 'archived' });
			fetchMessages();
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to archive message', 'Error', 'error');
			console.error('Error archiving message:', err);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getStatusBadge = (status) => {
		const styles = {
			new: { bg: '#19435b', text: 'white', label: 'New' },
			replied: { bg: '#4CAF50', text: 'white', label: 'Replied' },
			archived: { bg: '#757575', text: 'white', label: 'Archived' },
		};
		const style = styles[status] || styles.new;
		return (
			<span style={{
				backgroundColor: style.bg,
				color: style.text,
				padding: '4px 12px',
				borderRadius: '12px',
				fontSize: '12px',
				fontWeight: 'bold',
				textTransform: 'uppercase'
			}}>
				{style.label}
			</span>
		);
	};

	if (loading && messages.length === 0) {
		return (
			<div className="page">
				<SideNav />
				<div style={{ padding: '40px', textAlign: 'center' }}>Loading contact messages...</div>
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
				<div className="contact-header">
					<h2 className="page-title" style={{ fontSize: 40 }}>Contact Messages</h2>
					<p className="page-subtitle">Manage and reply to customer inquiries</p>
				</div>

				{error && (
					<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}

				{/* Stats Cards */}
				<div className="metrics-grid">
					<div className="metric-card">
						<div className="metric-icon" style={{ background: '#19435b' }}>
							<FiMail />
						</div>
						<div className="metric-body">
							<h4>Total Messages</h4>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.total}</p>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon" style={{ background: '#FF9800' }}>
							<FiMessageSquare />
						</div>
						<div className="metric-body">
							<h4>New Messages</h4>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.new}</p>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon success">
							<FiCheckCircle />
						</div>
						<div className="metric-body">
							<h4>Replied</h4>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.replied}</p>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon" style={{ background: '#757575' }}>
							<FiArchive />
						</div>
						<div className="metric-body">
							<h4>Archived</h4>
							<p style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>{stats.archived}</p>
						</div>
					</div>
				</div>

				{/* Filter Buttons */}
				<div className="filter-buttons metrics-grid">
					<button
						onClick={() => setFilter('all')}
						style={{
							padding: '8px 16px',
							border: 'none',
							borderRadius: '4px',
							background: filter === 'all' ? '#19435b' : '#e0e0e0',
							color: filter === 'all' ? 'white' : '#333',
							cursor: 'pointer'
						}}
					>
						All
					</button>
					<button
						onClick={() => setFilter('new')}
						style={{
							padding: '8px 16px',
							border: 'none',
							borderRadius: '4px',
							background: filter === 'new' ? '#FF9800' : '#e0e0e0',
							color: filter === 'new' ? 'white' : '#333',
							cursor: 'pointer'
						}}
					>
						New
					</button>
					<button
						onClick={() => setFilter('replied')}
						style={{
							padding: '8px 16px',
							border: 'none',
							borderRadius: '4px',
							background: filter === 'replied' ? '#4CAF50' : '#e0e0e0',
							color: filter === 'replied' ? 'white' : '#333',
							cursor: 'pointer'
						}}
					>
						Replied
					</button>
					<button
						onClick={() => setFilter('archived')}
						style={{
							padding: '8px 16px',
							border: 'none',
							borderRadius: '4px',
							background: filter === 'archived' ? '#757575' : '#e0e0e0',
							color: filter === 'archived' ? 'white' : '#333',
							cursor: 'pointer'
						}}
					>
						Archived
					</button>
				</div>

				{/* Messages List */}
				<div className="clients-grid ">
					{loading ? (
						<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
					) : messages.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							No contact messages found.
						</div>
					) : (
						messages.map((message) => (
							<motion.div
								key={message.id}
								className="client-card"
								whileHover={{ scale: 1.02 }}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<div className="client-header-card">
									<div className="client-avatar" style={{ background: '#19435b' }}>
										<FiUser />
									</div>
									<div className="client-info">
										<h3>{message.name}</h3>
										<p>{message.email}</p>
									</div>
									{getStatusBadge(message.status)}
								</div>
								<div className="client-details">
									{message.subject && (
										<div className="detail-row">
											<span className="detail-label">Subject:</span>
											<span className="detail-value">{message.subject}</span>
										</div>
									)}
									<div className="detail-row">
										<span className="detail-label">Message:</span>
										<span className="detail-value" style={{
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											{message.message}
										</span>
									</div>
									<div className="detail-row">
										<span className="detail-label">Date:</span>
										<span className="detail-value">{formatDate(message.created_at)}</span>
									</div>
									{message.phone && (
										<div className="detail-row">
											<span className="detail-label">Phone:</span>
											<span className="detail-value">{message.phone}</span>
										</div>
									)}

									{message.company_name && (
										<div className="detail-row">
											<span className="detail-label">Company Name:</span>
											<span className="detail-value">{message.company_name}</span>
										</div>
									)}
								</div>
								<div className="client-actions">
									<button className="btn-view" onClick={() => handleView(message)}>
										View & Reply
									</button>
									{message.status !== 'archived' && (
										<button
											className="btn-archive"
											onClick={() => handleArchive(message.id)}
											style={{ marginLeft: '8px' }}
										>
											Archive
										</button>
									)}
								</div>
							</motion.div>
						))
					)}
				</div>

				{/* Message Detail Modal */}
				<AnimatePresence>
					{selectedMessage && (
						<motion.div
							className="modal-overlay"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleCloseModal}
						>
							<motion.div
								className="modal-content"
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								onClick={(e) => e.stopPropagation()}
								style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}
							>
								<div className="modal-header">
									<h2>Contact Message Details</h2>
									<button className="close-btn" onClick={handleCloseModal}>
										<FiX />
									</button>
								</div>

								<div className="modal-body" style={{ paddingBottom: '20px' }}>
									{/* Client Info */}
									<div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
										<h3 style={{ marginBottom: '12px' }}>Contact Information</h3>
										<div className="detail-row">
											<FiUser style={{ marginRight: '8px' }} />
											<strong>Name:</strong> {selectedMessage.name}
										</div>
										<div className="detail-row">
											<FiMail style={{ marginRight: '8px' }} />
											<strong>Email:</strong> {selectedMessage.email}
										</div>
										{selectedMessage.phone && (
											<div className="detail-row">
												<FiPhone style={{ marginRight: '8px' }} />
												<strong>Phone:</strong> {selectedMessage.phone}
											</div>
										)}
										{selectedMessage.company_name && (
											<div className="detail-row">
												<strong>Company Name:</strong> {selectedMessage.company_name}
											</div>
										)}
										{selectedMessage.user && (
											<div className="detail-row">
												<strong>Registered User:</strong> Yes (User ID: {selectedMessage.user.id})
											</div>
										)}
									</div>

									{/* Message */}
									<div style={{ marginBottom: '20px' }}>
										<h3 style={{ marginBottom: '12px' }}>Message</h3>
										{selectedMessage.subject && (
											<div style={{ marginBottom: '8px' }}>
												<strong>Subject:</strong> {selectedMessage.subject}
											</div>
										)}
										<div style={{
											padding: '16px',
											background: '#fff',
											border: '1px solid #e0e0e0',
											borderRadius: '8px',
											whiteSpace: 'pre-wrap'
										}}>
											{selectedMessage.message}
										</div>
										<div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
											<FiCalendar style={{ marginRight: '4px' }} />
											Received: {formatDate(selectedMessage.created_at)}
										</div>
										{selectedMessage.replied_at && (
											<div style={{ marginTop: '4px', color: '#666', fontSize: '14px' }}>
												<FiCheckCircle style={{ marginRight: '4px' }} />
												Replied: {formatDate(selectedMessage.replied_at)}
											</div>
										)}
									</div>

									{/* Previous Reply */}
									{selectedMessage.admin_reply && (
										<div style={{ marginBottom: '20px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
											<h3 style={{ marginBottom: '12px' }}>Previous Reply</h3>
											<div style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.admin_reply}</div>
										</div>
									)}

									{/* Reply Form - Always visible, show message if archived */}
									<div style={{ 
										marginTop: '20px', 
										padding: '20px', 
										background: selectedMessage.status === 'archived' ? '#f5f5f5' : '#f8f9fa',
										borderRadius: '8px',
										border: '2px solid #2196F3'
									}}>
										{selectedMessage.status === 'archived' ? (
											<div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
												<FiArchive style={{ fontSize: '48px', marginBottom: '10px', color: '#757575' }} />
												<p style={{ fontSize: '16px', fontWeight: 'bold' }}>This message is archived</p>
												<p style={{ fontSize: '14px', marginTop: '8px' }}>
													To reply, update the status first or unarchive it.
												</p>
												<button
													onClick={() => {
														adminAPI.updateContact(selectedMessage.id, { status: 'new' }).then(() => {
															fetchMessages();
															handleView({ ...selectedMessage, status: 'new' });
														});
													}}
													style={{
														marginTop: '16px',
														padding: '10px 20px',
														background: '#FF9800',
														color: 'white',
														border: 'none',
														borderRadius: '6px',
														cursor: 'pointer',
														fontWeight: 'bold'
													}}
												>
													Unarchive to Reply
												</button>
											</div>
										) : (
											<>
												<h3 style={{ marginBottom: '12px', color: '#2196F3' }}>Reply to Message</h3>
												<textarea
													value={replyText}
													onChange={(e) => setReplyText(e.target.value)}
													placeholder="Type your reply here (minimum 10 characters)..."
													rows={6}
													style={{
														width: '100%',
														padding: '12px',
														border: '2px solid #2196F3',
														borderRadius: '8px',
														fontFamily: 'inherit',
														fontSize: '14px',
														resize: 'vertical',
														marginBottom: '12px',
														boxSizing: 'border-box'
													}}
													minLength={10}
												/>
												<button
													onClick={handleReply}
													disabled={sendingReply || replyText.trim().length < 10}
													style={{
														width: '100%',
														padding: '14px',
														background: sendingReply || replyText.trim().length < 10 ? '#ccc' : '#2196F3',
														color: 'white',
														border: 'none',
														borderRadius: '8px',
														fontSize: '16px',
														fontWeight: 'bold',
														cursor: sendingReply || replyText.trim().length < 10 ? 'not-allowed' : 'pointer',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														gap: '8px',
														transition: 'background 0.3s',
														boxShadow: replyText.trim().length >= 10 && !sendingReply ? '0 4px 6px rgba(33, 150, 243, 0.3)' : 'none'
													}}
													onMouseEnter={(e) => {
														if (!sendingReply && replyText.trim().length >= 10) {
															e.target.style.background = '#1976D2';
														}
													}}
													onMouseLeave={(e) => {
														if (!sendingReply && replyText.trim().length >= 10) {
															e.target.style.background = '#2196F3';
														}
													}}
												>
													<FiSend />
													{sendingReply ? 'Sending...' : 'Send Reply via Email'}
												</button>
												{replyText.trim().length > 0 && replyText.trim().length < 10 && (
													<p style={{ marginTop: '8px', color: '#f44336', fontSize: '12px' }}>
														Please enter at least 10 characters for your reply
													</p>
												)}
											</>
										)}
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.section>
		</div>
	);
}

