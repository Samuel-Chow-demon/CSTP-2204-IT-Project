import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from network
    port: 5173, // Ensure it's using the right port
    strictPort: true, // Ensures it doesn’t change ports
    cors: true, // Allow cross-origin requests
    allowedHosts: ['.loca.lt'], // Allow all LocalTunnel hosts
  }
});
