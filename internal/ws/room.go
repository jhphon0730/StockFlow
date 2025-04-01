package ws

import (
	"log"
	"sync"
)

type Room struct {
	Clients map[*Client]bool
	Mutex sync.Mutex
}

func (w *webSocketManager) removeRoom(client *Client) {
	log.Printf("Client %s left room %s\n", client.ID, client.RoomID)

	w.Mutex.Lock()
	room, ok := w.Rooms[client.RoomID]
	w.Mutex.Unlock()

	if !ok {
		return
	}

	room.Mutex.Lock()
	delete(room.Clients, client)
	room.Mutex.Unlock()

	// 클라이언트가 모두 나가면 방 삭제
	if len(room.Clients) == 0 {
		w.Mutex.Lock()
		delete(w.Rooms, client.RoomID)
		w.Mutex.Unlock()
	}

	msg := Message{
		Action: "leave",
		RoomID: client.RoomID,
		ClientID: client.ID,
		Data: w.getRoomClientCount(client.RoomID),
	}
	w.broadcasting(msg)
	client.Conn.Close()
}

func (w *webSocketManager) addClientRoom(client *Client) {
	log.Printf("Client %s joined room %s\n", client.ID, client.RoomID)

	w.Mutex.Lock()
	room, ok := w.Rooms[client.RoomID]
	if !ok {
		room = &Room{
			Clients: make(map[*Client]bool),
		}
		w.Rooms[client.RoomID] = room
	}
	w.Mutex.Unlock()

	room.Mutex.Lock()
	room.Clients[client] = true
	room.Mutex.Unlock()

	msg := Message{
		Action: "join",
		RoomID: client.RoomID,
		ClientID: client.ID,
		Data: w.getRoomClientCount(client.RoomID),
	}
	w.broadcasting(msg)
}

func (w *webSocketManager) getRoomClientCount(roomID string) int {
	w.Mutex.Lock()
	room, ok := w.Rooms[roomID]
	w.Mutex.Unlock()

	if !ok {
		return 0
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	return len(room.Clients)
}
