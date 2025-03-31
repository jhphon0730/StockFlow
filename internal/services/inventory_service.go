package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/pkg/redis"

	"net/http"
	"context"
)

type InventoryService interface {
	FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Inventory, error)
	FindByID(id uint) (int, *models.Inventory, error)
	Create(inventory *models.Inventory, ctx context.Context) (int, *models.Inventory, error)
	Delete(id uint, ctx context.Context) (int, error)
}

type inventoryService struct {
	inventoryRepository repositories.InventoryRepository
}

func NewInventoryService(inventoryRepository repositories.InventoryRepository) InventoryService {
	return &inventoryService{
		inventoryRepository: inventoryRepository,
	}
}

func (i *inventoryService) getInventoryRedis(ctx context.Context) redis.InventoryRedis {
	inventoryRedis, err := redis.GetInventoryRedis(ctx)
	if err != nil {
		return nil
	}

	return inventoryRedis
}

func (i *inventoryService) FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Inventory, error) {
	inventoryRedis := i.getInventoryRedis(ctx)

	if inventoryRedis != nil && len(search_filter) == 0 {
		inventories, err := inventoryRedis.GetInventoryCache(ctx)
		if err == nil && len(inventories) > 0 {
			return http.StatusOK, inventories, nil
		}
	}

	inventories, err := i.inventoryRepository.FindAll(search_filter)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if inventoryRedis != nil && len(search_filter) == 0 {
		_ = inventoryRedis.SetInventoryCache(ctx, inventories)
	}

	return http.StatusOK, inventories, nil
}

func (i *inventoryService) FindByID(id uint) (int, *models.Inventory, error) {
	inventory, err := i.inventoryRepository.FindByID(id)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, inventory, nil
}

func (i *inventoryService) Create(inventory *models.Inventory, ctx context.Context) (int, *models.Inventory, error) {
	createdInventory, err := i.inventoryRepository.Create(inventory)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if inventoryRedis := i.getInventoryRedis(ctx); inventoryRedis != nil {
		_ = inventoryRedis.DeleteInventoryCache(ctx)
	}

	return http.StatusCreated, createdInventory, nil
}

func (i *inventoryService) Delete(id uint, ctx context.Context) (int, error) {
	err := i.inventoryRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if inventoryRedis := i.getInventoryRedis(ctx); inventoryRedis != nil {
		_ = inventoryRedis.DeleteInventoryCache(ctx)
	}

	return http.StatusOK, nil
}
