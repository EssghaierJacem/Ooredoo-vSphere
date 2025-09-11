export {}; // Ensure this file is treated as a module

// Polyfill Object.hasOwn for environments where it's not available
if (typeof (Object as any).hasOwn !== 'function') {
	(Object as any).hasOwn = function hasOwnPolyfill(object: unknown, property: PropertyKey): boolean {
		return Object.prototype.hasOwnProperty.call(object, property);
	};
}
