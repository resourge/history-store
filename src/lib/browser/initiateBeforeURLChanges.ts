import {
	back,
	beforeunload,
	EVENTS,
	EVENTS_KEYS,
	forward,
	go,
	popState,
	pushState,
	replaceState
} from '../types/navigationActionType/BaseNavigationActionType';

import {
	BeforeUrlChangeEvent,
	eventBeforeUrlChange,
	eventURLChange,
	getLastURLChangeEvent,
	setLastURLChangeEvent,
	UrlChangeEvent
} from './navigationEvents/Events';

/**
 * Checks is data from '(push/replace)State' has action key
 */
export const getAction = (state: any, type: keyof typeof EVENTS) =>
	EVENTS_KEYS.includes(state?.action) ? state.action : EVENTS[type];

const getBeforeEvents = () => {
	const beforeEvents: Array<(e: BeforeUrlChangeEvent) => boolean> = [];
	const originalAddEventListener = window.addEventListener;

	window.addEventListener = function (type: any, listener: any, options?: any) {
		if (type === eventBeforeUrlChange) {
			beforeEvents.push(listener);
		}
		if (type === eventURLChange && getLastURLChangeEvent()) {
			listener(getLastURLChangeEvent());
			setLastURLChangeEvent(null);
		}

		originalAddEventListener.call(this, type, listener, options);
	};

	const originalRemoveEventListener = window.removeEventListener;
	window.removeEventListener = function (
		type: any,
		listener: any,
		options?: any
	) {
		if (type === eventBeforeUrlChange) {
			beforeEvents.splice(beforeEvents.indexOf(listener), 1);
		}

		originalRemoveEventListener.call(this, type, listener, options);
	};

	return beforeEvents;
};

/**
 * Initiate some event's to catch {@link URL} changes.
 */
export const initiateBeforeURLChanges = () => {
	const beforeEvents = getBeforeEvents();
	const originalHistory: History = {} as unknown as History;
	let wasAsked = false;

	[pushState, replaceState, go, back, forward].forEach((method) => {
		const type = method as keyof Pick<History, 'pushState' | 'replaceState'>;
		const original = window.history[type];

		window.history[type] = function (...args) {
			const action = getAction(args[0], type);
			const url = args[2]
				? typeof args[2] === 'string'
					? new URL(args[2], window.location.origin)
					: args[2]
				: new URL(window.location.href);

			const event = new BeforeUrlChangeEvent(action, url, () => {
				if (method === back) {
					wasAsked = true;
				}
				original.apply(this, args);
			});

			if (beforeEvents.some((cb) => !cb(event))) {
				return;
			}

			original.apply(this, args);
		};
		originalHistory[type] = original.bind(window.history);
	});

	let preventDoublePopState = false;
	const popStateCb = () => {
		if (preventDoublePopState) {
			preventDoublePopState = false;
			return;
		}

		const url = new URL(document.location.href);
		const event = new BeforeUrlChangeEvent(EVENTS[popState], url, () => {
			wasAsked = true;
			originalHistory.back();
		});

		if (!wasAsked && beforeEvents.some((cb) => !cb(event))) {
			preventDoublePopState = true;
			originalHistory.forward();
			return;
		}
		wasAsked = false;
		const urlChangeEvent = new UrlChangeEvent(EVENTS[popState], url);
		setLastURLChangeEvent(urlChangeEvent);
		dispatchEvent(urlChangeEvent);
	};
	
	window.addEventListener(popState, popStateCb, false);

	window.addEventListener(beforeunload, (e) => {
		const event = new BeforeUrlChangeEvent(
			EVENTS[beforeunload],
			new URL(window.location.href),
			() => originalHistory.back()
		);

		if (beforeEvents.some((cb) => !cb(event))) {
			// Cancel the event.
			e.preventDefault();
			// Chrome (and legacy IE) requires returnValue to be set.
			e.returnValue = '';

			return '';
		}
	});
};
