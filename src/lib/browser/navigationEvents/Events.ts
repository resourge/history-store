import { type NavigationActionType } from '../../types/navigationActionType/NavigationActionType';

export const eventURLChange = 'URLChange';
export const eventBeforeUrlChange = 'beforeURLChange';
 
let _lastURLChangeEvent: null | UrlChangeEvent = null;

export const setLastURLChangeEvent = (lastURLChangeEvent: null | UrlChangeEvent) => {
	_lastURLChangeEvent = lastURLChangeEvent;
};

export const getLastURLChangeEvent = () => _lastURLChangeEvent;

export class BeforeUrlChangeEvent extends Event {
	constructor(
		public action: NavigationActionType,
		public url: URL,
		public next: () => void
	) {
		super(
			eventBeforeUrlChange, 
			{
				cancelable: true 
			}
		);
	}
}

export class UrlChangeEvent extends Event {
	constructor(
		public action: NavigationActionType,
		public url: URL
	) {
		super(eventURLChange);
	}
}
