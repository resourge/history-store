import { BackHandler } from 'react-native';

import { type NavigationActionType } from '../../types/navigationActionType/NavigationActionType.native';

import { type NavigationState } from './HistoryType';

type HistoryEvent = {
	current: NavigationState
	new: NavigationState
};

type NavigationType = {
	beforeURLChange: (current: NavigationState, next: () => void) => boolean
	URLChange: (current: NavigationState) => void
};

export type NavigateConfig = {
	/**
	 * @default push
	 */
	action?: NavigationActionType
	replace?: boolean
};

const ORIGIN = 'http://localhost';

function createHistory() {
	const state: NavigationState = {
		url: new URL('', ORIGIN),
		action: 'initial'
	};
	const history: HistoryEvent[] = [];

	const events: Record<keyof NavigationType, Array<NavigationType[keyof NavigationType]>> = {
		URLChange: [],
		beforeURLChange: []
	};

	function navigateNext(
		current: NavigationState,
		isStackPop?: boolean
	) {
		const hist: HistoryEvent = {
			current: {
				action: state.action,
				url: state.url
			},
			new: {
				action: current.action,
				url: current.url
			}
		};
		switch ( current.action ) {
			case 'push':
				if ( history.length >= 100 ) {
					history.shift();
				}
				history.push(hist);
				break;
			case 'replace':
				history[history.length - 1] = hist;
				break;
			case 'stack':
				const index = history.findIndex(({ current: { url } }) => url === hist.current.url);
				if ( index > -1 ) {
					history.splice(index, history.length);
				}
				if ( !isStackPop ) {
					history.push(hist);
				}
				break;
			case 'pop':
				history.pop();
				break;
		}
		
		state.url = current.url;
		state.action = current.action;

		(events.URLChange as Array<(current: NavigationState) => void>)
		.forEach((event) => {
			event(current);
		});
	}

	function setCurrentUrl(url: URL, navigationAction: NavigationActionType, isStackPop?: boolean) {
		const current: NavigationState = {
			action: isStackPop ? 'stack' : navigationAction,
			url 
		};
		
		if ( 
			events.beforeURLChange.some((event) => 
				!event(current, () => {
					navigateNext(current, isStackPop);
				})
			) 
		) {
			return;
		}

		navigateNext(current, isStackPop);
	}

	function navigate(
		url: string | URL, 
		config: NavigateConfig = {
			replace: false,
			action: 'push'
		}
	) {
		const action = config.action 
			?? (
				config.replace 
					? 'replace' 
					: 'push'
			);

		const newUrl = new URL(typeof url === 'string' ? url : url.href, ORIGIN);

		setCurrentUrl(
			newUrl, 
			action
		);
	}

	function navigateBack(delta: number = -1) {
		const previousURL = history.at(delta);

		if ( previousURL ) {
			const isStack = previousURL.new.action === 'stack';
			setCurrentUrl(previousURL.current.url, isStack ? 'stack' : 'pop', isStack);
		
			return true;
		}

		return false;
	}

	function goBack(delta: number = -1) {
		if ( !navigateBack(delta) ) {
			BackHandler.exitApp();
		}
	}

	BackHandler.addEventListener('hardwareBackPress', () => navigateBack());

	function addEventListener<K extends keyof NavigationType>(key: K, cb: NavigationType[K]) {
		events[key].push(cb);

		return () => {
			const index = events[key].indexOf(cb);

			if ( index > -1 ) {
				events[key].splice(index, 1);
			}
		};
	}

	function initial(initialRoute: string = '') {
		state.url = new URL(initialRoute, ORIGIN);
	}

	return {
		navigate,
		addEventListener,
		goBack,
		state,
		initial
	};
}

export const History = createHistory();
