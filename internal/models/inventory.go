package models

import (
	"gorm.io/gorm"
)

/* 재고 정보 저장 */
type Inventory struct {
	gorm.Model
	WarehouseID uint `json:"warehouse_id" binding:"required" validate:"required"`
	ProductID   uint `json:"product_id" binding:"required" validate:"required"`
	Quantity    int  `json:"quantity" binding:"required" validate:"required,gte=0"`

	// 연관관계
	Warehouse    *Warehouse    `gorm:"foreignKey:WarehouseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // Warehouse 삭제 시 Inventory 삭제
	Product      *Product      `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`   // Product 삭제 시 Inventory 삭제
	Transactions []Transaction `gorm:"foreignKey:InventoryID;constraint:OnDelete:CASCADE"`                  // Inventory 삭제 시 Transaction 삭제
}
