// This is your only real option for a pure SPA
export async function getSyncToken({
    clientId,
    boundaryId,
    ctx,
}: {
    clientId: string;
    boundaryId: string;
    ctx: Record<string, any>;
}) {
    const apiToken = import.meta.env.VITE_COGS_SYNC_API_TOKEN;
    const serverUrl = import.meta.env.VITE_COGS_SYNC_SERVER_URL;

    if (!apiToken) return null;

    try {
        const response = await fetch(`${serverUrl}/sync-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                clientId,
                boundaryId,
                ctx,
            }),
        });

        if (!response.ok) return null;

        const { sessionToken, refreshToken } = await response.json();
        return { sessionToken, refreshToken };
    } catch (error) {
        console.error("Token fetch failed:", error);
        return null;
    }
}
