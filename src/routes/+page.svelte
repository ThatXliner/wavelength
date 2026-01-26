<script lang="ts">
	import { createPeerJSConnection } from '$lib/webrtc/peerjs-connection.svelte';
	import { createGameState } from '$lib/game/state.svelte';
	import PeerJSConnectionPanel from '$lib/components/PeerJSConnectionPanel.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';

	let isHost = $state(false);
	let connection = createPeerJSConnection();
	let gameState = $state(createGameState(false));

	// Handle connection setup
	function handleInitialize(isHostPlayer: boolean) {
		isHost = isHostPlayer;
		gameState = createGameState(isHostPlayer);
		connection.initialize(isHostPlayer);

		if (isHostPlayer) {
			// Wait for connection, then show configuration
		}
	}

	function handleConnect(peerId: string) {
		connection.connectToPeer(peerId);
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
		gameState.setPhase('CLUE_GIVING');
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

	// Set initial phase when connected
	$effect(() => {
		if (connection.connectionState === 'connected' && gameState.phase === 'WAITING') {
			if (isHost) {
				gameState.setPhase('CONFIGURING');
			} else {
				// Guest waits for host to configure
			}
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	{#if connection.connectionState !== 'connected'}
		<PeerJSConnectionPanel
			connectionState={connection.connectionState}
			myPeerId={connection.myPeerId}
			errorMessage={connection.errorMessage}
			onInitialize={handleInitialize}
			onConnect={handleConnect}
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
