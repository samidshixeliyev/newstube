import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  servers:{
    host: '172.22.111.47',
    port: 5173
  },
  plugins: [react()],
})
