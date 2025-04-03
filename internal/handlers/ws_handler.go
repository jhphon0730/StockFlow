package handlers

import (
	"github.com/jhphon0730/StockFlow/internal/ws"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"errors"
	"net/http"
)

type WebSocketHandler interface {
	HandleSocket(c *gin.Context)
	GetRoomInfo(c *gin.Context)
}

type webSocketHandler struct {
	wsManager ws.WebSocketManager
}

func NewWebSocketHandler(wsManager ws.WebSocketManager) WebSocketHandler {
	return &webSocketHandler{
		wsManager: wsManager,
	}
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func (w *webSocketHandler) HandleSocket(c *gin.Context) {
	roomID := c.DefaultQuery("roomID", "")
	clientID := c.DefaultQuery("clientID", "")

	if roomID == "" || clientID == "" {
		utils.JSONResponse(c, http.StatusBadRequest, nil, errors.New("roomID and clientID are required"))
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, nil, err)
		return
	}

	w.wsManager.HandleConnection(conn, roomID, clientID)
}

func (w *webSocketHandler) GetRoomInfo(c *gin.Context) {
	roomInfo := w.wsManager.GetRoomClientCount()

	utils.JSONResponse(c, http.StatusOK, roomInfo, nil)
}
