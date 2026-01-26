import Peer, { type DataConnection } from 'peerjs';
import type { ConnectionState, MessageHandler } from './types';

export function createPeerJSConnection() {
	let peer = $state<Peer | null>(null);
	let connection = $state<DataConnection | null>(null);
	let connectionState = $state<ConnectionState>('disconnected');
	let myPeerId = $state<string>('');
	let remotePeerId = $state<string>('');
	let errorMessage = $state<string>('');
	let retryCount = $state(0);

	const messageHandlers = new Map<string, MessageHandler>();

	function initialize(isHost: boolean): string {
		// Create peer with Metered TURN servers (free, no signup required)
		peer = new Peer({
			debug: 1,
			config: {
				iceServers: [
					{ urls: 'stun:stun.l.google.com:19302' },
					{
						urls: 'turn:a.relay.metered.ca:80',
						username: 'a834b4446e0e8fee7bcd9ddf',
						credential: 'XuGtKB4MvPfK5kqT'
					},
					{
						urls: 'turn:a.relay.metered.ca:80?transport=tcp',
						username: 'a834b4446e0e8fee7bcd9ddf',
						credential: 'XuGtKB4MvPfK5kqT'
					},
					{
						urls: 'turn:a.relay.metered.ca:443',
						username: 'a834b4446e0e8fee7bcd9ddf',
						credential: 'XuGtKB4MvPfK5kqT'
					},
					{
						urls: 'turns:a.relay.metered.ca:443?transport=tcp',
						username: 'a834b4446e0e8fee7bcd9ddf',
						credential: 'XuGtKB4MvPfK5kqT'
					}
				]
			}
		});

		peer.on('open', (id) => {
			myPeerId = id;
			console.log('My peer ID:', id);
		});

		peer.on('error', (err) => {
			console.error('Peer error:', err);
			errorMessage = err.message;
			connectionState = 'disconnected';
		});

		if (!isHost) {
			// Joiner: wait for incoming connection
			peer.on('connection', (conn) => {
				console.log('Incoming connection from:', conn.peer);
				setupConnection(conn);
			});
		}

		return myPeerId;
	}

	function connectToPeer(peerId: string): void {
		if (!peer) {
			console.error('Peer not initialized');
			errorMessage = 'Peer not initialized. Please refresh and try again.';
			return;
		}

		remotePeerId = peerId;
		connectionState = 'connecting';
		errorMessage = '';
		console.log('Connecting to peer:', peerId);

		const conn = peer.connect(peerId, {
			reliable: true,
			serialization: 'json'
		});

		setupConnection(conn);
	}

	function setupConnection(conn: DataConnection): void {
		connection = conn;

		conn.on('open', () => {
			console.log('Connection opened with:', conn.peer);
			connectionState = 'connected';
			remotePeerId = conn.peer;
		});

		conn.on('data', (data) => {
			try {
				const message = data as any;
				const handler = messageHandlers.get(message.type);
				if (handler) {
					handler(message);
				}
			} catch (error) {
				console.error('Failed to process message:', error);
			}
		});

		conn.on('close', () => {
			console.log('Connection closed');
			connectionState = 'disconnected';
		});

		conn.on('error', (err) => {
			console.error('Connection error:', err);
			errorMessage = `Connection failed: ${err.message}. Try refreshing or use a different network.`;
			connectionState = 'disconnected';
		});
	}

	function sendMessage(message: any): void {
		if (!connection || !connection.open) {
			console.error('Connection not open');
			return;
		}

		connection.send(message);
	}

	function onMessage(type: string, handler: MessageHandler): void {
		messageHandlers.set(type, handler);
	}

	function disconnect(): void {
		if (connection) {
			connection.close();
			connection = null;
		}
		if (peer) {
			peer.destroy();
			peer = null;
		}
		connectionState = 'disconnected';
		myPeerId = '';
		remotePeerId = '';
		errorMessage = '';
	}

	return {
		get connectionState() {
			return connectionState;
		},
		get myPeerId() {
			return myPeerId;
		},
		get remotePeerId() {
			return remotePeerId;
		},
		get errorMessage() {
			return errorMessage;
		},
		initialize,
		connectToPeer,
		sendMessage,
		onMessage,
		disconnect
	};
}
