package models

import (
	"time"

	"gorm.io/gorm"
)

/* 재고 이동 기록 저장 */
type Transaction struct {
	gorm.Model
	InventoryID uint      `json:"inventory_id" binding:"required" validate:"required"`
	Type        string    `json:"type" binding:"required" validate:"required,oneof=in out adjust"` // 입고(IN), 출고(OUT), 조정(ADJUST)
	Quantity    int       `json:"quantity" binding:"required" validate:"required"`
	Timestamp   time.Time `json:"timestamp" binding:"required" validate:"required"`

	// 연관관계
	Inventory *Inventory `gorm:"foreignKey:InventoryID;constraint:OnDelete:CASCADE"` // Inventory 삭제 시 Transaction 삭제
}
