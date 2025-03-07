package models

import "gorm.io/gorm"

/* 고객 주문 정보를 저장 (주문 상태 포함) */
type Order struct {
	gorm.Model
	UserID     uint        `gorm:"not null"`
	Status     string      `gorm:"size:50;not null"`
	User       User        `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID"`
}

/* 주문 내 제품 리스트 저장 (제품 ID, 수량, 가격) */
type OrderItem struct {
	gorm.Model
	OrderID   uint    `gorm:"not null"`
	ProductID uint    `gorm:"not null"`
	Quantity  int     `gorm:"not null"`
	Price     float64 `gorm:"not null"`
	Order     Order   `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product   Product `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
