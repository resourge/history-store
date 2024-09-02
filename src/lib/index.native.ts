import { setupURLPolyfill } from 'react-native-url-polyfill';

setupURLPolyfill();

export type { NavigationActionType } from './types/index.native';
export {
	History, type NavigateConfig, type NavigationState
} from './native/index.native';
export {
	default as HistoryStore,
	type StoreValue,
	type NavigateOptions
} from './store/HistoryStore.native';
