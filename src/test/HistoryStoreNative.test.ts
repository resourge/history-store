import { act } from '@testing-library/react';
import {
	describe,
	it,
	expect,
	vi,
	beforeEach
} from 'vitest';

import { History } from 'src/lib/native/index.native';
import HistoryStore from 'src/lib/store/HistoryStore.native';

// Mock the entire module
vi.mock('react-native', () => ({
	Image: {},
	BackHandler: {
		exitApp: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}
	// Include other parts if necessary
}));

const mockHrefNative = 'http://localhost:3000';

describe('HistoryStore Native', () => { 
	beforeEach(() => {
		// Reset the HistoryStore for every test
		HistoryStore.notification.clear();
		// Mock the whole window.location
		window.location.assign(mockHrefNative);
	});

	it('should handle navigation events', () => {
		const newUrl = new URL(mockHrefNative);

		act(() => {
			HistoryStore.navigate(newUrl, {
				action: 'push',
				replace: false
			});
		});

		const storeValue = HistoryStore.getValue();
		expect(storeValue[0].href).toBe(newUrl.href); // New URL
		expect(storeValue[1]).toBe('push'); // Action
	});

	it('should replace the URL if replace option is true', () => {
		const replaceUrl = new URL(mockHrefNative); // Use same-origin URL

		const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
		act(() => {
			HistoryStore.navigate(replaceUrl, {
				replace: true,
				action: 'replace'
			});
		});
		const storeValue = HistoryStore.getValue();
		expect(storeValue[0].href).toBe(replaceUrl.href); // Replaced URL
		expect(storeValue[1]).toBe('replace'); // Action

		replaceStateSpy.mockRestore(); // Cleanup mock
	});
});

describe('History', () => {
	// Initial URL and state setup
	const initialUrl = 'http://localhost/';
	const newUrl = 'http://localhost/new';
	const testUrl = new URL(newUrl);
    
	beforeEach(() => {
		// Reset state and history before each test
		History.initial(initialUrl); // Reset to initial URL
	});

	it('should initialize with the correct URL and action', () => {
		expect(History.state.url.href).toBe(initialUrl);
		expect(History.state.action).toBe('replace');
	});

	it('should navigate with push action', () => {
		History.navigate(testUrl, {
			action: 'push' 
		});

		expect(History.state.url.href).toBe(testUrl.href);
		expect(History.state.action).toBe('push');
	});

	it('should navigate with replace action', () => {
		History.navigate(testUrl, {
			replace: true,
			action: 'replace' 
		});

		expect(History.state.url.href).toBe(testUrl.href);
		expect(History.state.action).toBe('replace');
	});

	it('should navigate with stack action', () => {
		History.navigate(testUrl, {
			action: 'stack' 
		});

		expect(History.state.url.href).toBe(testUrl.href);
		expect(History.state.action).toBe('stack');
	});

	it('should pop the history correctly', () => {
		History.navigate(testUrl, {
			action: 'push' 
		});
		History.goBack(); // Simulate back navigation

		expect(History.state.url.href).toBe(initialUrl);
		expect(History.state.action).toBe('pop');
	});

	it('should handle URLChange event', () => {
		const mockCallback = vi.fn();
		const unsubscribe = History.addEventListener('URLChange', mockCallback);

		History.navigate(testUrl, {
			action: 'push' 
		});

		expect(mockCallback).toHaveBeenCalled();
		expect(mockCallback.mock.calls[0][0].url.href).toBe(testUrl.href);
		expect(mockCallback.mock.calls[0][0].action).toBe('push');

		unsubscribe(); // Clean up
	});

	it('should handle beforeURLChange event and prevent navigation', () => {
		History.addEventListener('beforeURLChange', (current, next) => {
			next(); // Allow the navigation
			return false; // Prevent navigation
		});

		History.navigate(testUrl, {
			action: 'push' 
		});

		expect(History.state.url.href).toBe(`${initialUrl}new`); // Should not change
		expect(History.state.action).toBe('push'); // Should not change
	});

	it('should initialize with a given route', () => {
		const newRoute = 'http://localhost/another';
		History.initial(newRoute);
        
		expect(History.state.url.href).toBe(newRoute);
	});
});
