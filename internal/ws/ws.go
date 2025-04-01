package ws

import (
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gorilla/websocket"

	"log"
	"sync"
)

type Client struct {
	ID string
	Conn *websocket.Conn
	RoomID string
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

	w.addClientRoom(client)

	go w.handleMessage(client)
}

func (w *webSocketManager) handleMessage(client *Client) {
	defer func() {
		client.Conn.Close()
		w.removeRoom(client)
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
		if err := utils.JsonDecode(message, &msg); err != nil {
			log.Println("Error unmarshaling message: ", err)
			// 클라이언트에게 에러 메시지 전송
			client.Conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"invalid message format"}`))
			continue // 잘못된 메시지 무시
		}

		msg.ClientID = client.ID
		msg.RoomID = client.RoomID

		w.broadcasting(msg)
	}
}

