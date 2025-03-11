package handlers_test

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/jhphon0730/StockFlow/internal/models"
)

var (
	test_db *gorm.DB
)

func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
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

func CreateTestUser() error {
	user := models.User{
		Name:     "TestUser",
		Email:    "testuser@example.com",
		Password: "password123!",
	}

	if err := test_db.Create(&user).Error; err != nil {
		return err
	}

	return nil
}
