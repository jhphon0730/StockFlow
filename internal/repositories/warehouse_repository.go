package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"gorm.io/gorm"
)

type WarehouseRepository interface {
	FindByID(id uint) (*models.Warehouse, error)
	Create(warehouse *models.Warehouse) (*models.Warehouse, error)
	Delete(id uint) error
}

type warehouseRepository struct {
	db *gorm.DB
}

func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{
		db: db,
	}
}

func (r *warehouseRepository) FindByID(id uint) (*models.Warehouse, error) {
	var warehouse models.Warehouse

	if err := r.db.First(&warehouse, id).Error; err != nil {
		return nil, err
	}

	return &warehouse, nil
}

func (r *warehouseRepository) Create(warehouse *models.Warehouse) (*models.Warehouse, error) {
	if err := r.db.Create(warehouse).Error; err != nil {
		return nil, err
	}

	return warehouse, nil
}

func (r *warehouseRepository) Delete(id uint) error {
	if err := r.db.Delete(&models.Warehouse{}, id).Error; err != nil {
		return err
	}

	return nil
}
