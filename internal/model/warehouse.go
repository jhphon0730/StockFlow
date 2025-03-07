package model

import (
	"gorm.io/gorm"
)

/* 각 창고의 정보 저장 (이름, 위치 등) */
type Warehouse struct {
	gorm.Model
	Name        string      `gorm:"size:100;not null"`
	Location    string      `gorm:"size:255;not null"`
	Inventories []Inventory `gorm:"foreignKey:WarehouseID"`
}
