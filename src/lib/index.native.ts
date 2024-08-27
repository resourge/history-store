import { setupURLPolyfill } from 'react-native-url-polyfill';

setupURLPolyfill();

export {
	type ActionType, BeforeUrlChangeEvent, UrlChangeEvent, createNewUrlWithSearch,
	eventBeforeUrlChange, eventURLChange, parseParams, parseSearch, parseSearchParams
} from './utils/index';
export {
	default as HistoryStore,
	type StoreValue,
	type NavigateOptions
} from './store/HistoryStore.native';
