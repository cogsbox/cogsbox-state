import { DurableObject } from 'cloudflare:workers';

import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

type AuthResult = {
	success: boolean;
	valid: boolean;
	tenantId: number;
	serviceId: number;
	scopes: string[];
};

type SyncTokenPayload = {
	sessionId: string;
	tenantId: number;
	serviceId: number;
	scopes: string[];
	exp: number;
	iat: number;
};

declare global {
	interface WebSocket {
		syncKeys?: Set<string>;
		tenantId?: number;
		serviceId?: number;
	}
}
export type UpdateTypeDetail = {
	timeStamp: number;
	stateKey: string;
	updateType: 'update' | 'insert' | 'cut';
	path: string[];
	status: 'new' | 'sent' | 'synced';
	oldValue: any;
	newValue: any;
	userId?: number;
};

export class WebSocketSyncEngine extends DurableObject {
	constructor(
		readonly ctx: DurableObjectState,
		readonly env: Env,
	) {
		super(ctx, env);
	}

	async fetch(request: Request) {
		const url = new URL(request.url);

		const token = url.searchParams.get('token');
		if (!token) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Missing authentication token',
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		let payload: SyncTokenPayload;
		try {
			const isValid = await verify(token, this.env.JWT_SECRET);
			if (!isValid) {
				throw new Error('Invalid token');
			}

			const decoded = JSON.parse(atob(token.split('.')[1]));
			payload = decoded as SyncTokenPayload;

			if (payload.exp < Math.floor(Date.now() / 1000)) {
				throw new Error('Token expired');
			}
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Invalid or expired token',
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		server.syncKeys = new Set();
		server.tenantId = payload.tenantId;
		server.serviceId = payload.serviceId;

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async handleSyncKeyRegistration(ws: WebSocket, syncKey: string) {
		if (!ws.syncKeys) {
			ws.syncKeys = new Set();
		}
		ws.syncKeys.add(syncKey);

		const state = await this.ctx.storage.get(syncKey);
		if (!state) {
			try {
				ws.send(
					JSON.stringify({
						type: 'fetchStateFromDb',
						syncKey: syncKey,
					}),
				);
			} catch (error) {
				console.error('Error requesting state:', error);
			}
		} else {
			ws.send(
				JSON.stringify({
					type: 'updateStateInDb',
					syncKey: syncKey,
					data: state,
				}),
			);
		}
	}
	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		let data;
		try {
			if (typeof message === 'string') {
				data = JSON.parse(message);
			} else {
				const decoder = new TextDecoder();
				data = JSON.parse(decoder.decode(message));
			}

			switch (data.type) {
				case 'register':
					if (data.syncKey) {
						await this.handleSyncKeyRegistration(ws, data.syncKey);
					}
					break;

				case 'unregister':
					if (data.syncKey && ws.syncKeys) {
						ws.syncKeys.delete(data.syncKey);

						ws.send(
							JSON.stringify({
								type: 'unregistered',
								syncKey: data.syncKey,
							}),
						);
					}
					break;
				case 'initialSyncState':
					if (data.syncKey && data.data) {
						console.log('initialSyncState', data);
						await this.ctx.storage.put(data.syncKey, data.data);
						ws.send(
							JSON.stringify({
								type: 'syncReady',
								syncKey: data.syncKey,
							}),
						);
					}
					break;

				case 'queueUpdate':
					if (data.syncKey && data.data) {
						const updateDetail = data.data;

						let currentState = await this.ctx.storage.get(data.syncKey);
						console.log('currentState start', currentState, data.syncKey);
						if (currentState) {
							currentState = this.applyPathUpdate(currentState, updateDetail);

							await this.ctx.storage.put(data.syncKey, currentState);

							await this.broadcastStateUpdate(ws, data.syncKey, updateDetail);
						} else {
							ws.send(
								JSON.stringify({
									type: 'error',
									message: 'Cannot update non-existent state',
									syncKey: data.syncKey,
								}),
							);
						}
					}
					break;

				case 'clearStorage':
					if (data.syncKey) {
						await this.ctx.storage.delete(data.syncKey);
						ws.send(
							JSON.stringify({
								type: 'storageCleared',
								syncKey: data.syncKey,
							}),
						);
					}
					break;

				default:
					console.log(`Received unknown message type: ${data.type}`);
			}
		} catch (error: any) {
			// Error handling
			ws.send(
				JSON.stringify({
					type: 'error',
					message: `Error processing message: ${error.message}`,
				}),
			);
		}
	}
	// Apply a path-based update to a state object
	applyPathUpdate(state: any, update: UpdateTypeDetail): any {
		// Create a deep copy of the state
		const newState = JSON.parse(JSON.stringify(state));

		// Get the path and final property to update
		const path = update.path;

		// Handle empty path (update entire state)
		if (path.length === 0) {
			return update.updateType === 'update' ? update.newValue : state;
		}

		// Navigate to the correct position in the state
		let current = newState;

		// Navigate to parent object
		for (let i = 0; i < path.length - 1; i++) {
			const key = path[i];

			// Create the path if it doesn't exist
			if (current[key] === undefined) {
				current[key] = {};
			}

			current = current[key];
		}

		// Get the final key
		const finalKey = path[path.length - 1];

		// Apply the update based on its type
		switch (update.updateType) {
			case 'update':
				current[finalKey] = update.newValue;
				break;

			case 'insert':
				if (Array.isArray(current)) {
					const index = parseInt(finalKey, 10);
					current.splice(index, 0, update.newValue);
				} else {
					current[finalKey] = update.newValue;
				}
				break;

			case 'cut':
				if (Array.isArray(current)) {
					const index = parseInt(finalKey, 10);
					current.splice(index, 1);
				} else {
					delete current[finalKey];
				}
				break;
		}

		// Mark the update as synced
		update.status = 'synced';

		return newState;
	}
	// Broadcast state updates to all connected clients with the same syncKey except sender
	async broadcastStateUpdate(sender: WebSocket, syncKey: string, updateDetail: UpdateTypeDetail) {
		// Get the current state from storage
		const currentState = await this.ctx.storage.get(syncKey);

		if (!currentState) {
			console.error('Cannot broadcast: state not found for key', syncKey);
			return;
		}

		// Broadcast to all clients except the sender
		for (const client of this.ctx.getWebSockets()) {
			if (client !== sender && client.syncKeys?.has(syncKey)) {
				try {
					const message = JSON.stringify({
						type: 'updateState',
						syncKey: syncKey,
						data: currentState, // Just the state, no metadata
					});

					client.send(message);
				} catch (error) {
					console.error('Error broadcasting state update:', error);
				}
			} else {
				console.log('currentState2222222222222222222222', currentState);
				const message = JSON.stringify({
					type: 'updateStateInDb',
					syncKey: syncKey,
					data: currentState,
				});
				client.send(message);
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
		console.log('Request URL:', url.pathname, request.method);

		// Handle CORS preflight requests (OPTIONS)
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		// Handle the sync-token endpoint
		if (url.pathname === '/sync-token' && request.method === 'POST') {
			return handleSyncToken(request, env);
		}

		// Handle the WebSocket connection endpoint
		if (url.pathname === '/websocket' && request.method === 'GET') {
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Expected Upgrade: websocket', { status: 426 });
			}

			const id = env.WEBSOCKET_SYNC_ENGINE.idFromName('sync-engine');
			const stub = env.WEBSOCKET_SYNC_ENGINE.get(id);

			return stub.fetch(request);
		}

		// Default response
		return new Response(`<html><body><h1>Sync Engine Worker</h1><p>Status: Online</p></body></html>`, {
			headers: { 'Content-Type': 'text/html' },
		});
	},
};

// Handler for the sync-token endpoint
async function handleSyncToken(request: Request, env: Env) {
	try {
		// Extract API key from Authorization header
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Missing or invalid authorization header',
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Extract sessionId from the request body
		const body = (await request.json()) as { sessionId: string; service_id?: number };
		const { sessionId, service_id } = body;

		if (!sessionId) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'SessionId is required',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Validate the API key by calling your auth service
		const authResponse = await fetch('https://goot.co.uk:60002/ext/check-tenant-api-key', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!authResponse.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: `Authentication service error: ${authResponse.status}`,
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const authResult = (await authResponse.json()) as AuthResult;

		if (!authResult.success || !authResult.valid) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Authentication failed: Invalid API key',
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Generate a JWT token with appropriate claims
		const payload: SyncTokenPayload = {
			sessionId,
			tenantId: authResult.tenantId,
			serviceId: service_id || authResult.serviceId,
			scopes: authResult.scopes,
			exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
			iat: Math.floor(Date.now() / 1000),
		};

		const token = await sign(payload, env.JWT_SECRET);

		// Return the token and WebSocket connection URL
		const serverUrl = new URL('/websocket', request.url).toString().replace('http', 'ws');
		console.log('authResult', authResult, serverUrl);
		return new Response(
			JSON.stringify({
				success: true,
				sessionToken: token,
				serverUrl,
				expiresIn: 3600, // 1 hour in seconds
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
					'Access-Control-Allow-Origin': '*', // Add this!
					'Access-Control-Allow-Methods': 'POST, OPTIONS', // Add this!
					'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Add this!
				},
			},
		);
	} catch (error: any) {
		console.error('Error generating sync token:', error);
		return new Response(
			JSON.stringify({
				success: false,
				message: error.message || 'Internal server error',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
}
