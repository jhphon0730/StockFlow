package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"net/http"
)

type TransactionService interface {
	FindAll() (int, []models.Transaction, error)
}

type transactionService struct {
	transactionRepository repositories.TransactionRepository
}

func NewTransactionService(transactionRepository repositories.TransactionRepository) TransactionService {
	return &transactionService{
		transactionRepository: transactionRepository,
	}
}

func (t *transactionService) FindAll() (int, []models.Transaction, error) {
	transactions, err := t.transactionRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, transactions, nil
}
