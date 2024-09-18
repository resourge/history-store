import { type NavigationActionType } from '../../types/navigationActionType/NavigationActionType.native';

export type NavigationState = {
	action: NavigationActionType
	url: URL
};
