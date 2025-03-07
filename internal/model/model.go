package model

import (
	"github.com/jhphon0730/StockFlow/internal/database"

	"gorm.io/gorm"
)

var (
	DB *gorm.DB = database.GetDB()
)
