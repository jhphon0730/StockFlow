import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function getRoomId(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname.substring(1) : pathname;
  return path || "dashboard";
}

export function useWebSocket() {
  const location = useLocation();

  let roomID = getRoomId(location.pathname);
	const userID = localStorage.getItem("userID") || "test";
  const URL = import.meta.env.VITE_WS_URL || `ws://localhost:8080/api/ws?roomID=${roomID}&clientID=${userID}`;

  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      socket.send(JSON.stringify({ action: "join", roomID }));
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
        socketRef.current.send(JSON.stringify({ action: "leave", roomID }));
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
