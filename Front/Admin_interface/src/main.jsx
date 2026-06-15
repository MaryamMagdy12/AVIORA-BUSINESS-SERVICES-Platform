import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import App from './App.jsx';
import './styles/global.css';

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
	<React.StrictMode>
		<BrowserRouter basename="/admin">
			<AuthProvider>
				<ModalProvider>
					<App />
				</ModalProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);


