import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import '../assets/css/Modal.css';

export function Modal({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK', cancelText = 'Cancel', onConfirm, showCancel = false }) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	const handleConfirm = () => {
		if (onConfirm) {
			if (typeof onConfirm === 'function') {
				onConfirm(true);
			}
		}
		onClose();
	};

	const handleCancel = () => {
		if (onConfirm && typeof onConfirm === 'function') {
			// For confirm dialogs, onConfirm receives false when cancelled
			onConfirm(false);
		}
		onClose();
	};

	const getIcon = () => {
		switch (type) {
			case 'success':
				return <FiCheckCircle className="modal-icon modal-icon-success" />;
			case 'error':
			case 'danger':
				return <FiAlertCircle className="modal-icon modal-icon-error" />;
			case 'warning':
				return <FiAlertTriangle className="modal-icon modal-icon-warning" />;
			default:
				return <FiInfo className="modal-icon modal-icon-info" />;
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="modal-overlay" onClick={handleCancel}>
					<motion.div
						className="modal-container"
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ duration: 0.2 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-header">
							<div className="modal-icon-wrapper">{getIcon()}</div>
							{title && <h3 className="modal-title">{title}</h3>}
							<button className="modal-close" onClick={handleCancel} aria-label="Close">
								<FiX />
							</button>
						</div>
						<div className="modal-body">
							{message && <p className="modal-message">{message}</p>}
						</div>
						<div className="modal-footer">
							{showCancel && (
								<button className="btn btn-secondary" onClick={handleCancel}>
									{cancelText}
								</button>
							)}
							<button
								className={`btn ${type === 'danger' || type === 'error' ? 'btn-danger' : 'btn-primary'}`}
								onClick={handleConfirm}
								autoFocus
							>
								{confirmText}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

export default Modal;

