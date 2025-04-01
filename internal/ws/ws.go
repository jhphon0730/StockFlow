package ws

import (
	"github.com/gorilla/websocket"

	"log"
	"sync"
	"encoding/json"
)

type Client struct {
	ID string
	Conn *websocket.Conn
	RoomID string
}

type Message struct {
	Action string `json:"action"`
	RoomID string `json:"roomID"`
	ClientID string `json:"clientID"`
}

type Room struct {
	Clients map[*Client]bool
	Mutex sync.Mutex
}

type WebSocketManager interface {
	HandleConnection(conn *websocket.Conn, roomID string, clientID string)
}

type webSocketManager struct {
	Rooms map[string]*Room
	Mutex sync.Mutex
}

func NewWebSocketManager() WebSocketManager {
	return &webSocketManager{
		Rooms: make(map[string]*Room),
		Mutex: sync.Mutex{},
	}
}

func GetManager() WebSocketManager {
	return wsManager
}

var (
	wsManager = NewWebSocketManager()
)

func (w *webSocketManager) HandleConnection(conn *websocket.Conn, roomID string, clientID string) {
	client := &Client{
		ID: clientID,
		Conn: conn,
		RoomID: roomID,
	}

	w.addClientRoom(client, roomID)

	go w.handleMessage(client)

	defer func() {
		w.removeRoom(client, roomID)
		conn.Close()
	}()
}

func (w *webSocketManager) removeRoom(client *Client, roomID string) {
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
}

func (w *webSocketManager) addClientRoom(client *Client, roomID string) {
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

func (w *webSocketManager) handleMessage(client *Client) {
	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message: ", err)
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("Error unmarshaling message: ", err)
			break
		}

		switch msg.Action {
		case "join":
			log.Printf("Client %s joined room %s\n", client.ID, msg.RoomID)
		case "leave":
			w.removeRoom(client, msg.RoomID)
		}
	}
}
