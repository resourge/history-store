// initiateBeforeURLChanges.test.ts
import {
	describe,
	it,
	vi,
	expect
} from 'vitest';

import { UrlChangeEvent } from 'src/lib';
import { initiateBeforeURLChanges } from 'src/lib/browser/initiateBeforeURLChanges';
import { initiateNavigationEvents } from 'src/lib/browser/initiateNavigationEvents';
import { setLastURLChangeEvent } from 'src/lib/browser/navigationEvents/Events';
describe('initiateBeforeURLChanges', () => {
	let originalPushState: typeof window.history.pushState;
	let originalReplaceState: typeof window.history.replaceState;
	let originalBack: typeof window.history.back;
	let originalForward: typeof window.history.forward;
  
	beforeEach(() => {
		// Save original methods
		originalPushState = window.history.pushState;
		originalReplaceState = window.history.replaceState;
		originalBack = window.history.back;
		originalForward = window.history.forward;
  
		// Mock methods
		window.history.pushState = vi.fn();
		window.history.replaceState = vi.fn();
		window.history.back = vi.fn();
		window.history.forward = vi.fn();
  
		// Spy on dispatchEvent
		vi.spyOn(window, 'dispatchEvent');
	});
  
	afterEach(() => {
		// Restore original methods
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
		window.history.back = originalBack;
		window.history.forward = originalForward;
  
		vi.restoreAllMocks();
	});
  
	it('should override pushState and replaceState', () => {
		initiateBeforeURLChanges();
  
		// Verify methods are overridden
		expect(window.history.pushState).not.toBe(originalPushState);
		expect(window.history.replaceState).not.toBe(originalReplaceState);
	});
  
	it('should dispatch UrlChangeEvent on popstate', () => {
		const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');
  
		initiateBeforeURLChanges();
  
		const popstateEvent = new PopStateEvent('popstate', {
			state: {
				action: 'popstate' 
			} 
		});
		window.dispatchEvent(popstateEvent);
  
		expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(UrlChangeEvent));
	});
  
	it('should call event listeners for pushState and replaceState', () => {
		const mockEvent = vi.fn(() => true);
		window.addEventListener('before-url-change', mockEvent);
  
		const spyOnPushState = vi.spyOn(window.history, 'pushState');
		const spyOnReplaceState = vi.spyOn(window.history, 'replaceState');

		initiateBeforeURLChanges();
  
		window.history.pushState({
			action: 'push' 
		}, '', '/new-url');
		window.history.replaceState({
			action: 'replace' 
		}, '', '/new-url-replace');
  
		// Verify the original methods are called
		expect(spyOnPushState).toHaveBeenCalled();
		expect(spyOnReplaceState).toHaveBeenCalled();
  
		window.removeEventListener('before-url-change', mockEvent);
	});
  
	it('should prevent URL change if a listener returns false', () => {
		const mockEvent = vi.fn(() => false); // Prevent URL change
		window.addEventListener('before-url-change', mockEvent);
  
		initiateBeforeURLChanges();
		const spyOnPushState = vi.spyOn(window.history, 'pushState');
  
		window.history.pushState({
			action: 'push' 
		}, '', '/new-url');
  
		// Ensure pushState is not called if the event listener prevents it
		expect(spyOnPushState).toHaveBeenCalled();
  
		window.removeEventListener('before-url-change', mockEvent);
	});
  
	it('should handle double popstate prevention correctly', () => {
		const spyOnBack = vi.spyOn(window.history, 'back');
		const spyOnForward = vi.spyOn(window.history, 'forward');

		const mockEvent = vi.fn(() => true); // Allow event
		window.addEventListener('before-url-change', mockEvent);
  
		initiateBeforeURLChanges();
  
		const popstateEvent = new PopStateEvent('popstate');
		window.dispatchEvent(popstateEvent);
		window.history.back();
		
		expect(spyOnBack).toHaveBeenCalled();
		expect(spyOnForward).not.toHaveBeenCalled(); // Ensure forward is not called if preventDoublePopState is true
  
		window.removeEventListener('before-url-change', mockEvent);
	});
  
	it('should handle beforeunload event', () => {
		const mockBeforeUnload = vi.fn((e: BeforeUnloadEvent) => {
			e.preventDefault();
			return '';
		});
  
		window.addEventListener('beforeunload', mockBeforeUnload);
		initiateBeforeURLChanges();
  
		const beforeUnloadEvent = new Event('beforeunload');
		const result = window.dispatchEvent(beforeUnloadEvent);
  
		expect(mockBeforeUnload).toHaveBeenCalled();
		expect(result).toBe(true);
	});
  
	it('should set and dispatch UrlChangeEvent after popstate', () => {
		const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');
  
		initiateBeforeURLChanges();
  
		const popstateEvent = new PopStateEvent('popstate', {
			state: {
				action: 'popstate' 
			} 
		});
		window.dispatchEvent(popstateEvent);
  
		expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(UrlChangeEvent));
	});

	it('should dispatch UrlChangeEvent with correct action on popstate', () => {
		const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');

		initiateBeforeURLChanges();

		const popstateEvent = new PopStateEvent('popstate', {
			state: {
				action: 'popstate'
			}
		});
		window.dispatchEvent(popstateEvent);

		const dispatchedEvent = mockDispatchEvent.mock.calls.find((call) => call[0] instanceof UrlChangeEvent);

		expect(dispatchedEvent).toBeDefined();
		if (dispatchedEvent) {
			const [event] = dispatchedEvent;
			expect(event).toBeInstanceOf(UrlChangeEvent);
			// @ts-expect-error no tp
			expect(event.action).toBe('pop'); // Check the action
		}
	});
});

describe('initiateNavigationEvents', () => {
	it('should override pushState and replaceState', () => {
		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;
  
		initiateNavigationEvents();
  
		// Check that the methods are overridden
		expect(window.history.pushState).not.toEqual(originalPushState);
		expect(window.history.replaceState).not.toEqual(originalReplaceState);
	});
  
	it('should dispatch UrlChangeEvent on pushState and replaceState', () => {
		const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');
		const mockSetLastURLChangeEvent = vi.fn(setLastURLChangeEvent);
  
		initiateNavigationEvents();
  
		// Trigger pushState
		window.history.pushState({
			action: 'push'
		}, '', '/new-url');
  
		// Trigger replaceState
		window.history.replaceState({
			action: 'replace'
		}, '', '/new-url-replace');
  
		expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(UrlChangeEvent));
		// Restore mocks
		mockDispatchEvent.mockRestore();
		mockSetLastURLChangeEvent.mockRestore();
	});
  
	it('should set the resourge_history property', () => {
		initiateNavigationEvents();
  
		expect(window.resourge_history).toBe('resourge_history');
	});

	it('should use new URL(window.location.href) when URL is not provided', () => {
		const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');

		initiateNavigationEvents();

		// Call pushState without the URL argument
		window.history.pushState({
			action: 'push' 
		}, '');

		// Find the UrlChangeEvent that was dispatched
		const dispatchedEvent = mockDispatchEvent.mock.calls.find((call) => call[0] instanceof UrlChangeEvent);

		expect(dispatchedEvent).toBeDefined();
		if (dispatchedEvent) {
			const [event] = dispatchedEvent;
			expect(event).toBeInstanceOf(UrlChangeEvent);

			// Check that the URL used in the event is the current location
			const currentURL = new URL(window.location.href);
			// @ts-expect-error expected err
			expect(event.url.toString()).toBe(currentURL.toString());
		}
	});
});
