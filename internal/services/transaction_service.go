package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/pkg/redis"

	"net/http"
	"context"
)

type TransactionService interface {
	FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Transaction, error)
	FindByID(id uint) (int, *models.Transaction, error)
	Create(transaction *models.Transaction, ctx context.Context) (int, *models.Transaction, error)
	Delete(id uint, ctx context.Context) (int, error)
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

func (t *transactionService) getTransactionRedis(ctx context.Context) redis.TransactionRedis {
	transactionRedis, err := redis.GetTransactionRedis(ctx)
	if err != nil {
		return nil
	}

	return transactionRedis
}

func (t *transactionService) FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Transaction, error) {
	transactionRedis := t.getTransactionRedis(ctx)

	if transactionRedis != nil && len(search_filter) == 0 {
		transactions, err := transactionRedis.GetTransactionCache(ctx)
		if err == nil && len(transactions) > 0 {
			return http.StatusOK, transactions, nil
		}
	}

	transactions, err := t.transactionRepository.FindAll(search_filter)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if transactionRedis != nil && len(search_filter) == 0 {
		_ = transactionRedis.SetTransactionCache(ctx, transactions)
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

func (t *transactionService) Create(transaction *models.Transaction, ctx context.Context) (int, *models.Transaction, error) {
	createdTransaction, err := t.transactionRepository.Create(transaction)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if err := t.inventoryRepository.UpdateQuantity(createdTransaction.InventoryID, createdTransaction.Quantity, createdTransaction.Type); err != nil {
		return http.StatusInternalServerError, nil, err
	}

	redis.RestoreRedisData(ctx)

	return http.StatusCreated, createdTransaction, nil
}

func (t *transactionService) Delete(id uint, ctx context.Context) (int, error) {
	err := t.transactionRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	redis.RestoreRedisData(ctx)

	return http.StatusOK, nil
}
