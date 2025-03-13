package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"net/http"
)

type WarehouseService interface {
	FindAll() (int, []models.Warehouse, error)
	FindByID(id uint) (int, *models.Warehouse, error)
	Create(warehouse *models.Warehouse) (int, *models.Warehouse, error)
	Delete(id uint) (int, error)
}

type warehouseService struct {
	warehouseRepository repositories.WarehouseRepository
}

func NewWarehouseService(warehouseRepository repositories.WarehouseRepository) WarehouseService {
	return &warehouseService{
		warehouseRepository: warehouseRepository,
	}
}

func (w *warehouseService) FindAll() (int, []models.Warehouse, error) {
	warehouses, err := w.warehouseRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
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

func (w *warehouseService) Create(warehouse *models.Warehouse) (int, *models.Warehouse, error) {
	createdWarehouse, err := w.warehouseRepository.Create(warehouse)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdWarehouse, nil
}

func (w *warehouseService) Delete(id uint) (int, error) {
	err := w.warehouseRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
