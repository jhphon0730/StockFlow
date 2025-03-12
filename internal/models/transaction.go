package models

import "gorm.io/gorm"

/* 제품의 입출고 기록 저장 (입고, 출고, 조정) */
type Transaction struct {
	gorm.Model

	InventoryID uint   `json:"inventoryID" gorm:"not null" binding:"required" validate:"required"`
	Type        string `json:"type" gorm:"size:50;not null" binding:"required" validate:"required"` // "in", "out", "adjust"
	Quantity    int    `json:"quantity" gorm:"not null" binding:"required" validate:"required"`

	Inventory Inventory `json:"inventory" gorm:"foreignKey:InventoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
