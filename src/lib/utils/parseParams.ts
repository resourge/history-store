/**
 * Check if value is a true object.
 * @param obj 
 * @returns {boolean}
 */
function isObject(obj: any): boolean {
	return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Makes sure some values like function/Map/Set are not converted to {@link URLSearchParams}
 * @param value
 * @returns {boolean}
 */
function toIgnore(value: any): boolean {
	return typeof value === 'function'
		|| value instanceof Map
		|| value instanceof Set
		|| value === undefined;
}

function parseObject (
	state: any, 
	urlParams: URLSearchParams,
	previousKey: string
) {
	if ( toIgnore(state) ) {
		return urlParams;
	}

	if ( isObject(state) ) {
		Object.keys(state)
		.forEach((_key) => {
			parseObject(
				state[_key], 
				urlParams, 
				`${previousKey ? `${previousKey}.` : ''}${_key}`
			);
		});
	}
	else if ( Array.isArray(state) ) {
		state.forEach((value, index) => {
			parseObject(
				value, 
				urlParams, 
				`${previousKey ? `${previousKey}` : ''}[${index}]`
			);
		});
	}
	else {
		urlParams.append(previousKey, state instanceof Date ? state.toISOString() : state);
	}

	return urlParams;
}

/**
 * Convert params into a search string.
 * @param paramValues
 * @param prefixKey - prefix key for searchParams object
 * @returns {string}
 */
export function parseParams<T extends Record<string, any>>(
	paramValues: T,
	prefixKey: string = ''
): string {
	const searchParams = parseObject(
		paramValues,
		new URLSearchParams(),
		prefixKey
	);
	searchParams.sort();
	const params = searchParams.toString();
	return params ? `?${params}` : '';
}
