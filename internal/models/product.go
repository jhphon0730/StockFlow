package models

import "gorm.io/gorm"

/* 제품 정보 저장 (이름, 설명, SKU 등) */
type Product struct {
	gorm.Model

	Name        string `json:"name" binding:"required" validate:"required"`
	Description string `json:"description"`
	SKU         string `json:"sku" binding:"required" validate:"required"`

	Inventories []Inventory `json:"inventories" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	OrderItems  []OrderItem `json:"orderItems" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
