import { type ActionType } from '../navigationEvents/Events';

export type NavigationActionType = Exclude<ActionType, 'go' | 'back' | 'beforeunload'> | 'stack';

export type NavigationState = {
	action: NavigationActionType
	url: URL
};
