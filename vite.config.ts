import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const typePath = resolve(process.cwd(), './typings/index.d.ts')
const distPath = resolve(process.cwd(), './dist')

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: typePath,
					dest: distPath
				}
			]
		})
	],
	build: {
		target: ['es2015'],
		lib: {
			entry: './src/index.ts',
			formats: ['cjs', 'es', 'umd'],
			name: 'capsule-particle',
			fileName: 'index'
		},
		rollupOptions: {
			external: ['lodash-es'],
			output: {
				globals: {
					'lodash-es': '_'
				}
			}
		}
	}
})
