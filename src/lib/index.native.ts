import { setupURLPolyfill } from 'react-native-url-polyfill';

setupURLPolyfill();

export {
	History, type NavigateConfig, type NavigationState
} from './native/index.native';
export {
	default as HistoryStore,
	type NavigateOptions,
	type StoreValue
} from './store/HistoryStore.native';
export type { NavigationActionType } from './types/index.native';
