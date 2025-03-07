package models

import (
	"gorm.io/gorm"
)

/* 사용자 정보 저장 (관리자 및 창고 직원) */
type User struct {
	gorm.Model
	Name     string `gorm:"size:100;not null"`
	Email    string `gorm:"size:100;uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"size:50;not null"` // "admin", "staff"
}

