import { create } from "zustand"

import type { Message } from "@/types/websocket/message"

interface WebSocketState {
  socket: WebSocket | null
  isConnected: boolean
  roomID: string
  currentRoomClientCount: number
  message: Message | null
  setSocket: (socket: WebSocket | null) => void
  setIsConnected: (isConnected: boolean) => void
  setRoomID: (roomID: string) => void
  setCurrentRoomClientCount: (count: number) => void
  setMessage: (message: Message | null) => void
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  socket: null,
  isConnected: false,
  roomID: "",
  currentRoomClientCount: 0,
  message: null,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setRoomID: (roomID) => set({ roomID }),
  setCurrentRoomClientCount: (count) => set({ currentRoomClientCount: count }),
  setMessage: (message) => set({ message }),
}))

