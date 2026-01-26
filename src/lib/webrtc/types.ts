export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface MessageHandler {
	(data: any): void;
}
