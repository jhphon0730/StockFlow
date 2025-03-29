package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/pkg/redis"

	"context"
	"net/http"
)

type WarehouseService interface {
	FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Warehouse, error)
	FindByID(id uint) (int, *models.Warehouse, error)
	Create(warehouse *models.Warehouse, ctx context.Context) (int, *models.Warehouse, error)
	Delete(id uint, ctx context.Context) (int, error)
}

type warehouseService struct {
	warehouseRepository repositories.WarehouseRepository
}

func NewWarehouseService(warehouseRepository repositories.WarehouseRepository) WarehouseService {
	return &warehouseService{
		warehouseRepository: warehouseRepository,
	}
}

func (w *warehouseService) getWarehouseRedis(ctx context.Context) redis.WarehouseRedis {
	warehouseRedis, err := redis.GetWarehouseRedis(ctx)
	if err != nil {
		return nil
	}

	return warehouseRedis
}

func (w *warehouseService) FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Warehouse, error) {
	warehouseRedis := w.getWarehouseRedis(ctx)

	if warehouseRedis != nil && len(search_filter) == 0 {
		warehouses, err := warehouseRedis.GetWarehouseCache(ctx)
		if err == nil && len(warehouses) > 0 { 
			return http.StatusOK, warehouses, nil
		}
	}

	warehouses, err := w.warehouseRepository.FindAll(search_filter)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if warehouseRedis != nil && len(search_filter) == 0 {
		_ = warehouseRedis.SetWarehouseCache(ctx, warehouses)
	}

	return http.StatusOK, warehouses, nil
}

func (w *warehouseService) FindByID(id uint) (int, *models.Warehouse, error) {
	warehouse, err := w.warehouseRepository.FindByID(id)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, warehouse, nil
}

func (w *warehouseService) Create(warehouse *models.Warehouse, ctx context.Context) (int, *models.Warehouse, error) {
	createdWarehouse, err := w.warehouseRepository.Create(warehouse)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if warehouseRedis := w.getWarehouseRedis(ctx); warehouseRedis != nil {
		_ = warehouseRedis.DeleteWarehouseCache(ctx)
	}

	return http.StatusCreated, createdWarehouse, nil
}

func (w *warehouseService) Delete(id uint, ctx context.Context) (int, error) {
	err := w.warehouseRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if warehouseRedis := w.getWarehouseRedis(ctx); warehouseRedis != nil {
		_ = warehouseRedis.DeleteWarehouseCache(ctx)
	}

	return http.StatusOK, nil
}
