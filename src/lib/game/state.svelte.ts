import type { GamePhase, GameState } from './types';
import { calculateScore } from './scoring';
import { generateTarget } from '$lib/utils/random';

export function createGameState(isHost: boolean) {
	let phase = $state<GamePhase>('WAITING');
	let leftEndpoint = $state('Hot');
	let rightEndpoint = $state('Cold');
	let targetPosition = $state(0.5);
	let guessPosition = $state(0.5);
	let currentClue = $state('');
	let hostScore = $state(0);
	let guestScore = $state(0);
	let roundNumber = $state(1);
	let lastRoundScore = $state(0);

	const isClueGiver = $derived(
		(roundNumber % 2 === 1 && isHost) || (roundNumber % 2 === 0 && !isHost)
	);

	const currentRole = $derived(isClueGiver ? 'Clue Giver' : 'Guesser');

	function setPhase(newPhase: GamePhase) {
		phase = newPhase;
	}

	function setEndpoints(left: string, right: string) {
		leftEndpoint = left;
		rightEndpoint = right;
	}

	function setTarget(target: number) {
		targetPosition = target;
	}

	function setGuess(guess: number) {
		guessPosition = guess;
	}

	function setClue(clue: string) {
		currentClue = clue;
	}

	function startRound() {
		// Generate new target if host
		if (isHost) {
			targetPosition = generateTarget();
		}
		currentClue = '';
		guessPosition = 0.5;
		phase = 'CLUE_GIVING';
	}

	function submitClue(clue: string) {
		currentClue = clue;
		phase = 'GUESSING';
	}

	function submitGuess(guess: number) {
		guessPosition = guess;
		phase = 'REVEALING';
	}

	function calculateAndApplyScore() {
		const score = calculateScore(targetPosition, guessPosition);
		lastRoundScore = score;

		// Award points to the guesser
		if (isClueGiver) {
			// Other player is guesser
			if (isHost) {
				guestScore += score;
			} else {
				hostScore += score;
			}
		} else {
			// Current player is guesser
			if (isHost) {
				hostScore += score;
			} else {
				guestScore += score;
			}
		}
	}

	function nextRound() {
		roundNumber += 1;
		phase = 'NEXT_ROUND';
	}

	function syncState(state: Partial<GameState>) {
		if (state.phase !== undefined) phase = state.phase;
		if (state.leftEndpoint !== undefined) leftEndpoint = state.leftEndpoint;
		if (state.rightEndpoint !== undefined) rightEndpoint = state.rightEndpoint;
		if (state.targetPosition !== undefined) targetPosition = state.targetPosition;
		if (state.guessPosition !== undefined) guessPosition = state.guessPosition;
		if (state.currentClue !== undefined) currentClue = state.currentClue;
		if (state.hostScore !== undefined) hostScore = state.hostScore;
		if (state.guestScore !== undefined) guestScore = state.guestScore;
		if (state.roundNumber !== undefined) roundNumber = state.roundNumber;
	}

	function getState(): GameState {
		return {
			phase,
			leftEndpoint,
			rightEndpoint,
			targetPosition,
			guessPosition,
			currentClue,
			isHost,
			hostScore,
			guestScore,
			roundNumber
		};
	}

	return {
		get phase() {
			return phase;
		},
		get leftEndpoint() {
			return leftEndpoint;
		},
		get rightEndpoint() {
			return rightEndpoint;
		},
		get targetPosition() {
			return targetPosition;
		},
		get guessPosition() {
			return guessPosition;
		},
		set guessPosition(value: number) {
			guessPosition = value;
		},
		get currentClue() {
			return currentClue;
		},
		set currentClue(value: string) {
			currentClue = value;
		},
		get isHost() {
			return isHost;
		},
		get hostScore() {
			return hostScore;
		},
		get guestScore() {
			return guestScore;
		},
		get roundNumber() {
			return roundNumber;
		},
		get isClueGiver() {
			return isClueGiver;
		},
		get currentRole() {
			return currentRole;
		},
		get lastRoundScore() {
			return lastRoundScore;
		},
		setPhase,
		setEndpoints,
		setTarget,
		setGuess,
		setClue,
		startRound,
		submitClue,
		submitGuess,
		calculateAndApplyScore,
		nextRound,
		syncState,
		getState
	};
}
