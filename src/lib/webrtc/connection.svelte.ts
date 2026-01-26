import type { ConnectionState, MessageHandler } from './types';

const ICE_SERVERS = {
	iceServers: [
		// Google STUN server
		{ urls: 'stun:stun.l.google.com:19302' },
		// Free public TURN server from Open Relay Project (multiple transports in one entry)
		{
			urls: [
				'turn:openrelay.metered.ca:80',
				'turn:openrelay.metered.ca:443',
				'turn:openrelay.metered.ca:443?transport=tcp'
			],
			username: 'openrelayproject',
			credential: 'openrelayproject'
		}
	]
};

export function createConnection() {
	let pc = $state<RTCPeerConnection | null>(null);
	let dataChannel = $state<RTCDataChannel | null>(null);
	let connectionState = $state<ConnectionState>('disconnected');
	let offer = $state<string>('');
	let answer = $state<string>('');

	const messageHandlers = new Map<string, MessageHandler>();

	function initPeerConnection() {
		const connection = new RTCPeerConnection(ICE_SERVERS);
		pc = connection;

		connection.oniceconnectionstatechange = () => {
			console.log('ICE connection state:', connection.iceConnectionState);

			if (connection.iceConnectionState === 'connected' || connection.iceConnectionState === 'completed') {
				connectionState = 'connected';
			} else if (connection.iceConnectionState === 'disconnected') {
				connectionState = 'disconnected';
			} else if (connection.iceConnectionState === 'failed') {
				console.error('ICE connection failed');
				connectionState = 'disconnected';
			}
		};

		connection.onicecandidate = (event) => {
			if (event.candidate) {
				console.log('ICE candidate:', event.candidate.type, event.candidate.protocol);
			} else {
				console.log('ICE candidate gathering complete');
			}
		};

		connection.onconnectionstatechange = () => {
			console.log('Connection state:', connection.connectionState);
		};

		return connection;
	}

	function setupDataChannel(channel: RTCDataChannel) {
		dataChannel = channel;

		channel.onopen = () => {
			connectionState = 'connected';
		};

		channel.onclose = () => {
			connectionState = 'disconnected';
		};

		channel.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				const handler = messageHandlers.get(message.type);
				if (handler) {
					handler(message);
				}
			} catch (error) {
				console.error('Failed to parse message:', error);
			}
		};
	}

	async function createOffer(): Promise<string> {
		const connection = initPeerConnection();
		const channel = connection.createDataChannel('game', { ordered: true });
		setupDataChannel(channel);

		connectionState = 'connecting';

		// Create offer with iceRestart to get fresh candidates
		const offerDescription = await connection.createOffer({ iceRestart: false });
		await connection.setLocalDescription(offerDescription);

		// Use a short delay to gather at least host candidates
		// This is much faster than waiting for TURN candidates
		await new Promise<void>((resolve) => {
			setTimeout(() => resolve(), 100); // Just 100ms
		});

		offer = JSON.stringify(connection.localDescription);
		console.log('Offer created with', (offer.match(/a=candidate/g) || []).length, 'candidates');
		return offer;
	}

	async function acceptOffer(offerString: string): Promise<string> {
		const connection = initPeerConnection();

		connection.ondatachannel = (event) => {
			setupDataChannel(event.channel);
		};

		connectionState = 'connecting';

		const offerDesc = JSON.parse(offerString);
		await connection.setRemoteDescription(offerDesc);

		const answerDescription = await connection.createAnswer();
		await connection.setLocalDescription(answerDescription);

		// Use a short delay to gather at least host candidates
		await new Promise<void>((resolve) => {
			setTimeout(() => resolve(), 100); // Just 100ms
		});

		answer = JSON.stringify(connection.localDescription);
		console.log('Answer created with', (answer.match(/a=candidate/g) || []).length, 'candidates');
		return answer;
	}

	async function acceptAnswer(answerString: string): Promise<void> {
		if (!pc) throw new Error('No peer connection');

		const answerDesc = JSON.parse(answerString);
		await pc.setRemoteDescription(answerDesc);
	}

	function sendMessage(message: any): void {
		if (!dataChannel || dataChannel.readyState !== 'open') {
			console.error('Data channel not ready');
			return;
		}

		dataChannel.send(JSON.stringify(message));
	}

	function onMessage(type: string, handler: MessageHandler): void {
		messageHandlers.set(type, handler);
	}

	function disconnect(): void {
		if (dataChannel) {
			dataChannel.close();
			dataChannel = null;
		}
		if (pc) {
			pc.close();
			pc = null;
		}
		connectionState = 'disconnected';
		offer = '';
		answer = '';
	}

	return {
		get connectionState() {
			return connectionState;
		},
		get offer() {
			return offer;
		},
		get answer() {
			return answer;
		},
		createOffer,
		acceptOffer,
		acceptAnswer,
		sendMessage,
		onMessage,
		disconnect
	};
}
