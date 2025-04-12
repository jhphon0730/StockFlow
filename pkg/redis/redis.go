package redis

import "context"

const (
	REDIS_WAREHOUSE_CACHE_KEY = "warehouse_cache"
	REDIS_PRODUCT_CACHE_KEY = "product_cache"
	REDIS_INVENTORY_CACHE_KEY = "inventory_cache"
	REDIS_TRANSACTION_CACHE_KEY = "transaction_cache"
)

func RestoreRedisData(ctx context.Context) {
	if warehouse_instance, err := GetWarehouseRedis(ctx); err == nil {
		warehouse_instance.DeleteWarehouseCache(ctx)
	}

	if product_instance, err := GetProductRedis(ctx); err == nil {
		product_instance.DeleteProductCache(ctx)
	}

	if inventory_instance, err := GetInventoryRedis(ctx); err == nil {
		inventory_instance.DeleteInventoryCache(ctx)
	}

	if transaction_instance, err := GetTransactionRedis(ctx); err == nil {
		transaction_instance.DeleteTransactionCache(ctx)
	}
}
