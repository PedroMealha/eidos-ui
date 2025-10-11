import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // No need for additionalData since we're using CSS custom properties (:root variables)
  // and SCSS mixins are imported directly in component files with @use
});

