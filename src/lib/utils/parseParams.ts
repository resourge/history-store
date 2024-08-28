/**
 * Check if value is a true object.
 * @param obj 
 * @returns {boolean}
 */
function isObject(obj: any): boolean {
	return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * Makes sure some values like function/Map/Set are not converted to {@link URLSearchParams}
 * @param value
 * @returns {boolean}
 */
function toIgnore(value: any): boolean {
	return typeof value === 'function' ||
		value instanceof Map ||
		value instanceof Set ||
		value === undefined
}

function parseObject (
	state: any, 
	urlParams = new URLSearchParams(),
	previousKey = ''
) {
	if ( toIgnore(state) ) {
		return urlParams;
	}

	if ( isObject(state) ) {
		Object.keys(state)
		.forEach((_key) => {
			const key = `${previousKey ? `${previousKey}.` : ''}${_key}`
			const value = state[_key];

			urlParams = parseObject(value, urlParams, key);
		})
		return urlParams;
	}
	
	if ( Array.isArray(state) ) {
		state.forEach((value, index) => {
			const key = `${previousKey ? `${previousKey}` : ''}[${index}]`
			urlParams = parseObject(value, urlParams, key);
		})
		return urlParams;
	}

	if ( state instanceof Date ) {
		state = state.toISOString();
	}

	urlParams.append(previousKey, state)

	return urlParams;
}

/**
 * Convert params into a search string.
 * @param paramValues
 * @returns {string}
 */
export function parseParams<T extends Record<string, any>>(paramValues: T): string {
	const searchParams = parseObject(paramValues);
	searchParams.sort();
	const params = searchParams.toString()
	return `${params ? '?' : ''}${params}`
}
