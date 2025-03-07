package models

import "gorm.io/gorm"

/* 특정 창고의 제품 재고 관리 (창고별 제품 수량) */
type Inventory struct {
	gorm.Model
	WarehouseID  uint          `gorm:"not null"`
	ProductID    uint          `gorm:"not null"`
	Quantity     int           `gorm:"not null;default:0"`
	Warehouse    Warehouse     `gorm:"foreignKey:WarehouseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product      Product       `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Transactions []Transaction `gorm:"foreignKey:InventoryID"`
}
