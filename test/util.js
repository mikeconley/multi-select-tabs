/**
 * A promise that resolves once the rest of the stack has cleared.
 *
 * Useful if you are waiting for other promises to resolve.
 */
export const defer = function defer() {
  return new Promise(resolve => setTimeout(resolve));
};
