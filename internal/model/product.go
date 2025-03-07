package models

import "gorm.io/gorm"

/* 제품 정보 저장 (이름, 설명, SKU 등) */
type Product struct {
	gorm.Model
	Name        string      `gorm:"size:100;not null"`
	Description string      `gorm:"size:255"`
	SKU         string      `gorm:"size:100;uniqueIndex;not null"`
	Inventories []Inventory `gorm:"foreignKey:ProductID"`
	OrderItems  []OrderItem `gorm:"foreignKey:ProductID"`
}

