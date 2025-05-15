/**
 * Vite构建配置文件
 * 配置库的打包选项，包括输出格式、文件名、插件等
 */

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // 库模式配置
    lib: {
      // 入口文件路径
      entry: resolve(__dirname, 'src/index.ts'),
      // 全局变量名，当输出格式为UMD/IIFE时使用
      name: 'MapTree',
      // 输出文件名格式化函数
      fileName: (format) => {
        if (format === 'es') return 'map-tree.mjs';       // ES模块格式
        if (format === 'umd') return 'map-tree.umd.js';   // 通用模块定义格式
        return 'map-tree.js';                             // CommonJS格式
      },
      // 需要输出的格式
      formats: ['es', 'umd', 'cjs']
    },
    // 是否生成sourcemap文件
    sourcemap: true,
    // 是否压缩代码及使用的压缩器
    minify: 'terser',
    // 输出目录
    outDir: 'dist'
  },
  plugins: [
    // TypeScript声明文件生成插件
    dts({
      // 包含的文件
      include: ['src/**/*.ts'],
      // 排除的文件
      exclude: ['src/**/*.test.ts'],
      // 输出目录
      outDir: 'dist'
    })
  ],
  resolve: {
    // 导入时自动解析的扩展名
    extensions: ['.ts', '.js']
  }
}); 