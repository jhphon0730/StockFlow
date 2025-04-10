package redis

import "context"

const (
	REDIS_WAREHOUSE_CACHE_KEY = "warehouse_cache"
	REDIS_PRODUCT_CACHE_KEY = "product_cache"
	REDIS_INVENTORY_CACHE_KEY = "inventory_cache"
	REDIS_TRANSACTION_CACHE_KEY = "transaction_cache"
)

func RestoreRedisData(ctx context.Context) {
	warehouse_instance.DeleteWarehouseCache(ctx)
	product_instance.DeleteProductCache(ctx)
	inventory_instance.DeleteInventoryCache(ctx)
	transaction_instance.DeleteTransactionCache(ctx)
}
