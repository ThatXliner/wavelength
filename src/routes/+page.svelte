<script lang="ts">
	import { createPeerJSConnection } from '$lib/webrtc/peerjs-connection.svelte';
	import { createGameState } from '$lib/game/state.svelte';
	import PeerJSConnectionPanel from '$lib/components/PeerJSConnectionPanel.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';

	let isHost = $state(false);
	let isLocalMode = $state(false);
	let connection = $state(createPeerJSConnection());
	let gameState = $state(createGameState(false));

	// For local mode, we just need a single shared game state
	let localGameState = $state(createGameState(true));

	// Track which player's turn it is in local mode
	let currentLocalPlayer = $state<'host' | 'guest'>('host');
	let showPassScreen = $state(false);

	// Handle local mode setup
	function handleLocalMode() {
		isLocalMode = true;
		localGameState = createGameState(true);
		localGameState.setPhase('CONFIGURING');
		currentLocalPlayer = 'host';
	}

	// Handle connection setup (for network mode)
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

	// Game event handlers for local mode
	function handleLocalConfigureEndpoints(left: string, right: string) {
		localGameState.setEndpoints(left, right);
		localGameState.startRound();

		// Round 1: host is clue giver (roundNumber % 2 === 1)
		// So start with host
		currentLocalPlayer = 'host';
		showPassScreen = true;
	}

	function handleLocalSubmitClue(clue: string) {
		localGameState.submitClue(clue);

		// After clue is submitted, switch to the guesser
		// Round 1 (odd): host gives clue, guest guesses
		// Round 2 (even): guest gives clue, host guesses
		const isOddRound = localGameState.roundNumber % 2 === 1;
		currentLocalPlayer = isOddRound ? 'guest' : 'host';
		showPassScreen = true;
	}

	function handleLocalSubmitGuess() {
		localGameState.submitGuess(localGameState.guessPosition);
		localGameState.calculateAndApplyScore();

		// Both players can see the reveal
		showPassScreen = false;
	}

	function handleLocalNextRound() {
		localGameState.nextRound();
		localGameState.startRound();

		// Determine who gives the next clue based on new round number
		// Odd rounds: host gives clue
		// Even rounds: guest gives clue
		const isOddRound = localGameState.roundNumber % 2 === 1;
		currentLocalPlayer = isOddRound ? 'host' : 'guest';
		showPassScreen = true;
	}

	// Game event handlers for network mode
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

	// Handler to dismiss pass screen
	function handleContinueAfterPass() {
		showPassScreen = false;
	}

	// Message handlers for network mode
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

	// Set initial phase when connected (network mode)
	$effect(() => {
		if (!isLocalMode && connection.connectionState === 'connected' && gameState.phase === 'WAITING') {
			if (isHost) {
				gameState.setPhase('CONFIGURING');
			} else {
				// Guest waits for host to configure
			}
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	{#if isLocalMode}
		{#if showPassScreen}
			<!-- Pass device screen -->
			<div class="flex min-h-screen items-center justify-center p-6">
				<div class="max-w-md text-center">
					<div class="mb-6 text-6xl">🔄</div>
					<h2 class="mb-4 text-2xl font-bold text-gray-800">
						Pass Device to {currentLocalPlayer === 'host' ? 'Player 1' : 'Player 2'}
					</h2>
					<p class="mb-6 text-gray-600">
						{#if localGameState.phase === 'CLUE_GIVING'}
							It's their turn to give a clue
						{:else if localGameState.phase === 'GUESSING'}
							It's their turn to guess
						{:else}
							It's their turn
						{/if}
					</p>
					<button
						onclick={handleContinueAfterPass}
						class="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Continue
					</button>
				</div>
			</div>
		{:else}
			<!-- Game board - same state, just show different player name -->
			{@const isCurrentPlayerClueGiver =
				(localGameState.roundNumber % 2 === 1 && currentLocalPlayer === 'host') ||
				(localGameState.roundNumber % 2 === 0 && currentLocalPlayer === 'guest')}
			<GameBoard
				phase={localGameState.phase}
				leftEndpoint={localGameState.leftEndpoint}
				rightEndpoint={localGameState.rightEndpoint}
				targetPosition={localGameState.targetPosition}
				bind:guessPosition={localGameState.guessPosition}
				bind:currentClue={localGameState.currentClue}
				isHost={currentLocalPlayer === 'host'}
				hostScore={localGameState.hostScore}
				guestScore={localGameState.guestScore}
				roundNumber={localGameState.roundNumber}
				isClueGiver={isCurrentPlayerClueGiver}
				currentRole={isCurrentPlayerClueGiver ? 'Clue Giver' : 'Guesser'}
				lastRoundScore={localGameState.lastRoundScore}
				onConfigureEndpoints={handleLocalConfigureEndpoints}
				onSubmitClue={handleLocalSubmitClue}
				onSubmitGuess={handleLocalSubmitGuess}
				onNextRound={handleLocalNextRound}
				isLocalMode={true}
				localPlayerName={currentLocalPlayer === 'host' ? 'Player 1' : 'Player 2'}
			/>
		{/if}
	{:else if connection.connectionState !== 'connected'}
		<PeerJSConnectionPanel
			connectionState={connection.connectionState}
			myPeerId={connection.myPeerId}
			errorMessage={connection.errorMessage}
			onInitialize={handleInitialize}
			onConnect={handleConnect}
			onLocalMode={handleLocalMode}
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
