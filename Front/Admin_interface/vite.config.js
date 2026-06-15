import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	base: '/admin/',
	build: {
		target: 'esnext',
		outDir: 'dist'
	},
	plugins: [react()],
	server: {
		port: 5173,
		open: false
	}
});

