import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/video': 'http://localhost:8000',
      '/alerts': 'http://localhost:8000',
      '/telemetry': 'http://localhost:8000',
      '/detections': 'http://localhost:8000',
      '/camera': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    }
  }
})
