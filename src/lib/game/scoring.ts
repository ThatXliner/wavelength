/**
 * Calculate score based on distance between guess and target
 * Distance-based scoring:
 * - < 2.5%: 4 points (Perfect)
 * - < 7.5%: 3 points (Close)
 * - < 15%: 2 points (Near)
 * - < 25%: 1 point (Far)
 * - >= 25%: 0 points (Miss)
 */
export function calculateScore(target: number, guess: number): number {
	const distance = Math.abs(target - guess);

	if (distance < 0.025) return 4;
	if (distance < 0.075) return 3;
	if (distance < 0.15) return 2;
	if (distance < 0.25) return 1;
	return 0;
}

/**
 * Get score label based on points
 */
export function getScoreLabel(score: number): string {
	switch (score) {
		case 4:
			return 'Perfect!';
		case 3:
			return 'Close!';
		case 2:
			return 'Near';
		case 1:
			return 'Far';
		default:
			return 'Miss';
	}
}
