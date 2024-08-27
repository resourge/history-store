export const IS_BROWSER: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const ORIGIN = IS_BROWSER ? window.location.origin : 'http://localhost';
