import { setupURLPolyfill } from 'react-native-url-polyfill';

setupURLPolyfill();

export {
	type ActionType, BeforeUrlChangeEvent, UrlChangeEvent, createNewUrlWithSearch,
	eventBeforeUrlChange, eventURLChange, parseParams, parseSearch, parseSearchParams,
	History, type NavigateConfig, type NavigationActionType, type NavigationState
} from './utils/index.native';
export {
	default as HistoryStore,
	type StoreValue,
	type NavigateOptions
} from './store/HistoryStore.native';
