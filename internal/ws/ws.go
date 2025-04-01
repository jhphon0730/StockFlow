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

func (w *webSocketManager) handleMessage(client *Client) {
	defer func() {
		w.removeRoom(client, client.RoomID)
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message: ", err)
			// WebSocket 연결이 끊어진 경우
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Unexpected close error for client %s", client.ID)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("Error unmarshaling message: ", err)
			// 클라이언트에게 에러 메시지 전송
			client.Conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"invalid message format"}`))
			continue // 잘못된 메시지 무시
		}

		switch msg.Action {
		case "join":
		case "leave":
			return
		case "update":
			w.broadcastMessage(msg.RoomID, message)
		default:
			log.Printf("Unknown action: %s", msg.Action)
		}
	}
}

func (w *webSocketManager) broadcastMessage(roomID string, message []byte) {
	w.Mutex.Lock()
	room, ok := w.Rooms[roomID]
	w.Mutex.Unlock()

	if !ok {
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	for client := range room.Clients {
		if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Error broadcasting to client %s: %v", client.ID, err)
			continue
		}
	}
}
