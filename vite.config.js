import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    root: resolve(__dirname, 'src/client'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/client/index.html'),
          dashboard: resolve(__dirname, 'src/client/dashboard.html'),
        },
      },
    },
    define: {
      'process.env': env
    }
  }
})