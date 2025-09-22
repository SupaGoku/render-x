import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import pkg from './package.json' with { type: 'json' }

const banner = `/*!
* ${pkg.name} v${pkg.version} (${new Date().toISOString()})
*/`

const createJsBundle = (input, fileBase) => ({
  input,
  output: [
    {
      file: `dist/${fileBase}.js`,
      format: 'module',
      sourcemap: true,
      banner,
    },
    {
      file: `dist/${fileBase}.min.js`,
      format: 'module',
      sourcemap: true,
      compact: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    esbuild({
      include: /\.[jt]s$/,
      exclude: /node_modules/,
      target: 'es2017',
      sourceMap: true,
      tsconfig: './tsconfig.json',
    }),
    commonjs(),
    nodeResolve({
      extensions: ['.ts', '.tsx', '.js'],
    }),
  ],
  external: ['csstype'],
})

const createDtsBundle = (input, fileBase) => ({
  input,
  output: {
    file: `dist/${fileBase}.d.ts`,
    format: 'es',
  },
  plugins: [dts()],
  external: ['csstype'],
})

const jsBundles = [createJsBundle('src/index.ts', 'index'), createJsBundle('src/jsx-runtime.ts', 'jsx-runtime')]
const dtsBundles = [createDtsBundle('src/index.ts', 'index'), createDtsBundle('src/jsx-runtime.ts', 'jsx-runtime')]

export default defineConfig([...jsBundles, ...dtsBundles])
