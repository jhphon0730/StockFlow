package models

import (
	"gorm.io/gorm"
)

/* 재고 정보 저장 */
type Inventory struct {
	gorm.Model
	WarehouseID uint `json:"warehouse_id" binding:"required" validate:"required"`
	ProductID   uint `json:"product_id" binding:"required" validate:"required"`
	Quantity    int  `json:"quantity" binding:"required" validate:"required,gte=0"` // 재고 수량 (0 이상)

	// 연관관계
	Warehouse    Warehouse     `gorm:"foreignKey:WarehouseID"`
	Product      Product       `gorm:"foreignKey:ProductID"`
	Transactions []Transaction `gorm:"foreignKey:InventoryID"` // 해당 재고의 입출고 기록
}
