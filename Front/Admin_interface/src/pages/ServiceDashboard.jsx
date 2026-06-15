import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiX, FiCheck, FiPlus } from 'react-icons/fi';
import SideNav from '../components/SideNav.jsx';
import { adminAPI } from '../services/api.js';
import { extractPaginated } from '../utils/pagination';
import { useModal } from '../context/ModalContext';
import '../assets/css/ServiceDashboard.css';

export default function ServiceDashboard() {
	const navigate = useNavigate();
	const { alert, confirm, showModal } = useModal();
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [editingSubcategory, setEditingSubcategory] = useState(null); // { serviceId: serviceId, subcategoryId: subcategoryId }
	const [newSubcategoryName, setNewSubcategoryName] = useState('');

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await adminAPI.getServices();
			const { data } = extractPaginated(response.data);
			setServices(data);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load services');
			console.error('Error fetching services:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		const confirmed = await confirm(
			'Are you sure you want to delete this service?',
			'Delete Service',
			'warning'
		);
		if (!confirmed) {
			return;
		}

		try {
			await adminAPI.deleteService(id);
			fetchServices(); // Refresh list
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to delete service', 'Error', 'error');
			console.error('Error deleting service:', err);
		}
	};

	const handleEditSubcategory = (serviceId, subcategoryId, currentName) => {
		setEditingSubcategory({ serviceId, subcategoryId });
		setNewSubcategoryName(currentName);
	};

	const handleCancelEdit = () => {
		setEditingSubcategory(null);
		setNewSubcategoryName('');
	};

	const handleSaveSubcategory = async (serviceId, subcategoryId) => {
		if (!newSubcategoryName.trim()) {
			await alert('Subcategory name cannot be empty', 'Validation Error', 'warning');
			return;
		}

		try {
			await adminAPI.updateSubcategory(subcategoryId, { name: newSubcategoryName.trim() });
			fetchServices(); // Refresh list
			setEditingSubcategory(null);
			setNewSubcategoryName('');
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to update subcategory', 'Error', 'error');
			console.error('Error updating subcategory:', err);
		}
	};

	const handleDeleteSubcategory = async (serviceId, subcategoryId, subcategoryName) => {
		const confirmed = await confirm(
			`Are you sure you want to delete "${subcategoryName}"?`,
			'Delete Subcategory',
			'warning'
		);
		if (!confirmed) {
			return;
		}

		try {
			await adminAPI.deleteSubcategory(subcategoryId);
			fetchServices(); // Refresh list
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to delete subcategory', 'Error', 'error');
			console.error('Error deleting subcategory:', err);
		}
	};

	const handleAddSubcategory = async (serviceId) => {
		// Use browser prompt for now - can be enhanced with a custom input modal later
		const name = window.prompt('Enter subcategory name:');
		if (!name || !name.trim()) {
			return;
		}

		try {
			await adminAPI.createSubcategory({
				name: name.trim(),
				service_id: serviceId,
			});
			fetchServices(); // Refresh list
		} catch (err) {
			await alert(err.response?.data?.message || 'Failed to create subcategory', 'Error', 'error');
			console.error('Error creating subcategory:', err);
		}
	};

	if (loading) {
		return (
			<div className="page">
				<SideNav />
				<div style={{ padding: '40px', textAlign: 'center' }}>Loading services...</div>
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
				<div className="header">
					<h2 className="page-title" style={{ fontSize: 40 }}>Service Dashboard</h2>
					<button className="btn" onClick={() => navigate('/add-service')}>
						Add New Service
					</button>
				</div>
				{error && (
					<div style={{ color: 'red', marginBottom: 16, padding: '12px', background: '#ffebee', borderRadius: '4px' }}>
						{error}
					</div>
				)}
				<div className="grid cards">
					{services.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center' }}>No services found</div>
					) : (
						services.map((service) => (
							<motion.div
								key={service.id}
								className="card service"
								whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,.14)' }}
							>
								<h4>{service.name}</h4>
								<p className="muted">{service.description || 'No description'}</p>
								<div className="tags">
									{service.subcategories?.map((sub) => {
										const isEditing = editingSubcategory?.serviceId === service.id && editingSubcategory?.subcategoryId === sub.id;
										return (
											<span key={sub.id} className="tag tag-editable">
												{isEditing ? (
													<div className="tag-edit-controls">
														<input
															type="text"
															value={newSubcategoryName}
															onChange={(e) => setNewSubcategoryName(e.target.value)}
															onKeyPress={(e) => {
																if (e.key === 'Enter') {
																	handleSaveSubcategory(service.id, sub.id);
																} else if (e.key === 'Escape') {
																	handleCancelEdit();
																}
															}}
															className="tag-input"
															autoFocus
														/>
														<button
															className="tag-btn tag-btn-save"
															onClick={() => handleSaveSubcategory(service.id, sub.id)}
															title="Save"
														>
															<FiCheck />
														</button>
														<button
															className="tag-btn tag-btn-cancel"
															onClick={handleCancelEdit}
															title="Cancel"
														>
															<FiX />
														</button>
													</div>
												) : (
													<div className="tag-content">
														<span>{sub.name}</span>
														<button
															className="tag-btn taghandleEditSubcategory-btn-edit"
															onClick={() => (service.id, sub.id, sub.name)}
															title="Edit subcategory"
														>
															<FiEdit2 />
														</button>
														<button
															className="tag-btn tag-btn-delete"
															onClick={() => handleDeleteSubcategory(service.id, sub.id, sub.name)}
															title="Delete subcategory"
														>
															<FiX />
														</button>
													</div>
												)}
											</span>
										);
									})}
									<button
										className="tag tag-add"
										onClick={() => handleAddSubcategory(service.id)}
										title="Add subcategory"
									>
										<FiPlus />
									</button>
								</div>
								<div className="row">
									<button
										className="btn"
										style={{ padding: '8px 12px' }}
										onClick={() => navigate(`/add-service/${service.id}`)}
									>
										Edit
									</button>
									<button
										className="btn secondary"
										style={{ padding: '8px 12px' }}
										onClick={() => handleDelete(service.id)}
									>
										Delete
									</button>
								</div>
							</motion.div>
						))
					)}
				</div>
			</motion.section>
		</div>
	);
}
