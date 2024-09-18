/**
 * Creates a new {@link URL} with updated search parameters.
 * Optionally updates the hash if the hash flag is true.
 */
export const createNewUrlWithSearch = (
	url: URL, 
	newSearch: string,
	hash?: boolean
): URL => {
	const _url = new URL(url);
	
	if (hash && _url.hash) {
		const hashUrl = new URL(_url.hash.slice(1), window.location.origin);
		hashUrl.search = newSearch;
		_url.hash = `#${hashUrl.href.replace(hashUrl.origin, '')}`;
	}
	else {
		_url.search = newSearch;
	}
	
	return _url;
};
