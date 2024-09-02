import { History, type NavigateConfig } from '../native/createHistory/createHistory.native';
import { EVENTS } from '../types/navigationActionType/BaseNavigationActionType';
import { type NavigationActionType } from '../types/navigationActionType/NavigationActionType.native';

export type NavigateOptions = NavigateConfig;

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
		this.value = [
			History.state.url, 
			EVENTS.initial
		]
		History.addEventListener('URLChange', ({ url, action }) => {
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

	public navigate(url: URL, config?: NavigateConfig) {
		History.navigate(url, config);
	}
}
 
// eslint-disable-next-line import/no-anonymous-default-export
export default new HistoryStore();
