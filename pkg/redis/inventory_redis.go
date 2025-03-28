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

type InventoryRedis interface {
	DeleteInventoryCache(ctx context.Context) error
	SetInventoryCache(ctx context.Context, inventorys []models.Inventory) error
	GetInventoryCache(ctx context.Context) ([]models.Inventory, error)
	Close() error
}

type inventoryRedis struct {
	client *redis.Client
}

var (
	inventory_once     sync.Once
	inventory_instance InventoryRedis
)

func NewInventoryRedis(ctx context.Context) error {
	config := config.GetConfig()
	db, err := strconv.Atoi(config.Redis.REDIS_INVENTORY_DB)
	if err != nil {
		return err
	}

	inventoryClient := redis.NewClient(&redis.Options{
		Addr:     config.Redis.REDIS_HOST + ":" + config.Redis.REDIS_PORT,
		Password: config.Redis.REDIS_PASSWORD,
		DB:       db,
	})

	_, err = inventoryClient.Ping(ctx).Result()
	if err != nil {
		return err
	}

	inventory_instance = &inventoryRedis{
		client: inventoryClient,
	}

	return nil
}

func GetInventoryRedis(ctx context.Context) (InventoryRedis, error) {
	var err error

	inventory_once.Do(func() {
		err = NewInventoryRedis(ctx)
	})

	if err != nil {
		return nil, err
	}

	if inventory_instance == nil {
		return nil, errors.New("inventory redis inventory_instance is nil")
	}

	return inventory_instance, nil
}


func (r *inventoryRedis) DeleteInventoryCache(ctx context.Context) error {
	return r.client.Del(ctx, REDIS_INVENTORY_CACHE_KEY).Err()
}

func (r *inventoryRedis) SetInventoryCache(ctx context.Context, inventorys []models.Inventory) error {
	inventoryBytes, err := json.Marshal(inventorys)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, REDIS_INVENTORY_CACHE_KEY, inventoryBytes, 0).Err()
}

func (r *inventoryRedis) GetInventoryCache(ctx context.Context) ([]models.Inventory, error) {
	inventoryBytes, err := r.client.Get(ctx, REDIS_INVENTORY_CACHE_KEY).Bytes()
	if err != nil {
		return nil, err
	}

	var inventorys []models.Inventory
	err = json.Unmarshal(inventoryBytes, &inventorys)
	if err != nil {
		return nil, err
	}

	return inventorys, nil
}

func (r *inventoryRedis) Close() error {
	return r.client.Close()
}
