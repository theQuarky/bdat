import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative (not root-absolute) asset paths — this repo has a Jekyll
  // _config.yml and deploys as a GitHub Pages *project* page
  // (thequarky.github.io/bdat/), a subpath, not the domain root. With the
  // default '/' base, built <script>/<link> tags point at
  // /assets/... which 404s once served from /bdat/assets/... instead.
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    middlewareMode: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  build: {
    sourcemap: true,
  },
});
