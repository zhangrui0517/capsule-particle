import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		minify: 'terser',
		target: ['es2015'],
		lib: {
			entry: './src/index.ts',
			formats: ['cjs', 'es', 'umd'],
			name: 'capsule-particle',
			fileName: 'index'
		},
		rollupOptions: {
			external: []
		}
	}
})
