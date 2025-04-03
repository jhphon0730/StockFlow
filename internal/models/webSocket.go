package models

type RoomInfo struct {
	RoomID string `json:"roomID"`
	ConnectedClientCount int `json:"connectedClientCount"`
}
