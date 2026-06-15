import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideNav from '../components/SideNav.jsx';
import { FiUser, FiFileText, FiImage, FiPlus, FiX } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import '../assets/css/AddServiceForm.css';

export default function AddServiceForm() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEditMode = !!id;
	const [formData, setFormData] = useState({
		name: '',
		description: '',
	});
	const [subcategories, setSubcategories] = useState([]);
	const [originalSubcategories, setOriginalSubcategories] = useState([]); // Track original subcategories for comparison
	const [newSubcategoryName, setNewSubcategoryName] = useState('');
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState('');

	// Fetch service data when in edit mode
	useEffect(() => {
		if (isEditMode && id) {
			fetchServiceData();
		}
	}, [id, isEditMode]);

	const fetchServiceData = async () => {
		try {
			setFetching(true);
			setError('');
			const response = await adminAPI.getService(id);
			const service = response.data;

			// Populate form with service data
			setFormData({
				name: service.name || '',
				description: service.description || '',
			});

			// Populate subcategories
			if (service.subcategories && Array.isArray(service.subcategories)) {
				const subcats = service.subcategories.map((sub) => ({
					id: sub.id,
					name: sub.name,
				}));
				setSubcategories(subcats);
				setOriginalSubcategories(subcats); // Store original for comparison
			} else {
				setSubcategories([]);
				setOriginalSubcategories([]);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load service data');
			console.error('Error fetching service:', err);
		} finally {
			setFetching(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddSubcategory = () => {
		if (newSubcategoryName.trim()) {
			setSubcategories([...subcategories, { id: Date.now(), name: newSubcategoryName.trim() }]);
			setNewSubcategoryName('');
		}
	};

	const handleRemoveSubcategory = (id) => {
		setSubcategories(subcategories.filter((sub) => sub.id !== id));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		if (!formData.name.trim()) {
			setError('Service name is required');
			setLoading(false);
			return;
		}

		try {
			if (isEditMode) {
				// Update existing service
				await adminAPI.updateService(id, {
					name: formData.name,
					description: formData.description,
				});

				// Handle subcategories separately
				// Find new subcategories (those not in original list)
				const originalIds = new Set(originalSubcategories.map((sub) => sub.id));
				const newSubcategories = subcategories.filter((sub) => !originalIds.has(sub.id));

				// Create new subcategories
				if (newSubcategories.length > 0) {
					await Promise.all(
						newSubcategories.map((sub) =>
							adminAPI.createSubcategory({
								name: sub.name,
								service_id: id,
							})
						)
					);
				}

				navigate('/ServiceDashboard');
			} else {
				// Create new service
				const response = await adminAPI.createService({
					name: formData.name,
					description: formData.description,
				});

				// Create subcategories if any were added
				if (subcategories.length > 0) {
					const serviceId = response.data.id || response.data.data?.id;
					if (serviceId) {
						// Create all subcategories for this service
						await Promise.all(
							subcategories.map((sub) =>
								adminAPI.createSubcategory({
									name: sub.name,
									service_id: serviceId,
								})
							)
						);
					}
				}

				navigate('/ServiceDashboard');
			}
		} catch (err) {
			setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} service`);
			console.error(`Error ${isEditMode ? 'updating' : 'creating'} service:`, err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page page-centered">
			<SideNav />
			<motion.section
				className="card page-card container service-form-wrapper"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.35 }}
			>
				<div className="service-form-container">
					<div className="service-form-header">
						<h2 className="page-title">{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
						<div className="service-illustration">
							<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="20" y="30" width="60" height="70" rx="4" fill="#E2ECF0" stroke="#19435B" strokeWidth="2" />
								<line x1="30" y1="50" x2="70" y2="50" stroke="#19435B" strokeWidth="2" strokeLinecap="round" />
								<line x1="30" y1="65" x2="70" y2="65" stroke="#19435B" strokeWidth="2" strokeLinecap="round" />
								<line x1="30" y1="80" x2="60" y2="80" stroke="#19435B" strokeWidth="2" strokeLinecap="round" />
								<circle cx="85" cy="65" r="15" fill="#19435B" />
								<path d="M85 55 L85 75 M80 60 L90 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</div>
					</div>
					{(fetching || error) && (
						<div style={{ color: fetching ? '#19435B' : 'red', marginBottom: 16, padding: '12px', background: fetching ? '#f1f6f8' : '#ffebee', borderRadius: '4px' }}>
							{fetching ? 'Loading service data...' : error}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="service-form-grid">
							<div className="form-row input-with-icon">
								<input
									className="input"
									placeholder="Service Name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
									disabled={loading || fetching}
								/>
								<div className="input-icon">
									<FiUser />
								</div>
							</div>
							<div className="form-row input-with-icon textarea-row">
								<textarea
									className="textarea"
									placeholder="Description"
									rows="4"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									disabled={loading || fetching}
								/>
								<div className="input-icon">
									<FiFileText />
								</div>
							</div>
							<div className="form-row input-with-icon upload-row">
								<input
									type="file"
									className="input file-input"
									placeholder="Upload Image"
									accept="image/*"
									onChange={handleImageChange}
									disabled={loading || fetching}
								/>
								<div className="input-icon image-preview">
									{imagePreview ? <img src={imagePreview} alt="Preview" /> : <FiImage />}
								</div>
							</div>
							<div className="form-row subcategories-row">
								<label className="label" style={{ marginBottom: '8px' }}>
									Subcategories (Optional)
								</label>
								<div className="subcategories-input-group">
									<input
										type="text"
										className="input"
										placeholder="Enter subcategory name"
										value={newSubcategoryName}
										onChange={(e) => setNewSubcategoryName(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleAddSubcategory();
											}
										}}
										disabled={loading}
									/>
									<button
										type="button"
										className="btn btn-add-subcategory"
										onClick={handleAddSubcategory}
										disabled={loading || fetching || !newSubcategoryName.trim()}
									>
										<FiPlus />
									</button>
								</div>
								{subcategories.length > 0 && (
									<div className="subcategories-list">
										{subcategories.map((sub) => (
											<span key={sub.id} className="subcategory-tag">
												{sub.name}
												<button
													type="button"
													className="subcategory-remove"
													onClick={() => handleRemoveSubcategory(sub.id)}
													disabled={loading || fetching}
												>
													<FiX />
												</button>
											</span>
										))}
									</div>
								)}
							</div>
						</div>
						<div className="actions">
							<button type="submit" className="btn" disabled={loading || fetching}>
								{loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Service' : 'Add Service')}
							</button>
							<button type="button" className="btn secondary" onClick={() => navigate('/services')} disabled={loading || fetching}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</motion.section>
		</div>
	);
}
