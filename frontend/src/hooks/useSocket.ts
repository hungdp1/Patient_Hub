import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketService.connect();

    const socket = socketService.getSocket();
    if (!socket) {
      return;
    }

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      // Keep the shared socket alive across application pages.
      // The top-level status indicator manages the global connection lifecycle.
    };
  }, []);

  return {
    connected,
    socket: socketService.getSocket(),
  };
}
