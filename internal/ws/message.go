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

// 특정 사용자가 데이터 추가/삭제/수정 시에 다른 사용자에게 데이터 수정이 있었음을 알리기 위한 메시지 전송
func (w *webSocketManager) broadcasting() {
	for {
		msg := <-msgChan

		roomID := msg.RoomID
		clientID := msg.ClientID

		message, err := utils.JsonEncode(msg)
		if err != nil {
			log.Printf("Error encoding message: %v", err)
			continue
		}

		w.Mutex.Lock()
		room, ok := w.Rooms[roomID]
		w.Mutex.Unlock()

		if !ok {
			return
		}

		room.Mutex.Lock()
		defer room.Mutex.Unlock()

		for client := range room.Clients {
			if client.ID == clientID || client.Conn == nil {
				continue
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Error broadcasting to client %s: %v", client.ID, err)
			}
		}
	}
}
