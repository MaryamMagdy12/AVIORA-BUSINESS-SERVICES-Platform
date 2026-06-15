import { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/Modal';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
	const [modal, setModal] = useState({
		isOpen: false,
		title: '',
		message: '',
		type: 'info',
		confirmText: 'OK',
		cancelText: 'Cancel',
		showCancel: false,
		onConfirm: null,
	});

	const showModal = useCallback((config) => {
		setModal({
			isOpen: true,
			title: config.title || '',
			message: config.message || '',
			type: config.type || 'info',
			confirmText: config.confirmText || 'OK',
			cancelText: config.cancelText || 'Cancel',
			showCancel: config.showCancel || false,
			onConfirm: config.onConfirm || null,
		});
	}, []);

	const hideModal = useCallback(() => {
		setModal((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const alert = useCallback((message, title = 'Alert', type = 'info') => {
		return new Promise((resolve) => {
			showModal({
				title,
				message,
				type,
				confirmText: 'OK',
				showCancel: false,
				onConfirm: () => resolve(true),
			});
		});
	}, [showModal]);

	const confirm = useCallback((message, title = 'Confirm', type = 'warning') => {
		return new Promise((resolve) => {
			showModal({
				title,
				message,
				type,
				confirmText: 'Confirm',
				cancelText: 'Cancel',
				showCancel: true,
				onConfirm: (confirmed) => {
					if (confirmed === false) {
						resolve(false);
					} else {
						resolve(true);
					}
				},
			});
		});
	}, [showModal]);

	const value = {
		showModal,
		hideModal,
		alert,
		confirm,
	};

	return (
		<ModalContext.Provider value={value}>
			{children}
			<Modal
				isOpen={modal.isOpen}
				onClose={hideModal}
				title={modal.title}
				message={modal.message}
				type={modal.type}
				confirmText={modal.confirmText}
				cancelText={modal.cancelText}
				showCancel={modal.showCancel}
				onConfirm={modal.onConfirm}
			/>
		</ModalContext.Provider>
	);
}

export function useModal() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within ModalProvider');
	}
	return context;
}

