/**
 * Generate a cryptographically secure random number between 0 and 1
 */
export function generateTarget(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return array[0] / (0xffffffff + 1);
}
