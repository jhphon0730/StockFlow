package handlers_test

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"gorm.io/gorm"
)

func setupInventory() (*gorm.DB, *gin.Engine, repositories.ProductRepository, services.ProductService, handlers.ProductHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	productRepo := repositories.NewProductRepository(db)
	productService := services.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	router := gin.Default()
	return db, router, productRepo, productService, productHandler
}

func cleanupInventory(db *gorm.DB) {
	db.Exec("DELETE FROM products")
}

func TestCreateInventory(t *testing.T) {}
