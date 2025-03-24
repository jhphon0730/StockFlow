package handlers

import "github.com/jhphon0730/StockFlow/internal/repositories"

type TransactionHandler interface {
}

type transactionHandler struct {
	transactionRepository repositories.TransactionRepository
}

func NewTransactionHandler(transactionRepository repositories.TransactionRepository) TransactionHandler {
	return &transactionHandler{
		transactionRepository: transactionRepository,
	}
}
