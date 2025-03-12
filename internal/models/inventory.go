package models

import "gorm.io/gorm"

/* 특정 창고의 제품 재고 관리 (창고별 제품 수량) */
type Inventory struct {
	gorm.Model

	WarehouseID uint `json:"warehouseID" gorm:"not null" binding:"required" validate:"required"`
	ProductID   uint `json:"productID" gorm:"not null" binding:"required" validate:"required"`
	Quantity    int  `json:"quantity" gorm:"not null;default:0" binding:"required" validate:"required"`

	Warehouse    Warehouse     `json:"warehouse" gorm:"foreignKey:WarehouseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product      Product       `json:"product" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Transactions []Transaction `json:"transactions" gorm:"foreignKey:InventoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
