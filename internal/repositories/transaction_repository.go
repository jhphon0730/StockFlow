package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	FindAll() ([]models.Transaction, error)
	FindByID(id uint) (*models.Transaction, error)
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{
		db: db,
	}
}

// 모든 재고내역 조회 
func (r *transactionRepository) FindAll() ([]models.Transaction, error) {
	var transactions []models.Transaction

	if err := r.db.Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

// 재고내역 조회
func (r *transactionRepository) FindByID(id uint) (*models.Transaction, error) {
	var transaction models.Transaction

	if err := r.db.Preload("Inventory").First(&transaction, id).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

// 재고내역 생성

// 재고내역 삭제
