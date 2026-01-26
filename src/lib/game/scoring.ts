/**
 * Calculate score based on distance between guess and target
 * Distance-based scoring:
 * - < 5%: 4 points (Perfect)
 * - < 15%: 3 points (Close)
 * - < 30%: 2 points (Near)
 * - < 50%: 1 point (Far)
 * - >= 50%: 0 points (Miss)
 */
export function calculateScore(target: number, guess: number): number {
	const distance = Math.abs(target - guess);

	if (distance < 0.05) return 4;
	if (distance < 0.15) return 3;
	if (distance < 0.3) return 2;
	if (distance < 0.5) return 1;
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
