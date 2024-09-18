import './GlobalEvents';

export type { NavigationActionType } from './types/index';
export {
	BeforeUrlChangeEvent, UrlChangeEvent, eventBeforeUrlChange, eventURLChange
} from './browser/index';
export {
	default as HistoryStore,
	type StoreValue,
	type NavigateOptions
} from './store/HistoryStore';
