package handlers_test

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/jhphon0730/StockFlow/internal/models"
)

func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to open test database: %v", err)
	}
	db.AutoMigrate(
		&models.User{},
		&models.Warehouse{},
		&models.Product{},
		&models.Inventory{},
		&models.Transaction{},
		&models.Order{},
		&models.OrderItem{},
	)

	return db
}

func CreateTestUser(db *gorm.DB) (*models.User, error) {
	user := &models.User{
		Name:     "TestUser",
		Email:    "testuser@example.com",
		Password: "password123!",
	}

	if err := db.Create(&user).Error; err != nil {
		return nil, err
	}

	return user, nil
}
