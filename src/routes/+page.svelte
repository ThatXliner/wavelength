<script lang="ts">
	import { createConnection } from '$lib/webrtc/connection.svelte';
	import { createGameState } from '$lib/game/state.svelte';
	import ConnectionPanel from '$lib/components/ConnectionPanel.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';

	let isHost = $state(false);
	let connection = createConnection();
	let gameState = $state(createGameState(false));

	// Handle connection setup
	async function handleCreateOffer() {
		isHost = true;
		gameState = createGameState(true);
		await connection.createOffer();
		gameState.setPhase('CONFIGURING');
	}

	async function handleAcceptOffer(offer: string) {
		isHost = false;
		gameState = createGameState(false);
		await connection.acceptOffer(offer);
	}

	async function handleAcceptAnswer(answer: string) {
		await connection.acceptAnswer(answer);
	}

	// Game event handlers
	function handleConfigureEndpoints(left: string, right: string) {
		gameState.setEndpoints(left, right);

		if (isHost) {
			connection.sendMessage({
				type: 'CONFIGURE_ENDPOINTS',
				left,
				right
			});
			gameState.startRound();
			connection.sendMessage({
				type: 'START_ROUND',
				target: gameState.targetPosition
			});
		}
	}

	function handleSubmitClue(clue: string) {
		gameState.submitClue(clue);
		connection.sendMessage({
			type: 'SUBMIT_CLUE',
			clue
		});
	}

	function handleSubmitGuess() {
		connection.sendMessage({
			type: 'SUBMIT_GUESS',
			position: gameState.guessPosition
		});
		gameState.submitGuess(gameState.guessPosition);
		gameState.calculateAndApplyScore();

		connection.sendMessage({
			type: 'REVEAL'
		});
	}

	function handleNextRound() {
		gameState.nextRound();

		if (isHost) {
			gameState.startRound();
			connection.sendMessage({
				type: 'START_ROUND',
				target: gameState.targetPosition
			});
		} else {
			connection.sendMessage({
				type: 'NEXT_ROUND'
			});
		}
	}

	// Message handlers
	connection.onMessage('CONFIGURE_ENDPOINTS', (message) => {
		gameState.setEndpoints(message.left, message.right);
	});

	connection.onMessage('START_ROUND', (message) => {
		gameState.setTarget(message.target);
		gameState.setPhase('CLUE_GIVING');
	});

	connection.onMessage('SUBMIT_CLUE', (message) => {
		gameState.setClue(message.clue);
		gameState.setPhase('GUESSING');
	});

	connection.onMessage('SUBMIT_GUESS', (message) => {
		gameState.setGuess(message.position);
		gameState.calculateAndApplyScore();
		gameState.setPhase('REVEALING');
	});

	connection.onMessage('REVEAL', () => {
		gameState.setPhase('REVEALING');
	});

	connection.onMessage('NEXT_ROUND', () => {
		gameState.nextRound();
		gameState.setPhase('CLUE_GIVING');
	});
</script>

<div class="min-h-screen bg-gray-50">
	{#if connection.connectionState !== 'connected'}
		<ConnectionPanel
			connectionState={connection.connectionState}
			offer={connection.offer}
			answer={connection.answer}
			onCreateOffer={handleCreateOffer}
			onAcceptOffer={handleAcceptOffer}
			onAcceptAnswer={handleAcceptAnswer}
		/>
	{:else}
		<GameBoard
			phase={gameState.phase}
			leftEndpoint={gameState.leftEndpoint}
			rightEndpoint={gameState.rightEndpoint}
			targetPosition={gameState.targetPosition}
			bind:guessPosition={gameState.guessPosition}
			bind:currentClue={gameState.currentClue}
			isHost={gameState.isHost}
			hostScore={gameState.hostScore}
			guestScore={gameState.guestScore}
			roundNumber={gameState.roundNumber}
			isClueGiver={gameState.isClueGiver}
			currentRole={gameState.currentRole}
			lastRoundScore={gameState.lastRoundScore}
			onConfigureEndpoints={handleConfigureEndpoints}
			onSubmitClue={handleSubmitClue}
			onSubmitGuess={handleSubmitGuess}
			onNextRound={handleNextRound}
		/>
	{/if}
</div>
