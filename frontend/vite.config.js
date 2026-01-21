import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Necesario para que funcione en Docker
    port: 5173,
    watch: {
      usePolling: true // Para que detecte cambios en Windows
    }
  }
});