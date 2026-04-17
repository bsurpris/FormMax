import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Stub out @mediapipe/pose — we use MoveNet (tfjs runtime), not BlazePose
      '@mediapipe/pose': path.resolve(__dirname, 'src/stubs/mediapipe-pose.ts'),
    },
  },
})
