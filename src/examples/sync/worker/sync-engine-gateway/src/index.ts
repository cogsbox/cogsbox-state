import { DurableObject } from 'cloudflare:workers';
type SuccessAuthed = {
	success: boolean;
	valid: boolean;
	tenantId: number;
	serviceId: number;
	scopes: string[];
};
export class WebSockeSyncEngine extends DurableObject {
	// Store timeouts for each WebSocket
	private timeouts = new Map<WebSocket, number>();
	// Timeout duration in milliseconds (5 minutes)
	private readonly TIMEOUT_DURATION = 5000; //5 * 60 * 1000 tesitng with 5 seconds

	async fetch(request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		// Set initial timeout for this WebSocket
		this.resetTimeout(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		// Reset timeout whenever a message is received
		this.resetTimeout(ws);

		ws.send(`[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`);
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// Clear the timeout when the WebSocket is closed
		this.clearTimeoutForWebSocket(ws);
		ws.close(code, 'Durable Object is closing WebSocket');
	}

	// Helper method to reset the timeout for a WebSocket
	private resetTimeout(ws: WebSocket) {
		// Clear any existing timeout
		this.clearTimeoutForWebSocket(ws);

		// Set a new timeout
		const timeoutId = setTimeout(() => {
			console.log('WebSocket timeout - closing inactive connection');
			ws.close(1000, 'Connection timeout due to inactivity');
			this.timeouts.delete(ws);
		}, this.TIMEOUT_DURATION);

		// Store the timeout ID
		this.timeouts.set(ws, timeoutId);
	}

	// Helper method to clear the timeout for a WebSocket
	private clearTimeoutForWebSocket(ws: WebSocket) {
		const timeoutId = this.timeouts.get(ws);
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			this.timeouts.delete(ws);
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/websocket' && request.method === 'GET') {
			const authResult = await handleAuth(request);

			// If handleAuth returns a Response, it means auth failed
			if (authResult instanceof Response) {
				console.log('failed');
				return authResult;
			}

			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Expected Upgrade: websocket', { status: 426 });
			}

			const id = env.WEBSOCKET_SYNC_ENGINE.idFromName('sync-engine');
			const stub = env.WEBSOCKET_SYNC_ENGINE.get(id);

			return stub.fetch(request);
		}
		return new Response(`<html><body><h1>Sync Engine Worker</h1></body></html>`, {
			headers: { 'Content-Type': 'text/html' },
		});
	},
};
async function handleAuth(request: Request) {
	try {
		const url = new URL(request.url);
		const token = url.searchParams.get('token');

		if (!token) {
			throw new Error('Missing token');
		}

		const authResponse = await fetch('https://goot.co.uk:60002/ext/check-tenant-api-key', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		// Make sure the response is valid JSON
		const authResult = (await authResponse.json()) as SuccessAuthed;
		console.log('authResult', authResult);

		if (!authResult.success || !authResult.valid) {
			throw new Error('Invalid token');
		}

		// If auth is successful, just return without throwing
		return;
	} catch (error: any) {
		// Instead of throwing, return a proper error response
		return new Response(JSON.stringify({ success: false, message: error.message || 'Authentication failed' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
