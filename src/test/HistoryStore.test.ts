import { act } from '@testing-library/react';
import {
	describe,
	beforeEach,
	it,
	expect,
	vi
} from 'vitest'; // Ensure you're importing from 'vitest'

import { HistoryStore } from 'src/lib/index';
import {
	createNewUrlWithSearch,
	parseParams,
	parseSearch,
	parseSearchParams
} from 'src/lib/utils';

describe('HistoryStore', () => {
	const mockHref = 'http://localhost:3000/';
	beforeEach(() => {
		// Reset the HistoryStore for every test
		HistoryStore.notification.clear();
		// Mock the whole window.location
		window.location.assign(mockHref);
	});

	it('should set window.location.href', () => {
		window.location.href = mockHref; // Simulate setting location

		expect(window.location.href).toBe(mockHref); // Check the value
	});
	
	it('should initialize with the current URL and action as initial', () => {
		const storeValue = HistoryStore.getValue();
		expect(storeValue[0].href).toBe(window.location.href); // Current URL
		expect(storeValue[1]).toBe('initial'); // Initial action
	});

	it('should subscribe to URL changes', () => {
		const mockCallback = vi.fn(); // Mock callback

		const unsubscribe = HistoryStore.subscribe(mockCallback);

		act(() => {
			// Simulate history `popstate` event instead of a custom event
			const newUrl = new URL(mockHref);
			window.history.pushState({}, '', newUrl);
			window.dispatchEvent(new PopStateEvent('popstate')); // Use PopStateEvent for URL changes
		});

		expect(mockCallback).toHaveBeenCalledTimes(2); // Ensure the callback is called exactly twice

		// Cleanup subscription
		unsubscribe();
	});

	it('should handle navigation events', () => {
		const newUrl = new URL(mockHref);

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
		const replaceUrl = new URL(mockHref); // Use same-origin URL

		const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
		act(() => {
			HistoryStore.navigate(replaceUrl, {
				replace: true,
				action: 'replace'
			});
		});
		const storeValue = HistoryStore.getValue();
		expect(storeValue[0].href).toBe(replaceUrl.href); // Replaced URL
		expect(storeValue[1]).toBe('push'); // Action

		replaceStateSpy.mockRestore(); // Cleanup mock
	});
});

describe('createNewUrlWithSearch', () => {
	it('should update search parameters without changing the hash', () => {
		const url = new URL('http://localhost:3000/page#section');
		const newSearch = 'key=value';
  
		const updatedUrl = createNewUrlWithSearch(url, newSearch);
		expect(updatedUrl.search).toBe(`?${newSearch}`);
		expect(updatedUrl.hash).toBe('#section'); // Hash should remain unchanged
	});
  
	it('should update search parameters and hash if hash flag is true', () => {
		const url = new URL('http://localhost:3000/page#section');
		const newSearch = 'key=value';
		const updatedUrl = createNewUrlWithSearch(url, newSearch, true);
		const expectedHash = `#/section?key=value`;
		expect(updatedUrl.search).toBe(''); // needs to be empty
		expect(updatedUrl.hash).toBe(expectedHash);
	});
  
	it('should update only the hash if hash flag is true and hash is present', () => {
		const url = new URL('http://localhost:3000/page#section');
		const newSearch = 'key=value';
  
		const updatedUrl = createNewUrlWithSearch(url, newSearch, true);
		const expectedHash = `#/section?${newSearch}`;
		expect(updatedUrl.hash).toBe(expectedHash);
	});
  
	it('should not change the URL if hash flag is false and URL has no hash', () => {
		const url = new URL('http://localhost:3000/page');
		const newSearch = 'key=value';
  
		const updatedUrl = createNewUrlWithSearch(url, newSearch, false);
		expect(updatedUrl.search).toBe(`?${newSearch}`);
		expect(updatedUrl.hash).toBe('');
	});
});

