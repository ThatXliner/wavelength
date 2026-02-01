import { expect, test } from '@playwright/test';

test.describe('Same Device Mode', () => {
	test('shows "Play on Same Device" button on home page', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: /play on same device/i })).toBeVisible();
	});

	test('can start a local game', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /play on same device/i }).click();

		// Should see endpoint configuration
		await expect(page.getByText(/configure slider endpoints/i)).toBeVisible();
	});

	test('complete game flow: configure, clue, guess, reveal, next round', async ({ page }) => {
		await page.goto('/');

		// Start local mode
		await page.getByRole('button', { name: /play on same device/i }).click();

		// Configure endpoints
		await expect(page.getByText(/configure slider endpoints/i)).toBeVisible();
		await page.getByRole('button', { name: /start game/i }).click();

		// Should show pass screen for Player 1 (clue giver)
		await expect(page.getByText(/pass device to player 1/i)).toBeVisible();
		await expect(page.getByText(/give a clue/i)).toBeVisible();
		await page.getByRole('button', { name: /continue/i }).click();

		// Player 1 gives clue
		await expect(page.getByText(/player 1/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /give a clue/i })).toBeVisible();
		await expect(page.getByRole('slider')).toBeVisible(); // Should see target position
		const clueInput = page.getByPlaceholder(/enter your clue/i);
		await clueInput.fill('Warm');
		await page.getByRole('button', { name: /submit clue/i }).click();

		// Should show pass screen for Player 2 (guesser)
		await expect(page.getByText(/pass device to player 2/i)).toBeVisible();
		await expect(page.getByText(/guess/i)).toBeVisible();
		await page.getByRole('button', { name: /continue/i }).click();

		// Player 2 guesses
		await expect(page.getByText(/player 2/i)).toBeVisible();
		await expect(page.getByText(/make your guess/i)).toBeVisible();
		await expect(page.getByText(/warm/i)).toBeVisible(); // Should see the clue

		// Check that slider is visible and interactive
		const slider = page.getByRole('slider');
		await expect(slider).toBeVisible();
		await expect(slider).not.toBeDisabled();

		// Interact with slider
		const sliderBoundingBox = await slider.boundingBox();
		if (sliderBoundingBox) {
			// Click somewhere on the slider to move it
			await page.mouse.click(
				sliderBoundingBox.x + sliderBoundingBox.width * 0.6,
				sliderBoundingBox.y + sliderBoundingBox.height / 2
			);
		}

		await page.getByRole('button', { name: /submit guess/i }).click();

		// Should show reveal screen (both players can see)
		await expect(page.getByText(/results/i)).toBeVisible();
		await expect(page.getByText(/points/i)).toBeVisible();

		// Next round
		await page.getByRole('button', { name: /next round/i }).click();

		// Should show pass screen for Player 2 (now the clue giver in round 2)
		await expect(page.getByText(/pass device to player 2/i)).toBeVisible();
		await page.getByRole('button', { name: /continue/i }).click();

		// Player 2 gives clue in round 2
		await expect(page.getByText(/player 2/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /give a clue/i })).toBeVisible();
	});

	test('slider is visible and enabled for guesser', async ({ page }) => {
		await page.goto('/');

		// Start local mode and configure
		await page.getByRole('button', { name: /play on same device/i }).click();
		await page.getByRole('button', { name: /start game/i }).click();

		// Pass to Player 1
		await page.getByRole('button', { name: /continue/i }).click();

		// Player 1 submits clue
		const clueInput = page.getByPlaceholder(/enter your clue/i);
		await clueInput.fill('Test Clue');
		await page.getByRole('button', { name: /submit clue/i }).click();

		// Pass to Player 2 (guesser)
		await page.getByRole('button', { name: /continue/i }).click();

		// CRITICAL: Slider must be visible and enabled for guesser
		const slider = page.getByRole('slider');
		await expect(slider).toBeVisible();
		await expect(slider).not.toBeDisabled();

		// Should NOT show "thinking" spinner
		await expect(page.getByText(/thinking/i)).not.toBeVisible();

		// Should show guess UI
		await expect(page.getByText(/make your guess/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /submit guess/i })).toBeVisible();

		// CRITICAL: Test that slider can actually be dragged
		const initialValue = await slider.getAttribute('aria-valuenow');

		// Click on the slider at 75% position to move it
		const sliderBox = await slider.boundingBox();
		if (sliderBox) {
			await page.mouse.click(
				sliderBox.x + sliderBox.width * 0.75,
				sliderBox.y + sliderBox.height / 2
			);

			// Wait a bit for the value to update
			await page.waitForTimeout(100);

			// Verify the value changed
			const newValue = await slider.getAttribute('aria-valuenow');
			expect(newValue).not.toBe(initialValue);
			expect(parseInt(newValue || '0')).toBeGreaterThan(60);
		}
	});

	test('roles alternate correctly between rounds', async ({ page }) => {
		await page.goto('/');

		// Start and configure
		await page.getByRole('button', { name: /play on same device/i }).click();
		await page.getByRole('button', { name: /start game/i }).click();

		// Round 1: Player 1 gives clue
		await page.getByRole('button', { name: /continue/i }).click();
		await expect(page.getByText(/player 1/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /give a clue/i })).toBeVisible();
		await page.getByPlaceholder(/enter your clue/i).fill('Clue 1');
		await page.getByRole('button', { name: /submit clue/i }).click();

		// Round 1: Player 2 guesses
		await page.getByRole('button', { name: /continue/i }).click();
		await expect(page.getByText(/player 2/i)).toBeVisible();
		await expect(page.getByText(/make your guess/i)).toBeVisible();
		await page.getByRole('button', { name: /submit guess/i }).click();

		// Go to next round
		await page.getByRole('button', { name: /next round/i }).click();

		// Round 2: Player 2 gives clue
		await page.getByRole('button', { name: /continue/i }).click();
		await expect(page.getByText(/player 2/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /give a clue/i })).toBeVisible();
		await page.getByPlaceholder(/enter your clue/i).fill('Clue 2');
		await page.getByRole('button', { name: /submit clue/i }).click();

		// Round 2: Player 1 guesses
		await page.getByRole('button', { name: /continue/i }).click();
		await expect(page.getByText(/player 1/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /make your guess/i })).toBeVisible();
	});

	test('scores are tracked correctly', async ({ page }) => {
		await page.goto('/');

		// Start and play one round
		await page.getByRole('button', { name: /play on same device/i }).click();
		await page.getByRole('button', { name: /start game/i }).click();
		await page.getByRole('button', { name: /continue/i }).click();

		// Give clue
		await page.getByPlaceholder(/enter your clue/i).fill('Test');
		await page.getByRole('button', { name: /submit clue/i }).click();
		await page.getByRole('button', { name: /continue/i }).click();

		// Make guess
		await page.getByRole('button', { name: /submit guess/i }).click();

		// Check that score is displayed
		await expect(page.getByText(/points/i)).toBeVisible();
		await expect(page.getByText(/you/i)).toBeVisible();
		await expect(page.getByText(/opponent/i)).toBeVisible();
	});
});
