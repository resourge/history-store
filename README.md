# @resourge/history-store

`@resourge/history-store` is a lightweight JavaScript utility for managing and subscribing to navigation events using the browser's History API. It simplifies tracking URL changes and enables seamless state management for single-page applications (SPAs).



## Features

- `Unified Navigation State Management`: Consistent API for both web and React Native environments.
- `Subscription-Based Updates`: Subscribe to URL changes and respond in real-time.
- `Custom Navigation Actions`: Specify custom navigation actions or replace the current history state.


## Installation

Install using [Yarn](https://yarnpkg.com):

### Browser

```sh
yarn add @resourge/history-store
```

or NPM:

```sh
npm install @resourge/history-store --save
```

### react-native

```sh
yarn add @resourge/history-store react-native-url-polyfill
```

or NPM:

```sh
npm install @resourge/history-store react-native-url-polyfill --save
```

## Basic usage

To start using `@resourge/history-store`, simply import and interact with the `HistoryStore` instance:

```jsx
// Browser
import { HistoryStore } from '@resourge/history-store';
// react-native
// import { HistoryStore } from '@resourge/history-store/mobile';

// Subscribe to URL changes
const unsubscribe = HistoryStore.subscribe(() => {
  const [currentUrl, action, previous] = HistoryStore.getValue();
  console.log('Current URL:', currentUrl.href);
  console.log('Action:', action);
  if (previous) {
    console.log('Previous URL:', previous[0].href);
  }
});

// Navigate to a new URL
HistoryStore.navigate(new URL('/new-page', window.location.href));

// Unsubscribe when done
unsubscribe();
```

### Methods

`subscribe(notification: () => void): () => void`

Adds a callback function that will be triggered on URL change. Returns an unsubscribe function to remove the subscription.

```typescript
const unsubscribe = HistoryStore.subscribe(() => {
  console.log('URL changed!');
});
```

`getValue(): StoreValue`

Returns the current navigation state, which is a tuple containing:

- `url`: The current `URL`.
- `action`: The type of action that triggered the change.
- `previousValue`: (Optional) A tuple containing the previous `URL` and action.

```typescript
const [url, action, previous] = HistoryStore.getValue();
```

`navigate(url: URL, options?: NavigateOptions): void`

Navigates to a specified `URL`. The optional `NavigateOptions` can be used to define the navigation action or whether to replace the current history state.

- Web: 
	- `url`: The current `URL`.
	- `options.action`: The navigation action type (e.g., `push`, `replace`).
	- `options.replace`: If `true`, replaces the current navigation state instead of pushing a new one.

- react-native: 
	- `url`: The current `URL`.
	- `options.action`: The navigation action type (e.g., `push`, `replace`).
	- `options.replace`: If `true`, replaces the current navigation state instead of pushing a new one.
	- `config.stack`: If `true`, clears all navigation entries after the current URL before adding a new entry.

```typescript
HistoryStore.navigate(new URL('/new-page', window.location.href), { replace: true });
```

## Utility functions

### `createNewUrlWithSearch(url: URL, newSearch: string, hash?: boolean): URL`

Creates a new URL instance with an updated search string. Optionally updates the hash if specified.

- Parameters:
	- `url`: The original `URL`.
	- `newSearch`: The new search string to be set.
	- `hash`: If `true`, updates the URL hash with the new search string.

```typescript
import { createNewUrlWithSearch } from '@resourge/history-store/utils';
const newUrl = createNewUrlWithSearch(new URL('/path', window.location.origin), 'foo=bar', true);
```

### `parseParams<T extends Record<string, any>>(paramValues: T): string`

Converts parameters into a search string.

- Parameters:
	- `paramValues`: An object representing the parameters.

```typescript
import { parseParams } from '@resourge/history-store/utils';
const searchString = parseParams({ foo: 'bar', nested: { key: 'value' } });
```

### `parseSearchParams<T extends Record<string, any>>(searchParams: URLSearchParams, defaultParams?: T): T`

Converts search parameters into an object with primitive values.

- Parameters:
	- `searchParams`: An instance of `URLSearchParams`.
	- `defaultParams`: Optional default parameters to merge with the parsed result.

```typescript
import { parseSearchParams } from '@resourge/history-store/utils';
const params = parseSearchParams(new URLSearchParams('foo=bar&nested[key]=value'));
```

### `parseSearch<T extends Record<string, any>>(search: string, defaultParams?: T): T`

Converts a search string into an object with primitive values.

- Parameters:
	- `search`: The search string (e.g., `?foo=bar&nested[key]=value`).
	- `defaultParams`: Optional default parameters to merge with the parsed result.

```typescript
import { parseSearch } from '@resourge/history-store/utils';
const params = parseSearch('?foo=bar&nested[key]=value');
```

## License

MIT Licensed.