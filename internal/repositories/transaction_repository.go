package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	FindAll(search_filter map[string]interface{}) ([]models.Transaction, error)
	FindByID(id uint) (*models.Transaction, error)
	Create(transaction *models.Transaction) (*models.Transaction, error)
	Delete(id uint) error
	FindRecentTransactions(limit int) ([]models.Transaction, error)
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
func (r *transactionRepository) FindAll(search_filter map[string]interface{}) ([]models.Transaction, error) {
	var transactions []models.Transaction
	query := r.db

	for key, value := range search_filter {
		switch key {
		case "inventory_id":
			query = query.Where("inventory_id = ?", value)
		case "type":
			query = query.Where("type = ?", value)
		}
	}

	if err := query.Find(&transactions).Error; err != nil {
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
func (r *transactionRepository) Create(transaction *models.Transaction) (*models.Transaction, error) {
	if err := r.db.Create(transaction).Error; err != nil {
		return nil, err
	}

	return transaction, nil
}

// 재고내역 삭제
func (r *transactionRepository) Delete(id uint) error {
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Delete(&models.Transaction{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}


func (r *transactionRepository) FindRecentTransactions(limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction

	if err := r.db.Order("created_at desc").Limit(limit).Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

