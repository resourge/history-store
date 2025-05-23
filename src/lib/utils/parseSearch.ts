/**
 * Checks if param value is date
 * @param paramValue {string}
 * @returns {boolean}
 */
function isIsoDate(paramValue: string): boolean {
	if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(paramValue)) return false;
	const d = new Date(paramValue); 
	return d instanceof Date && !isNaN(d as any) && d.toISOString() === paramValue;
}

/**
 * Check if param value is a number.
 * * Note: Doesn't consider 0001 as value.
 * @param paramValue 
 * @returns {boolean}
 */
function isNumeric(paramValue: string | number): boolean {
	return typeof paramValue === 'number' || /^[-]?([1-9]\d*|0)(\.\d+)?$/.test(paramValue);
}

/**
 * Decodes params values into there true type.
 * @param paramValue
 */
function decoder(paramValue: any) {
	if ( isNumeric(paramValue) ) {
		return parseFloat(paramValue);
	}
	if ( paramValue === 'true' ) {
		return true;
	}
	if ( paramValue === 'false' ) {
		return false;
	}
	
	const decodedValue = decodeURI(paramValue);
	return isIsoDate(decodedValue) ? new Date(decodedValue) : paramValue;
}

/**
 * Checks if key is just a number or a string. (@example 0 is a number. foo1 is a string)
 * @param key
 * @returns {string|number}
 */
function getKey (key: number | string): number | string {
	const intKey = parseInt(key as string);
	return intKey.toString() === key ? intKey : key;
}

/**
 * Create a nested object using a key path. {@example "foo.bar" will create { foo: { bar: 10 } }}
 * @param base - object created from URLSearchParams {@link URLSearchParams}
 * @param names - key separated by "."
 * @param value - key value
 */
function createNestedObject (
	base: Record<string | number, any>,
	names: string[], 
	value: any
) {
	const lastName = getKey(names.pop() ?? '');
	names.forEach((name, i) => {
		const key = getKey(name);
		const nextKey = getKey(names[i + 1] ?? lastName);
		base = base[key] = base[key] || (typeof nextKey === 'number' ? [] : {});
	});

	if ( lastName != null ) {
		base[lastName] = value;
	}
}

/**
 * Convert search params into true primitive values.
 * @param searchParams {@link URLSearchParams}
 * @param defaultParams 
 * @returns {Record<string, any>}
 */
export function parseSearchParams<T extends Record<string, any>>(
	searchParams: URLSearchParams, 
	defaultParams: T = {} as unknown as T
): T {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const result: T = {} as T;
	for (const [key, _value] of searchParams.entries()) {
		const value = decoder(_value);

		if ( key.includes('.') || key.includes('[') ) {
			const arrKey = key
			.replace(/\[/g, '.')
			.replace(/\]/g, '')
			.split('.');

			createNestedObject(
				result,
				arrKey,
				value
			);

			continue;
		}
		result[key as keyof T] = value;
	}

	return {
		...defaultParams,
		...result
	};
}

/**
 * Convert search string into an object.
 * @param search {string}
 * @param defaultParams 
 * @returns {Record<string, any>}
 */
export function parseSearch<T extends Record<string, any>>(
	search: string, 
	defaultParams: T = {} as unknown as T
): T {
	return parseSearchParams(new URLSearchParams(search), defaultParams);
}
