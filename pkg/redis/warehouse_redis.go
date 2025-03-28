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

type WarehouseRedis interface {
	DeleteWarehouseCache(ctx context.Context) error
	SetWarehouseCache(ctx context.Context, warehouses []models.Warehouse) error
	GetWarehouseCache(ctx context.Context) ([]models.Warehouse, error)
	Close() error
}

type warehouseRedis struct {
	client *redis.Client
}

var (
	warehouse_once     sync.Once
	warehouse_instance WarehouseRedis
)

func NewWarehouseRedis(ctx context.Context) error {
	config := config.GetConfig()
	db, err := strconv.Atoi(config.Redis.REDIS_WAREHOUSE_DB)
	if err != nil {
		return err
	}

	warehouseClient := redis.NewClient(&redis.Options{
		Addr:     config.Redis.REDIS_HOST + ":" + config.Redis.REDIS_PORT,
		Password: config.Redis.REDIS_PASSWORD,
		DB:       db,
	})

	_, err = warehouseClient.Ping(ctx).Result()
	if err != nil {
		return err
	}

	warehouse_instance = &warehouseRedis{
		client: warehouseClient,
	}

	return nil
}

func GetWarehouseRedis(ctx context.Context) (WarehouseRedis, error) {
	var err error

	warehouse_once.Do(func() {
		err = NewWarehouseRedis(ctx)
	})

	if err != nil {
		return nil, err
	}

	if warehouse_instance == nil {
		return nil, errors.New("warehouse redis warehouse_instance is nil")
	}

	return warehouse_instance, nil
}


func (r *warehouseRedis) DeleteWarehouseCache(ctx context.Context) error {
	return r.client.Del(ctx, REDIS_WAREHOUSE_CACHE_KEY).Err()
}

func (r *warehouseRedis) SetWarehouseCache(ctx context.Context, warehouses []models.Warehouse) error {
	warehouseBytes, err := json.Marshal(warehouses)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, REDIS_WAREHOUSE_CACHE_KEY, warehouseBytes, 0).Err()
}

func (r *warehouseRedis) GetWarehouseCache(ctx context.Context) ([]models.Warehouse, error) {
	warehouseBytes, err := r.client.Get(ctx, REDIS_WAREHOUSE_CACHE_KEY).Bytes()
	if err != nil {
		return nil, err
	}

	var warehouses []models.Warehouse
	err = json.Unmarshal(warehouseBytes, &warehouses)
	if err != nil {
		return nil, err
	}

	return warehouses, nil
}

func (r *warehouseRedis) Close() error {
	return r.client.Close()
}
