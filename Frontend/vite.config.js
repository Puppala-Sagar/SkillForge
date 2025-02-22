import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     https: true,
//   },
// })
export default defineConfig({
  server: {
    host: true,  // Allows access from network
    port: 5173,
    https: false,  // Disable HTTPS
  }
});
