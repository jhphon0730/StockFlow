package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"net/http"
)

type DashboardService interface {
	GetProductCount() (int, int64, error)
	GetInventoryCount() (int, int64, error)
	GetWarehouseCount() (int, int64, error)
	GetRecentTransactions(limit int) (int, []models.Transaction, error)
}

type dashboardService struct {
	productRepository repositories.ProductRepository
	inventoryRepository repositories.InventoryRepository
	warehouseRepository repositories.WarehouseRepository
	transactionRepository repositories.TransactionRepository
}

func NewDashboardService(
	productRepository repositories.ProductRepository,
	inventoryRepository repositories.InventoryRepository,
	warehouseRepository repositories.WarehouseRepository,
	transactionRepository repositories.TransactionRepository,
) DashboardService {
	return &dashboardService{
		productRepository: productRepository,
		inventoryRepository: inventoryRepository,
		warehouseRepository: warehouseRepository,
		transactionRepository: transactionRepository,
	}
}

func (s *dashboardService) GetProductCount() (int, int64, error) {
	count, err := s.productRepository.GetCount()
	if err != nil {
		return http.StatusInternalServerError, 0, err
	}
	return http.StatusOK, count, nil
}

func (s *dashboardService) GetInventoryCount() (int, int64, error) {
	count, err := s.inventoryRepository.GetCount()
	if err != nil {
		return http.StatusInternalServerError, 0, err
	}
	return http.StatusOK, count, nil
}

func (s *dashboardService) GetWarehouseCount() (int, int64, error) {
	count, err := s.warehouseRepository.GetCount()
	if err != nil {
		return http.StatusInternalServerError, 0, err
	}
	return http.StatusOK, count, nil
}

func (s *dashboardService) GetRecentTransactions(limit int) (int, []models.Transaction, error) {
	transactions, err := s.transactionRepository.FindRecentTransactions(limit)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return http.StatusOK, transactions, nil
}
