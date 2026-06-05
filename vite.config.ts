import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  // GitHub Pages serves from /odoo-hackathon/ — this makes all asset paths correct
  base: '/odoo-hackathon/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
