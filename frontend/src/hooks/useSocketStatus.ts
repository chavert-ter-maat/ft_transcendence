import { useState, useEffect } from "react";
import { getSocket } from "../socket";

export const useSocketStatus = (username?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket(username);

    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket?.id || null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    socket?.on("connect", handleConnect);
    socket?.on("disconnect", handleDisconnect);

    if (socket?.connected) {
      handleConnect();
    }

    return () => {
      socket?.off("connect", handleConnect);
      socket?.off("disconnect", handleDisconnect);
    };
  }, [username]);
  return { isConnected, socketId };
};
