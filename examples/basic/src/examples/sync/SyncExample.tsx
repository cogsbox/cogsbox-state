import { useWebSocketConnection } from './useWebsocketConnection';

export default function SyncExample() {
  const ws = useWebSocketConnection({
    url: 'ws://localhost:3000/ws',
    connect: true,
  });
  return <>Sync Example</>;
}
