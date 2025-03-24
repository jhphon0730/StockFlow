package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupTransaction() (*gorm.DB, *gin.Engine, repositories.TransactionRepository, services.TransactionService, handlers.TransactionHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	transactionRepo := repositories.NewTransactionRepository(db)
	transactionService := services.NewTransactionService(transactionRepo)
	transactionHandler := handlers.NewTransactionHandler(transactionService)

	router := gin.Default()
	return db, router, transactionRepo, transactionService, transactionHandler
}
