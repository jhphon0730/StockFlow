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

type ProductRedis interface {
	DeleteProductCache(ctx context.Context) error
	SetProductCache(ctx context.Context, products []models.Product) error
	GetProductCache(ctx context.Context) ([]models.Product, error)
}

type productRedis struct {
	client *redis.Client
}

var (
	once     sync.Once
	instance ProductRedis
)

func NewProductRedis(ctx context.Context) error {
	config := config.GetConfig()
	db, err := strconv.Atoi(config.Redis.REDIS_PROUDCT_DB)
	if err != nil {
		return err
	}

	productClient := redis.NewClient(&redis.Options{
		Addr:     config.Redis.REDIS_HOST + ":" + config.Redis.REDIS_PORT,
		Password: config.Redis.REDIS_PASSWORD,
		DB:       db,
	})

	_, err = productClient.Ping(ctx).Result()
	if err != nil {
		return err
	}

	instance = &productRedis{
		client: productClient,
	}

	return nil
}

func GetProductRedis(ctx context.Context) (ProductRedis, error) {
	var err error

	once.Do(func() {
		err = NewProductRedis(ctx)
	})

	if err != nil {
		return nil, err
	}

	if instance == nil {
		return nil, errors.New("product redis instance is nil")
	}

	return instance, nil
}


func (r *productRedis) DeleteProductCache(ctx context.Context) error {
	return r.client.Del(ctx, REDIS_PRODUCT_CACHE_KEY).Err()
}

func (r *productRedis) SetProductCache(ctx context.Context, products []models.Product) error {
	productBytes, err := json.Marshal(products)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, REDIS_PRODUCT_CACHE_KEY, productBytes, 0).Err()
}

func (r *productRedis) GetProductCache(ctx context.Context) ([]models.Product, error) {
	productBytes, err := r.client.Get(ctx, REDIS_PRODUCT_CACHE_KEY).Bytes()
	if err != nil {
		return nil, err
	}

	var products []models.Product
	err = json.Unmarshal(productBytes, &products)
	if err != nil {
		return nil, err
	}

	return products, nil
}
