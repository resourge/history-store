export const popState = 'popstate';
export const pushState = 'pushState';
export const replaceState = 'replaceState';
export const go = 'go';
export const back = 'back';
export const forward = 'forward';
export const beforeunload = 'beforeunload';

export const EVENTS = {
	[popState]: 'pop',
	[pushState]: 'push',
	[replaceState]: 'replace',
	[go]: go,
	[back]: back,
	[forward]: forward,
	initial: 'initial',
	[beforeunload]: 'beforeunload'
} as const;

export const EVENTS_KEYS = Object.keys(EVENTS);

export type BaseNavigationActionType = typeof EVENTS[keyof typeof EVENTS];
