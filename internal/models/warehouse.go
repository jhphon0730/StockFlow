package models

import (
	"gorm.io/gorm"
)

/* 창고 정보 저장 */
type Warehouse struct {
	gorm.Model
	Name        string      `json:"name" binding:"required" validate:"required"`
	Location    string      `json:"location" binding:"required" validate:"required"`
	Inventories []Inventory `gorm:"foreignKey:WarehouseID"` // 하나의 창고에 여러 재고 항목이 있음
}
