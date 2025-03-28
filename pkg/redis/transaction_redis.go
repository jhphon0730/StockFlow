package redis

import (
	"github.com/jhphon0730/StockFlow/internal/config"
	"github.com/jhphon0730/StockFlow/internal/models"

	"github.com/go-redis/redis/v8"

	"sync"
	"errors"
	"context"
	"strconv"
	"encoding/json"
)

type TransactionRedis interface {
	DeleteTransactionCache(ctx context.Context) error
	SetTransactionCache(ctx context.Context, transactions []models.Transaction) error
	GetTransactionCache(ctx context.Context) ([]models.Transaction, error)
	Close() error
}

type transactionRedis struct {
	client *redis.Client
}

var (
	transaction_once     sync.Once
	transaction_instance TransactionRedis
)

func NewTransactionRedis(ctx context.Context) error {
	config := config.GetConfig()
	db, err := strconv.Atoi(config.Redis.REDIS_TRANSACTION_DB)
	if err != nil {
		return err
	}

	transactionClient := redis.NewClient(&redis.Options{
		Addr:     config.Redis.REDIS_HOST + ":" + config.Redis.REDIS_PORT,
		Password: config.Redis.REDIS_PASSWORD,
		DB:       db,
	})

	_, err = transactionClient.Ping(ctx).Result()
	if err != nil {
		return err
	}

	transaction_instance = &transactionRedis{
		client: transactionClient,
	}

	return nil
}

func GetTransactionRedis(ctx context.Context) (TransactionRedis, error) {
	var err error

	transaction_once.Do(func() {
		err = NewTransactionRedis(ctx)
	})

	if err != nil {
		return nil, err
	}

	if transaction_instance == nil {
		return nil, errors.New("transaction redis transaction_instance is nil")
	}

	return transaction_instance, nil
}


func (r *transactionRedis) DeleteTransactionCache(ctx context.Context) error {
	return r.client.Del(ctx, REDIS_TRANSACTION_CACHE_KEY).Err()
}

func (r *transactionRedis) SetTransactionCache(ctx context.Context, transactions []models.Transaction) error {
	transactionBytes, err := json.Marshal(transactions)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, REDIS_TRANSACTION_CACHE_KEY, transactionBytes, 0).Err()
}

func (r *transactionRedis) GetTransactionCache(ctx context.Context) ([]models.Transaction, error) {
	transactionBytes, err := r.client.Get(ctx, REDIS_TRANSACTION_CACHE_KEY).Bytes()
	if err != nil {
		return nil, err
	}

	var transactions []models.Transaction
	err = json.Unmarshal(transactionBytes, &transactions)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

func (r *transactionRedis) Close() error {
	return r.client.Close()
}
