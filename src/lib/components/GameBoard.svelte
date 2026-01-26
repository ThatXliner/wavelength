<script lang="ts">
	import type { GamePhase } from '$lib/game/types';
	import Slider from './Slider.svelte';
	import EndpointConfig from './EndpointConfig.svelte';
	import RoleIndicator from './RoleIndicator.svelte';
	import ScoreDisplay from './ScoreDisplay.svelte';
	import { getScoreLabel } from '$lib/game/scoring';

	let {
		phase,
		leftEndpoint,
		rightEndpoint,
		targetPosition,
		guessPosition = $bindable(),
		currentClue = $bindable(),
		isHost,
		hostScore,
		guestScore,
		roundNumber,
		isClueGiver,
		currentRole,
		lastRoundScore,
		onConfigureEndpoints,
		onSubmitClue,
		onSubmitGuess,
		onNextRound
	}: {
		phase: GamePhase;
		leftEndpoint: string;
		rightEndpoint: string;
		targetPosition: number;
		guessPosition: number;
		currentClue: string;
		isHost: boolean;
		hostScore: number;
		guestScore: number;
		roundNumber: number;
		isClueGiver: boolean;
		currentRole: string;
		lastRoundScore: number;
		onConfigureEndpoints: (left: string, right: string) => void;
		onSubmitClue: (clue: string) => void;
		onSubmitGuess: () => void;
		onNextRound: () => void;
	} = $props();

	let localLeftEndpoint = $state('');
	let localRightEndpoint = $state('');
	let clueInput = $state('');

	$effect(() => {
		localLeftEndpoint = leftEndpoint;
		localRightEndpoint = rightEndpoint;
	});

	function handleConfigureEndpoints() {
		onConfigureEndpoints(localLeftEndpoint, localRightEndpoint);
	}

	function handleSubmitClue(event: SubmitEvent) {
		event.preventDefault();
		if (clueInput.trim()) {
			onSubmitClue(clueInput.trim());
			clueInput = '';
		}
	}
</script>

<div class="mx-auto max-w-4xl space-y-8 p-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-gray-800">Wavelength</h1>
		{#if phase !== 'CONFIGURING' && phase !== 'WAITING'}
			<div class="mt-4">
				<RoleIndicator {roundNumber} role={currentRole} />
			</div>
		{/if}
	</div>

	<!-- Main Game Area -->
	<div class="rounded-xl bg-white p-8 shadow-lg">
		{#if phase === 'CONFIGURING'}
			<EndpointConfig
				bind:leftEndpoint={localLeftEndpoint}
				bind:rightEndpoint={localRightEndpoint}
				onSubmit={handleConfigureEndpoints}
			/>
		{:else if phase === 'CLUE_GIVING'}
			{#if isClueGiver}
				<div class="space-y-6">
					<div class="text-center">
						<h2 class="text-xl font-semibold text-gray-800">Give a Clue</h2>
						<p class="text-sm text-gray-600">
							The target is shown below. Give a clue to help the guesser find it.
						</p>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between text-sm font-medium text-gray-600">
							<span>{leftEndpoint}</span>
							<span>{rightEndpoint}</span>
						</div>
						<Slider value={targetPosition} disabled={true} showTarget={true} targetValue={targetPosition} />
					</div>

					<form onsubmit={handleSubmitClue} class="space-y-4">
						<div>
							<label for="clue-input" class="mb-1 block text-sm font-medium text-gray-700">
								Your Clue
							</label>
							<input
								id="clue-input"
								type="text"
								bind:value={clueInput}
								required
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="Enter your clue..."
							/>
						</div>
						<button
							type="submit"
							class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							Submit Clue
						</button>
					</form>
				</div>
			{:else}
				<div class="text-center">
					<h2 class="text-xl font-semibold text-gray-800">Waiting for Clue</h2>
					<p class="text-sm text-gray-600">The clue giver is preparing a clue...</p>
					<div class="mt-4 flex justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
					</div>
				</div>
			{/if}
		{:else if phase === 'GUESSING'}
			{#if !isClueGiver}
				<div class="space-y-6">
					<div class="text-center">
						<h2 class="text-xl font-semibold text-gray-800">Make Your Guess</h2>
						<p class="text-sm text-gray-600">Drag the slider to where you think the target is.</p>
					</div>

					<div class="rounded-lg bg-blue-50 p-4">
						<div class="text-sm font-medium text-gray-700">Clue:</div>
						<div class="text-lg font-semibold text-blue-700">{currentClue}</div>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between text-sm font-medium text-gray-600">
							<span>{leftEndpoint}</span>
							<span>{rightEndpoint}</span>
						</div>
						<Slider bind:value={guessPosition} />
					</div>

					<button
						onclick={onSubmitGuess}
						class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
					>
						Submit Guess
					</button>
				</div>
			{:else}
				<div class="text-center">
					<h2 class="text-xl font-semibold text-gray-800">Waiting for Guess</h2>
					<div class="mt-4 rounded-lg bg-blue-50 p-4">
						<div class="text-sm font-medium text-gray-700">Your Clue:</div>
						<div class="text-lg font-semibold text-blue-700">{currentClue}</div>
					</div>
					<p class="mt-4 text-sm text-gray-600">The guesser is thinking...</p>
					<div class="mt-4 flex justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
					</div>
				</div>
			{/if}
		{:else if phase === 'REVEALING'}
			<div class="space-y-6">
				<div class="text-center">
					<h2 class="text-2xl font-bold text-gray-800">Results!</h2>
					<div class="mt-2 text-4xl font-bold text-green-600">
						{getScoreLabel(lastRoundScore)}
					</div>
					<div class="mt-1 text-xl text-gray-600">+{lastRoundScore} points</div>
				</div>

				<div class="rounded-lg bg-blue-50 p-4">
					<div class="text-sm font-medium text-gray-700">Clue:</div>
					<div class="text-lg font-semibold text-blue-700">{currentClue}</div>
				</div>

				<div class="space-y-2">
					<div class="flex justify-between text-sm font-medium text-gray-600">
						<span>{leftEndpoint}</span>
						<span>{rightEndpoint}</span>
					</div>
					<Slider
						value={guessPosition}
						disabled={true}
						showTarget={true}
						targetValue={targetPosition}
					/>
					<div class="flex justify-between text-xs text-gray-500">
						<span>Guess: {Math.round(guessPosition * 100)}%</span>
						<span>Target: {Math.round(targetPosition * 100)}%</span>
					</div>
				</div>

				<button
					onclick={onNextRound}
					class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Next Round
				</button>
			</div>
		{/if}
	</div>

	<!-- Scores -->
	{#if phase !== 'CONFIGURING' && phase !== 'WAITING'}
		<ScoreDisplay {hostScore} {guestScore} {isHost} />
	{/if}
</div>
