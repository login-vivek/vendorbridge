import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  base: '/vendorbridge/',   // matches https://login-vivek.github.io/vendorbridge/
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
