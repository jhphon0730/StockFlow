package models

import (
	"gorm.io/gorm"
)

/* 사용자 정보 저장 (관리자 및 창고 직원) */
type User struct {
	gorm.Model
	Name     string `json:"name" binding:"required" validate:"required"`
	Email    string `json:"email" gorm:"unique" binding:"required" validate:"required,email"`
	Password string `json:"password" binding:"required" validate:"required"`
	Role     string `json:"role" binding:"required" validate:"required"`
}
