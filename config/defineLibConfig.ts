/* eslint-disable @typescript-eslint/consistent-type-assertions */
import deepmerge from '@fastify/deepmerge'
import cleanup from 'rollup-plugin-cleanup';
import { defineConfig, type UserConfig, type UserConfigExport } from 'vite'
import banner from 'vite-plugin-banner'
import { checker } from 'vite-plugin-checker'
import dts from 'vite-plugin-dts'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import PackageJson from '../package.json'

import { createBanner } from './createBanner'

const {
	dependencies = {}, devDependencies = {}, peerDependencies = {}
} = PackageJson as any;

const external = Array.from(
	new Set([
		'react/jsx-runtime',
		...Object.keys(peerDependencies),
		...Object.keys(dependencies),
		...Object.keys(devDependencies)
	]).values()
)

const entryLib = './src/lib/index.ts';
const entryNativeLib = './src/lib/index.native.ts';
const entryUtilsLib = './src/lib/index.utils.ts';

const deepMerge = deepmerge();

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => void | Promise<void>)
): UserConfigExport => defineConfig((originalConfig) => deepMerge(
	typeof config === 'function' ? config(originalConfig) : config,
	{
		define: originalConfig.mode !== 'production' ? {
			__DEV__: (originalConfig.mode === 'development').toString()
		} : {},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/setupTests.ts'
		},
		build: {
			minify: false,
			lib: {
				entry: {
					index: entryLib,
					'index.native': entryNativeLib,
					'index.utils': entryUtilsLib
				},
				name: 'index',
				fileName: 'index',
				formats: ['es']
			},
			sourcemap: true,
			outDir: './dist',
			rollupOptions: {
				output: {
					dir: './dist',
					inlineDynamicImports: false,
					preserveModules: true,
					entryFileNames: '[name].js' // Ensures main file name does not have an extension
					// chunkFileNames: (chunkInfo) => chunkInfo.name.split('lib/')[1]
				},
				external,
				plugins: [
					cleanup({
						extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx']
					})
				]
			}
		},
		plugins: [
			banner(createBanner()),
			viteTsconfigPaths(),
			checker({ 
				typescript: true,
				enableBuild: true,
				overlay: {
					initialIsOpen: false
				},
				eslint: {
					lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
				}
			}),
			dts({
				insertTypesEntry: true,

				exclude: [
					'**/*.test*',
					'./src/App.tsx',
					'./src/main.tsx',
					'./src/setupTests.ts'
				],
				afterBuild
			}),
			{
				name: 'remove-file-extensions',
				generateBundle(_, bundle) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					for (const [_, value] of Object.entries(bundle)) {
						if (value.type === 'chunk') {
							value.code = value.code.replace(/(?<=import\s+.*?['"])([^'"]+)\.js(?=['"])/g, '$1');
						}
					}
				}
			}
		]
	} as UserConfig
));
