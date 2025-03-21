package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"net/http"
)

type InventoryService interface {
	FindAll() (int, []models.Inventory, error)
	FindByID(id uint) (int, *models.Inventory, error)
	Create(inventory *models.Inventory) (int, *models.Inventory, error)
	Delete(id uint) (int, error)
}

type inventoryService struct {
	inventoryRepository repositories.InventoryRepository
}

func NewInventoryService(inventoryRepository repositories.InventoryRepository) InventoryService {
	return &inventoryService{
		inventoryRepository: inventoryRepository,
	}
}

func (i *inventoryService) FindAll() (int, []models.Inventory, error) {
	inventories, err := i.inventoryRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
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

func (i *inventoryService) Create(inventory *models.Inventory) (int, *models.Inventory, error) {
	createdInventory, err := i.inventoryRepository.Create(inventory)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdInventory, nil
}

func (i *inventoryService) Delete(id uint) (int, error) {
	err := i.inventoryRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
