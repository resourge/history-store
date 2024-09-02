import { type UrlChangeEvent } from '../browser'
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
		action: NavigationActionType, 
	]
]

class HistoryStore {
	public notification = new Set<() => void>();

	private value: StoreValue = [] as unknown as StoreValue;

	constructor() {
		// Checks if "resourge_history" was already initiated
		// This is to prevent "resourge_history" from being initiated multiple times
		if ( globalThis.window && !window.resourge_history ) {
			initiateNavigationEvents();
		}
		this.value = [
			new URL(window.location.href), 
			EVENTS.initial
		]
		window.addEventListener('URLChange', ({ url, action }: UrlChangeEvent) => {
			if ( 
				this.value[0].href !== url.href ||
				this.value[1] !== action
			) {
				this.value = [
					url,
					action,
					[
						this.value[0],
						this.value[1]
					]
				];

				this.notification.forEach((method) => {
					method(); 
				})
			}
		})
	}

	public subscribe = (notification: () => void) => {
		this.notification.add(notification);

		return () => {
			this.notification.delete(notification);
		}
	}

	public getValue() {
		this.value[0] = new URL(this.value[0]);
		if ( this.value[2] ) {
			this.value[2][0] = new URL(this.value[2][0])
		}
		return this.value
	}

	public navigate(url: URL, { replace, action }: NavigateOptions = {}) {
		window.history[replace ? 'replaceState' : 'pushState'](action ? {
			action 
		} : null, '', url);
	}
}
 
// eslint-disable-next-line import/no-anonymous-default-export
export default new HistoryStore();
