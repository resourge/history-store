import { type UrlChangeEvent } from '../browser';
import { initiateNavigationEvents } from '../browser/initiateNavigationEvents';
import { EVENTS } from '../types/navigationActionType/BaseNavigationActionType';
import { type NavigationActionType } from '../types/navigationActionType/NavigationActionType';

export type NavigateOptions = {
	/**
	 * A way to specify the action
	 */
	action?: Exclude<NavigationActionType, 'initial'>
	/**
	 * Replaces path instead of push
	 * @default false
	 */
	replace?: boolean
};

export type StoreValue = [
	url: URL, 
	action: NavigationActionType, 
	previousValue?: [
		url: URL, 
		action: NavigationActionType 
	]
];

class HistoryStore {
	public notification = new Set<() => void>();

	private value: StoreValue = [] as unknown as StoreValue;

	constructor() {
		// Checks if "resourge_history" was already initiated
		// This is to prevent "resourge_history" from being initiated multiple times
		if ( globalThis.window && !window.resourge_history ) {
			initiateNavigationEvents();
		}
		if ( !globalThis.window ) {
			return;
		}
		this.value = [
			new URL(window.location.href), 
			EVENTS.initial
		];
		window.addEventListener('URLChange', ({ url, action }: UrlChangeEvent) => {
			const [currentUrl, currentAction] = this.value;

			// Check if the URL or action has changed
			if (currentUrl.href !== url.href || currentAction !== action) {
				this.value = [
					url,
					action,
					[currentUrl, currentAction]
				];

				this.notification.forEach((method) => {
					method(); 
				});
			}
		});
	}

	/**
	 * Subscribe to URL changes.
	 * @param notification - Callback to be called on URL changes.
	 * @returns Unsubscribe function.
	 */
	public subscribe = (notification: () => void) => {
		this.notification.add(notification);

		return () => {
			this.notification.delete(notification);
		};
	};

	/**
	 * Get the current store value with proper URL types.
	 * @returns The current store value.
	 */
	public getValue() {
		this.value[0] = new URL(this.value[0]);
		if ( this.value[2] ) {
			this.value[2][0] = new URL(this.value[2][0]);
		}
		return this.value;
	}

	/**
	 * Navigate to a new URL using the History API.
	 * @param url - The target URL to navigate to.
	 * @param options - Optional navigation configuration (action and replace).
	 */
	public navigate(url: URL, { replace, action }: NavigateOptions = {}) {
	// Use the History API to push or replace the state
		window.history[replace ? 'replaceState' : 'pushState'](
			action ? {
				action 
			} : null, 
			'', 
			url
		);
	}
}
 
// eslint-disable-next-line import/no-anonymous-default-export
export default new HistoryStore();
