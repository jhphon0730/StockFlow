package redis

import (
	"github.com/jhphon0730/StockFlow/internal/config"

	"github.com/go-redis/redis/v8"

	"errors"
	"context"
	"strconv"
	"sync"
)

type ProductRedis interface {
	// Redis와 상호작용할 메서드를 추가하세요
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


func (r *productRedis) DeleteProduct(ctx context.Context) error {
	return r.client.Del(ctx, REDIS_PRODUCT_CACHE_KEY).Err()
}
