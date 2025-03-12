package models

import (
	"gorm.io/gorm"
)

/* 제품 정보 저장 */
type Product struct {
	gorm.Model
	Name        string      `json:"name" binding:"required" validate:"required"`
	Description string      `json:"description"` // 선택적 설명
	SKU         string      `json:"sku" gorm:"unique" binding:"required" validate:"required"`
	Inventories []Inventory `gorm:"foreignKey:ProductID"` // 하나의 제품에 여러 재고 항목이 있음
}
