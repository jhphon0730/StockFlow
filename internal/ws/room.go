package ws

import (
	"log"
	"sync"
)

type Room struct {
	Clients map[*Client]bool
	Mutex sync.Mutex
}

func (w *webSocketManager) removeRoom(client *Client, roomID string) {
	log.Printf("Client %s left room %s\n", client.ID, roomID)

	w.Mutex.Lock()
	defer w.Mutex.Unlock()

	if room, ok := w.Rooms[roomID]; ok {
		room.Mutex.Lock()
		defer room.Mutex.Unlock()

		delete(room.Clients, client)

		// Remove room if no clients
		if len(room.Clients) == 0 {
			delete(w.Rooms, roomID)
		}
	}

	client.Conn.Close()
}

func (w *webSocketManager) addClientRoom(client *Client, roomID string) {
	log.Printf("Client %s joined room %s\n", client.ID, client.RoomID)

	w.Mutex.Lock()
	defer w.Mutex.Unlock()
	
	room, ok := w.Rooms[roomID]
	if !ok {
		room = &Room{
			Clients: make(map[*Client]bool),
		}

		w.Rooms[roomID] = room
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	room.Clients[client] = true
}
