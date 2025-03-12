package models

import (
	"gorm.io/gorm"
)

/* 각 창고의 정보 저장 (이름, 위치 등) */
type Warehouse struct {
	gorm.Model
	Name       string      `json:"name" binding:"required" validate:"required"`
	Location   string      `json:"location" binding:"required" validate:"required"`
	Iventories []Inventory `json:"inventories" gorm:"foreignKey:WarehouseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
