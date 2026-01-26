export type GamePhase =
	| 'WAITING'
	| 'CONFIGURING'
	| 'CLUE_GIVING'
	| 'GUESSING'
	| 'REVEALING'
	| 'NEXT_ROUND';

export type GameMessage =
	| { type: 'CONFIGURE_ENDPOINTS'; left: string; right: string }
	| { type: 'START_ROUND'; target: number }
	| { type: 'SUBMIT_CLUE'; clue: string }
	| { type: 'SUBMIT_GUESS'; position: number }
	| { type: 'REVEAL' }
	| { type: 'NEXT_ROUND' }
	| { type: 'STATE_SYNC'; state: Partial<GameState> };

export interface GameState {
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
}
