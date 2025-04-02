import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { getCookie } from "@/lib/cookies";
import type { Message } from "@/types/websocket/message";

function getRoomId(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname.substring(1) : pathname;
  return path || "dashboard";
}

export function useWebSocket(): { socketRef: React.MutableRefObject<WebSocket | null>; isConnected: boolean; roomID: string } {
  const location = useLocation();

  const roomID = getRoomId(location.pathname);
	const userID = getCookie("userID");
  const URL = import.meta.env.VITE_WS_URL + `/ws?roomID=${roomID}&clientID=${userID}`;

  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

	if (userID === "" || !userID) {
		console.error("User ID is not set");
		return { socketRef, isConnected, roomID };
	}

  useEffect(() => {
    const socket = new WebSocket(URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("Received message:", event.data);
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    const handleLeave = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
				const message: Message = { action: "leave", roomID, clientID: userID };
        socketRef.current.send(JSON.stringify(message));
        socketRef.current.close();
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      handleLeave();
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [URL, roomID]);

  return { socketRef, isConnected, roomID };
}
