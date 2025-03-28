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
	Close() error
}

type productRedis struct {
	client *redis.Client
}

var (
	product_once     sync.Once
	product_instance ProductRedis
)

func NewProductRedis(ctx context.Context) error {
	config := config.GetConfig()
	db, err := strconv.Atoi(config.Redis.REDIS_PRODUCT_DB)
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

	product_instance = &productRedis{
		client: productClient,
	}

	return nil
}

func GetProductRedis(ctx context.Context) (ProductRedis, error) {
	var err error

	product_once.Do(func() {
		err = NewProductRedis(ctx)
	})

	if err != nil {
		return nil, err
	}

	if product_instance == nil {
		return nil, errors.New("product redis product_instance is nil")
	}

	return product_instance, nil
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

func (r *productRedis) Close() error {
	return r.client.Close()
}
