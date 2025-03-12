package handlers_test

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		// 배포 모드로 설정하여 로그를 출력하지 않도록 설정
		Logger: logger.Default.LogMode(logger.Silent),
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
	)

	return db
}

func CreateTestUser(db *gorm.DB) (*models.User, error) {
	user := models.User{
		Name:     "test_user",
		Email:    "test_user@example.com",
		Password: "password123!",
		Role:     "staff",
	}
	hashedPW, err := utils.EncryptPassword(user.Password)
	if err != nil {
		return nil, err
	}
	user.Password = hashedPW

	if err := db.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func CreateTestWarehouse(db *gorm.DB) (*models.Warehouse, error) {
	warehouse := models.Warehouse{
		Name:     "test_warehouse",
		Location: "test_location",
	}
	if err := db.Create(&warehouse).Error; err != nil {
		return nil, err
	}

	return &warehouse, nil
}
