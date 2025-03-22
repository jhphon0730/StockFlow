package services

import "github.com/jhphon0730/StockFlow/internal/repositories"

type TransactionService interface {

}

type transactionService struct {
	transactionRepository repositories.TransactionRepository
}

func NewTransactionService(transactionRepository repositories.TransactionRepository) TransactionService {
	return &transactionService{
		transactionRepository: transactionRepository,
	}
}
