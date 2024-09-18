/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import fs from 'fs';

import { defineLibConfig } from './config/defineLibConfig';

// https://vitejs.dev/config/
export default defineLibConfig(
	() => ({
		plugins: [
			react()
		],
		test: {
			coverage: {
				exclude: ['config', 'src/App.tsx', 'src/main.tsx', '.eslintrc.cjs', 'vite.config.ts']
			}
		}
	}),
	() => {
		const indexDFilepath = './dist/index.d.ts';
		const content = fs.readFileSync(indexDFilepath, 'utf-8');
		const globalEventsContent = fs.readFileSync('./src/lib/GlobalEvents.ts', 'utf-8');

		fs.writeFileSync(indexDFilepath, `${content}${globalEventsContent}`, 'utf-8');
	}
);
