package models

import "gorm.io/gorm"

/* 제품의 입출고 기록 저장 (입고, 출고, 조정) */
type Transaction struct {
	gorm.Model
	InventoryID uint        `gorm:"not null"`
	Type        string      `gorm:"size:50;not null"` // "in", "out", "adjust"
	Quantity    int         `gorm:"not null"`
	Inventory   Inventory   `gorm:"foreignKey:InventoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

