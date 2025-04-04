import type React from "react"

import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

import { getCookie } from "@/lib/cookies"
import type { Message } from "@/types/websocket/message"
import { useWebSocketStore } from "@/store/useWebSocketStore"

interface WebSocketExport {
  socketRef: React.MutableRefObject<WebSocket | null>
  isConnected: boolean
  roomID: string
  currentRoomClientCount: number
  message: Message | null
}

function getRoomId(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname.substring(1) : pathname
  return path || "dashboard"
}

export function useWebSocket(): WebSocketExport {
  const location = useLocation()
  const roomID = getRoomId(location.pathname)
  const userID = getCookie("userID")

  // Use the WebSocket store
  const {
    socket,
    isConnected,
    currentRoomClientCount,
    message,
    setSocket,
    setIsConnected,
    setRoomID,
    setCurrentRoomClientCount,
    setMessage,
  } = useWebSocketStore()

  // Create a ref that points to the store's socket
  const socketRef = useRef<WebSocket | null>(socket)

  // Update the ref when the store's socket changes
  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    // Update the roomID in the store
    setRoomID(roomID)
  }, [roomID, setRoomID])

  useEffect(() => {
    if (userID === "" || !userID) {
      console.error("User ID is not set")
      return
    }

    const URL = import.meta.env.VITE_WS_URL + `/ws?roomID=${roomID}&clientID=${userID}`

    // Only create a new connection if one doesn't exist or if it's closed/closing
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      console.log("Creating new WebSocket connection")
      const newSocket = new WebSocket(URL)

      newSocket.onopen = () => {
        console.log("Connected to WebSocket")
        setIsConnected(true)
      }

      newSocket.onmessage = (event) => {
        const receivedMessage: Message = JSON.parse(event.data)
        setCurrentRoomClientCount(receivedMessage.data)

        if (receivedMessage.action !== "update" || receivedMessage.roomID !== roomID) {
          return
        }

        setMessage(receivedMessage)
      }

      newSocket.onerror = (error) => {
        console.error("WebSocket Error:", error)
      }

      newSocket.onclose = () => {
        setIsConnected(false)
        // Only set socket to null if this is the current socket
        if (socketRef.current === newSocket) {
          setSocket(null)
        }
      }

      // Store the new socket in the store
      setSocket(newSocket)
      socketRef.current = newSocket
    } else if (socket.readyState === WebSocket.OPEN && roomID) {
      // If we already have an open connection but the room changed, send a leave message for the old room
      // and join the new room
      const oldRoomID = useWebSocketStore.getState().roomID
      if (oldRoomID && oldRoomID !== roomID) {
        const leaveMessage: Message = { action: "leave", roomID: oldRoomID, clientID: userID }
        socket.send(JSON.stringify(leaveMessage))
        console.log(`Left room: ${oldRoomID}`)
      }
    }

    const handleLeave = () => {
      if (socket?.readyState === WebSocket.OPEN) {
        const leaveMessage: Message = { action: "leave", roomID, clientID: userID }
        socket.send(JSON.stringify(leaveMessage))
        socket.close()
        setSocket(null)
      }
    }

    window.addEventListener("beforeunload", handleLeave)

    return () => {
      // Don't close the socket when unmounting, just handle room changes
      if (socket?.readyState === WebSocket.OPEN) {
        const leaveMessage: Message = { action: "leave", roomID, clientID: userID }
        socket.send(JSON.stringify(leaveMessage))
        console.log(`Left room: ${roomID}`)
      }
      window.removeEventListener("beforeunload", handleLeave)
    }
  }, [roomID, userID, socket, setIsConnected, setSocket, setCurrentRoomClientCount, setMessage])

  return { socketRef, isConnected, roomID, currentRoomClientCount, message }
}

