package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"net/http"
)

type TransactionService interface {
	FindAll() (int, []models.Transaction, error)
	FindByID(id uint) (int, *models.Transaction, error)
	Create(transaction *models.Transaction) (int, *models.Transaction, error)
	Delete(id uint) (int, error)
}

type transactionService struct {
	transactionRepository repositories.TransactionRepository
	inventoryRepository repositories.InventoryRepository
}

func NewTransactionService(transactionRepository repositories.TransactionRepository, inventoryRepository repositories.InventoryRepository) TransactionService {
	return &transactionService{
		transactionRepository: transactionRepository,
		inventoryRepository: inventoryRepository,
	}
}

func (t *transactionService) FindAll() (int, []models.Transaction, error) {
	transactions, err := t.transactionRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, transactions, nil
}

func (t *transactionService) FindByID(id uint) (int, *models.Transaction, error) {
	transaction, err := t.transactionRepository.FindByID(id)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, transaction, nil
}

func (t *transactionService) Create(transaction *models.Transaction) (int, *models.Transaction, error) {
	createdTransaction, err := t.transactionRepository.Create(transaction)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if err := t.inventoryRepository.UpdateQuantity(createdTransaction.InventoryID, createdTransaction.Quantity, createdTransaction.Type); err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdTransaction, nil
}

func (t *transactionService) Delete(id uint) (int, error) {
	err := t.transactionRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
