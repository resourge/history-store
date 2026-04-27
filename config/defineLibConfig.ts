import deepmerge from '@fastify/deepmerge';
import cleanup from 'rollup-plugin-cleanup';
import { defineConfig, type UserConfig, type UserConfigExport } from 'vite';
import banner from 'vite-plugin-banner';
import { checker } from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

import PackageJson from '../package.json';

import { createBanner } from './createBanner';

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
);

const entryLib = './src/lib/index.ts';
const entryNativeLib = './src/lib/index.native.ts';
const entryUtilsLib = './src/lib/index.utils.ts';

const deepMerge = deepmerge();

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => Promise<void> | void)
): UserConfigExport => defineConfig((originalConfig) => deepMerge(
	typeof config === 'function'
		? config(originalConfig)
		: config,
	{
		build: {
			lib: {
				entry: {
					'index': entryLib,
					'index.native': entryNativeLib,
					'index.utils': entryUtilsLib
				},
				fileName: 'index',
				formats: ['es'],
				name: 'index'
			},
			minify: false,
			outDir: './dist',
			rollupOptions: {
				external,
				output: {
					dir: './dist',
					entryFileNames: '[name].js', // Ensures main file name does not have an extension
					inlineDynamicImports: false,
					preserveModules: true
					// chunkFileNames: (chunkInfo) => chunkInfo.name.split('lib/')[1]
				},
				plugins: [
					cleanup({
						extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx']
					})
				]
			},
			sourcemap: true
		},
		define: originalConfig.mode === 'production'
			? {}
			: {
				__DEV__: (originalConfig.mode === 'development').toString()
			},
		plugins: [
			banner(createBanner()),
			checker({ 
				enableBuild: true,
				eslint: {
					lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
				},
				overlay: {
					initialIsOpen: false
				},
				typescript: true
			}),
			dts({
				afterBuild,
				compilerOptions: {
					baseUrl: '.'
				},

				exclude: [
					'**/*.test*',
					'./src/App.tsx',
					'./src/main.tsx',
					'./src/setupTests.ts'
				],
				insertTypesEntry: true
			}),
			{
				generateBundle(_, bundle) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					for (const [_, value] of Object.entries(bundle)) {
						if (value.type === 'chunk') {
							value.code = value.code.replaceAll(/(?<=import\s+.*?['"])([^'"]+)\.js(?=['"])/g, '$1');
						}
					}
				},
				name: 'remove-file-extensions'
			}
		],
		resolve: {
			tsconfigPaths: true
		},
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: './src/setupTests.ts'
		}
	} as UserConfig
));
