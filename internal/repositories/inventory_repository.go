package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"
)

type InventoryRepository interface {
	FindAll() ([]models.Inventory, error)
	FindByID(id uint) (*models.Inventory, error)
	Create(inventory *models.Inventory) (*models.Inventory, error)
	Delete(id uint) error
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	return &inventoryRepository{
		db: db,
	}
}

func (r *inventoryRepository) FindAll() ([]models.Inventory, error) {
	var inventories []models.Inventory

	if err := r.db.Find(&inventories).Preload("Product").Error; err != nil {
		return nil, err
	}

	return inventories, nil
}

func (r *inventoryRepository) FindByID(id uint) (*models.Inventory, error) {
	var inventory models.Inventory

	if err := r.db.First(&inventory, id).Preload("Product").Error; err != nil {
		return nil, err
	}

	return &inventory, nil
}

func (r *inventoryRepository) Create(inventory *models.Inventory) (*models.Inventory, error) {
	if err := r.db.Create(inventory).Error; err != nil {
		return nil, err
	}

	return inventory, nil
}

func (r *inventoryRepository) Delete(id uint) error {
	if err := r.db.Delete(&models.Inventory{}, id).Error; err != nil {
		return err
	}

	return nil
}