describe('parseParams', () => {
	it('should correctly parse a simple object', () => {
		const params = {
			key: 'value' 
		};
		expect(parseParams(params)).toBe('?key=value');
	});
  
	it('should correctly parse a nested object', () => {
		const params = {
			key: {
				subKey: 'subValue' 
			} 
		};
		expect(parseParams(params)).toBe('?key.subKey=subValue');
	});
  
	it('should correctly parse an array', () => {
		const params = {
			key: ['value1', 'value2'] 
		};
		// the value as encoding...
		expect(parseParams(params)).toBe('?key%5B0%5D=value1&key%5B1%5D=value2');
	});
  
	it('should handle ignored values', () => {
		const params = {
			key: new Map(),
			anotherKey: undefined,
			functionKey: () => {} 
		};
		expect(parseParams(params)).toBe('');
	});
  
	it('should handle Date objects correctly', () => {
		const date = new Date('2024-09-01T00:00:00Z');
		const params = {
			dateKey: date 
		};
		expect(parseParams(params)).toBe(`?dateKey=${encodeURIComponent(date.toISOString())}`);
	});
});

describe('parseSearch', () => {
	it('should parse simple search strings into objects', () => {
		const search = '?key=value&foo=bar';
		const result = parseSearch(search);
		expect(result).toEqual({
			key: 'value',
			foo: 'bar' 
		});
	});
  
	it('should parse nested objects from search strings', () => {
		const search = '?foo.bar=baz&foo.baz=qux';
		const result = parseSearch(search);
		expect(result).toEqual({
			foo: {
				bar: 'baz',
				baz: 'qux' 
			} 
		});
	});
  
	it('should parse arrays from search strings', () => {
		const search = '?items[0]=first&items[1]=second';
		const result = parseSearch(search);
		expect(result).toEqual({
			items: ['first', 'second'] 
		});
	});
  
	it('should apply default parameters', () => {
		const search = '?key=value';
		const result = parseSearch(search, {
			defaultKey: 'defaultValue' 
		});
		expect(result).toEqual({
			defaultKey: 'defaultValue',
			key: 'value' 
		});
	});
  
	it('should handle invalid date strings', () => {
		const search = '?date=invalid-date';
		const result = parseSearch(search);
		expect(result.date).toBe('invalid-date'); // Invalid date should remain as string
	});
  
	it('should correctly parse numeric values', () => {
		const search = '?count=123&negativeCount=-456';
		const result = parseSearch(search);
		expect(result.count).toBe(123);
		expect(result.negativeCount).toBe(-456);
	});
  
	it('should correctly parse boolean values', () => {
		const search = '?isTrue=true&isFalse=false';
		const result = parseSearch(search);
		expect(result.isTrue).toBe(true);
		expect(result.isFalse).toBe(false);
	});
});
  
describe('parseSearchParams', () => {
	it('should parse search params into primitive values', () => {
		const searchParams = new URLSearchParams('?key=value&count=123');
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({
			key: 'value',
			count: 123 
		});
	});
  
	it('should create nested objects from dot notation', () => {
		const searchParams = new URLSearchParams('?foo.bar=baz');
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({
			foo: {
				bar: 'baz' 
			} 
		});
	});
  
	it('should create nested objects from array notation', () => {
		const searchParams = new URLSearchParams('?items[0]=first&items[1]=second');
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({
			items: ['first', 'second'] 
		});
	});
  
	it('should apply default parameters', () => {
		const searchParams = new URLSearchParams('?key=value');
		const result = parseSearchParams(searchParams, {
			defaultKey: 'defaultValue' 
		});
		expect(result).toEqual({
			defaultKey: 'defaultValue',
			key: 'value' 
		});
	});
  
	it('should decode date strings correctly', () => {
		const date = new Date('2024-09-01T00:00:00Z').toISOString();
		const searchParams = new URLSearchParams(`?date=${encodeURIComponent(date)}`);
		const result = parseSearchParams(searchParams);
		expect(result.date).toEqual(new Date(date));
	});
  
	it('should handle invalid date strings', () => {
		const searchParams = new URLSearchParams('?date=invalid-date');
		const result = parseSearchParams(searchParams);
		expect(result.date).toBe('invalid-date'); // Invalid date should remain as string
	});
});
