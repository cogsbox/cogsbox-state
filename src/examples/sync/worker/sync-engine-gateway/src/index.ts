import { DurableObject } from 'cloudflare:workers';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

// Define our interfaces
interface Env {
	WEBSOCKET_SYNC_ENGINE: DurableObjectNamespace;
	JWT_SECRET: string;
}

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
	exp: number; // Expiration timestamp
	iat: number; // Issued at timestamp
};

declare global {
	interface WebSocket {
		syncKeys?: Set<string>;
		tenantId?: number;
		serviceId?: number;
	}
}

export class WebSocketSyncEngine extends DurableObject {
	constructor(
		readonly ctx: DurableObjectState,
		readonly env: Env,
	) {
		super(ctx, env);
	}

	async fetch(request: Request) {
		const url = new URL(request.url);

		// Extract and validate JWT token
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

		// Verify the token
		let payload: SyncTokenPayload;
		try {
			const isValid = await verify(token, this.env.JWT_SECRET);
			if (!isValid) {
				throw new Error('Invalid token');
			}

			// Decode the token payload
			const decoded = JSON.parse(atob(token.split('.')[1]));
			payload = decoded as SyncTokenPayload;

			// Check if token is expired
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

		// Create WebSocket pair
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		// Initialize the WebSocket properties
		server.syncKeys = new Set();
		server.tenantId = payload.tenantId;
		server.serviceId = payload.serviceId;

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	// Handle registration of a sync key
	async handleSyncKeyRegistration(ws: WebSocket, syncKey: string) {
		// Validate the syncKey format to ensure it belongs to this tenant
		// Expected format: "serviceId-tenantId-stateKey-stateId"
		const parts = syncKey.split('-');
		if (parts.length < 4) {
			ws.send(
				JSON.stringify({
					type: 'error',
					message: 'Invalid syncKey format',
					syncKey,
				}),
			);
			return;
		}

		// Ensure the tenant and service IDs match those from the token
		const [serviceId, tenantId] = parts;
		if (parseInt(serviceId, 10) !== ws.serviceId || parseInt(tenantId, 10) !== ws.tenantId) {
			ws.send(
				JSON.stringify({
					type: 'error',
					message: 'Unauthorized access to this sync key',
					syncKey,
				}),
			);
			return;
		}

		// Add to this WebSocket's registered keys
		if (!ws.syncKeys) {
			ws.syncKeys = new Set();
		}
		ws.syncKeys.add(syncKey);

		// Check if we already have state for this syncKey
		const state = await this.ctx.storage.get(syncKey);
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
					}
					break;

				case 'unregister':
					// Client wants to unregister from a sync key
					if (data.syncKey && ws.syncKeys) {
						ws.syncKeys.delete(data.syncKey);
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
						// Validate ownership of this syncKey
						const parts = data.syncKey.split('-');
						if (parts.length < 4 || parseInt(parts[0], 10) !== ws.serviceId || parseInt(parts[1], 10) !== ws.tenantId) {
							ws.send(
								JSON.stringify({
									type: 'error',
									message: 'Unauthorized access to this sync key',
									syncKey: data.syncKey,
								}),
							);
							return;
						}

						await this.ctx.storage.put(data.syncKey, data.data);
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
						// Validate ownership of this syncKey
						const parts = data.syncKey.split('-');
						if (parts.length < 4 || parseInt(parts[0], 10) !== ws.serviceId || parseInt(parts[1], 10) !== ws.tenantId) {
							ws.send(
								JSON.stringify({
									type: 'error',
									message: 'Unauthorized access to this sync key',
									syncKey: data.syncKey,
								}),
							);
							return;
						}

						// Store the updated state
						await this.ctx.storage.put(data.syncKey, data.data);
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
						// Validate ownership of this syncKey
						const parts = data.syncKey.split('-');
						if (parts.length < 4 || parseInt(parts[0], 10) !== ws.serviceId || parseInt(parts[1], 10) !== ws.tenantId) {
							ws.send(
								JSON.stringify({
									type: 'error',
									message: 'Unauthorized access to this sync key',
									syncKey: data.syncKey,
								}),
							);
							return;
						}

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
