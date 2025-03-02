import { DurableObject } from 'cloudflare:workers';

type SuccessAuthed = {
	success: boolean;
	valid: boolean;
	tenantId: number;
	serviceId: number;
	scopes: string[];
};
declare global {
	interface WebSocket {
		syncKeys?: Set<string>;
	}
}

export class WebSockeSyncEngine extends DurableObject {
	async fetch(request: Request) {
		const url = new URL(request.url);
		// No longer using syncKey from URL parameters

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		// Initialize the syncKeys set for this WebSocket
		server.syncKeys = new Set();

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	// Handle registration of a sync key
	async handleSyncKeyRegistration(ws: WebSocket, syncKey: string) {
		// Add to this WebSocket's registered keys
		if (!ws.syncKeys) {
			ws.syncKeys = new Set();
		}
		ws.syncKeys.add(syncKey);

		// Check if we already have state for this syncKey
		const state = await this.ctx.storage.get(syncKey);
		console.log(`State for key: ${JSON.stringify(state)}`);
		if (!state) {
			// We don't have state for this key, request it from the client
			try {
				ws.send(
					JSON.stringify({
						type: 'fetchState',
						syncKey: syncKey,
					}),
				);
			} catch (error) {
				console.error('Error requesting state:', error);
			}
		} else {
			ws.send(
				JSON.stringify({
					type: 'stateData',
					syncKey: syncKey,
					data: state,
				}),
			);
		}
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		let data;
		try {
			// Parse the message
			if (typeof message === 'string') {
				data = JSON.parse(message);
			} else {
				const decoder = new TextDecoder();
				data = JSON.parse(decoder.decode(message));
			}

			// Handle different message types
			switch (data.type) {
				case 'register':
					// Client is registering interest in a sync key
					if (data.syncKey) {
						await this.handleSyncKeyRegistration(ws, data.syncKey);
						console.log(`Registered sync key: ${data.syncKey}`);
					}
					break;

				case 'unregister':
					// Client wants to unregister from a sync key
					if (data.syncKey && ws.syncKeys) {
						ws.syncKeys.delete(data.syncKey);
						console.log(`Unregistered sync key: ${data.syncKey}`);

						// Confirm unregistration to client
						ws.send(
							JSON.stringify({
								type: 'unregistered',
								syncKey: data.syncKey,
							}),
						);
					}
					break;

				case 'stateData':
					// Client is providing state data in response to our fetchState request
					if (data.syncKey && data.data) {
						await this.ctx.storage.put(data.syncKey, data.data);
						console.log(`Received and stored state for key: ${data.syncKey}`);

						// Notify client that state is stored
						ws.send(
							JSON.stringify({
								type: 'syncReady',
								syncKey: data.syncKey,
							}),
						);
					}
					break;
				case 'broadcastUpdate':
					if (data.syncKey && data.data) {
						// Store the updated state
						await this.ctx.storage.put(data.syncKey, data.data);
						console.log(`Updated state for key: ${data.syncKey}`);

						// Broadcast to other clients
						await this.broadcastStateUpdate(ws, data.syncKey, data.data);

						// Confirm to sender
						ws.send(
							JSON.stringify({
								type: 'updateConfirmed',
								syncKey: data.syncKey,
							}),
						);
					}
					break;
				case 'clearStorage':
					if (data.syncKey) {
						await this.ctx.storage.delete(data.syncKey);
						console.log(`Cleared storage for key: ${data.syncKey}`);
						ws.send(
							JSON.stringify({
								type: 'storageCleared',
								syncKey: data.syncKey,
							}),
						);
					}
					break;
				default:
					console.log(`Received message: ${typeof message === 'string' ? message : '[binary data]'}`);
			}
		} catch (error: any) {
			// Error handling
			ws.send(`Error processing message: ${error.message}`);
		}
	}

	// Broadcast state updates to all connected clients with the same syncKey except sender
	async broadcastStateUpdate(sender: WebSocket, syncKey: string, state: any) {
		const message = JSON.stringify({
			type: 'stateUpdated',
			syncKey: syncKey,
			data: state,
		});

		for (const client of this.ctx.getWebSockets()) {
			// Check if this client has registered for this sync key
			if (client !== sender && client.syncKeys?.has(syncKey)) {
				try {
					client.send(message);
				} catch (error) {
					console.error('Error broadcasting state update:', error);
				}
			}
		}
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		console.log(`WebSocket closed with code ${code} and reason: ${reason}`);
		// Clean up any resources related to this WebSocket if needed
	}

	async webSocketError(ws: WebSocket, error: Error) {
		console.error('WebSocket error:', error);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === '/websocket' && request.method === 'GET') {
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Expected Upgrade: websocket', { status: 426 });
			}

			const authResult = await handleAuth(request);

			if (authResult instanceof Response) {
				return authResult;
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

		// Create websocket pair for both success and error cases
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		if (!token) {
			server.accept();
			server.close(4001, 'Authentication failed: Missing token');
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		try {
			const authResponse = await fetch('https://goot.co.uk:60002/ext/check-tenant-api-key', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			// Handle non-OK status from auth service
			if (!authResponse.ok) {
				server.accept();
				server.close(4002, `Authentication service error: ${authResponse.status}`);
				return new Response(null, {
					status: 101,
					webSocket: client,
				});
			}

			// Parse auth result
			const authResult = (await authResponse.json()) as SuccessAuthed;
			console.log('authResult', authResult);

			if (!authResult.success || !authResult.valid) {
				server.accept();
				server.close(4000, 'Authentication failed: Invalid token');
				return new Response(null, {
					status: 101,
					webSocket: client,
				});
			}

			// If auth is successful, return null (indicating success)
			return null;
		} catch (fetchError) {
			// Handle JSON parsing errors or network issues
			server.accept();
			server.close(4003, 'Authentication service unavailable');
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}
	} catch (error: any) {
		// Fallback for any other errors - this should rarely happen
		// Return an HTTP error as last resort
		return new Response(JSON.stringify({ success: false, message: error.message || 'Authentication failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
