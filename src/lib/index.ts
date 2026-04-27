import './GlobalEvents';

export {
	BeforeUrlChangeEvent, eventBeforeUrlChange, eventURLChange, UrlChangeEvent
} from './browser/index';
export {
	default as HistoryStore,
	type NavigateOptions,
	type StoreValue
} from './store/HistoryStore';
export type { NavigationActionType } from './types/index';
