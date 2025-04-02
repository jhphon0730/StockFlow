package ws

import (
	"github.com/gorilla/websocket"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"log"
)

type Message struct {
	Action string `json:"action"`
	RoomID string `json:"roomID"`
	ClientID string `json:"clientID"`
	Data interface{} `json:"data"`
}

func (w *webSocketManager) broadcasting(msg Message) {
	roomID := msg.RoomID
	clientID := msg.ClientID

	message, err := utils.JsonEncode(msg)
	if err != nil {
		log.Printf("Error encoding message: %v", err)
	}

	w.Mutex.Lock()
	room, ok := w.Rooms[roomID]
	w.Mutex.Unlock()

	if !ok {
		return
	}

	room.Mutex.Lock()
	for client := range room.Clients {
		if client.ID == clientID || client.Conn == nil {
			continue
		}

		if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Error broadcasting to client %s: %v", client.ID, err)
		}
	}
	room.Mutex.Unlock()
}

func (w *webSocketManager) broadcastingWithSender(msg Message) {
	roomID := msg.RoomID

	message, err := utils.JsonEncode(msg)
	if err != nil {
		log.Printf("Error encoding message: %v", err)
	}

	w.Mutex.Lock()
	room, ok := w.Rooms[roomID]
	w.Mutex.Unlock()

	if !ok {
		return
	}

	room.Mutex.Lock()
	for client := range room.Clients {
		if client.Conn == nil {
			continue
		}

		if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Error broadcasting to client %s: %v", client.ID, err)
		}
	}
	room.Mutex.Unlock()
}
