import { type NavigationActionType } from '../../types/navigationActionType/NavigationActionType';

export const eventURLChange = 'URLChange';
export const eventBeforeUrlChange = 'beforeURLChange';

// eslint-disable-next-line prefer-const
let _lastURLChangeEvent: UrlChangeEvent | null = null;

export const setLastURLChangeEvent = (lastURLChangeEvent: UrlChangeEvent | null) => {
	_lastURLChangeEvent = lastURLChangeEvent;
};

export const getLastURLChangeEvent = () => _lastURLChangeEvent;

export class UrlChangeEvent extends Event {
	constructor(
		public action: NavigationActionType,
		public url: URL
	) {
		super(eventURLChange);
	}
}

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
