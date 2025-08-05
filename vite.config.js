import { response } from 'express'
import { resolve } from 'path' 
import { defineConfig } from 'vite'

export default defineConfig({
    root: resolve(__dirname, 'src/client'),
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/client/index.html'),
                dashboard: resolve(__dirname, 'src/client/dashboard.html')
            }
        }
    }
})