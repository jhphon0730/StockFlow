package services

import "github.com/jhphon0730/StockFlow/internal/repositories"

type InventoryService interface {
}

type inventoryService struct {
	inventoryRepository repositories.InventoryRepository
}

func NewInventoryService(inventoryRepository repositories.InventoryRepository) InventoryService {
	return &inventoryService{
		inventoryRepository: inventoryRepository,
	}
}
