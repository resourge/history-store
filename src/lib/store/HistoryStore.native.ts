import { History, type NavigateConfig } from '../native/createHistory/createHistory.native';
import { EVENTS } from '../types/navigationActionType/BaseNavigationActionType';
import { type NavigationActionType } from '../types/navigationActionType/NavigationActionType.native';

export type NavigateOptions = NavigateConfig;

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
		this.value = [
			History.state.url, 
			EVENTS.initial
		];
		History.addEventListener('URLChange', ({ url, action }) => {
			const [currentUrl, currentAction] = this.value;

			// Check if the URL or action has changed.
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
	 * Get the current value of the store.
	 * Ensures all URLs are correctly typed.
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
	 * @param config - Optional navigation configuration.
	 */
	public navigate(url: URL, config?: NavigateConfig) {
		History.navigate(url, config);
	}
}
 
// eslint-disable-next-line import/no-anonymous-default-export
export default new HistoryStore();
