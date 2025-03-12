package models

import "gorm.io/gorm"

/* 고객 주문 정보를 저장 (주문 상태 포함) */
type Order struct {
	gorm.Model

	UserID uint   `json:"userID" gorm:"not null" binding:"required" validate:"required"`
	Status string `json:"status" gorm:"size:50;not null" binding:"required" validate:"required"`

	User       User        `json:"user" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	OrderItems []OrderItem `json:"orderItems" gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

/* 주문 내 제품 리스트 저장 (제품 ID, 수량, 가격) */
type OrderItem struct {
	gorm.Model

	OrderID   uint    `json:"orderID" gorm:"not null" binding:"required" validate:"required"`
	ProductID uint    `json:"productID" gorm:"not null" binding:"required" validate:"required"`
	Quantity  int     `json:"quantity" gorm:"not null" binding:"required" validate:"required"`
	Price     float64 `json:"price" gorm:"not null" binding:"required" validate:"required"`

	Order   Order   `json:"order" gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product Product `json:"product" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
