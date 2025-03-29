package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"gorm.io/gorm"
)

type WarehouseRepository interface {
	FindByID(id uint) (*models.Warehouse, error)
	FindAll(search_filter map[string]interface{}) ([]models.Warehouse, error)

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

	if err := r.db.Preload("Inventories").First(&warehouse, id).Error; err != nil {
		return nil, err
	}

	return &warehouse, nil
}

func (r *warehouseRepository) FindAll(search_filter map[string]interface{}) ([]models.Warehouse, error) {
	var warehouses []models.Warehouse
	query := r.db

	for key, value := range search_filter {
		switch key {
		case "name":
			query = query.Where("name LIKE ?", "%"+value.(string)+"%")
		case "location":
			query = query.Where("location LIKE ?", "%"+value.(string)+"%")
		}
	}

	if err := query.Find(&warehouses).Error; err != nil {
		return nil, err
	}

	return warehouses, nil
}

func (r *warehouseRepository) Create(warehouse *models.Warehouse) (*models.Warehouse, error) {
	if err := r.db.Create(warehouse).Error; err != nil {
		return nil, err
	}

	return warehouse, nil
}

func (r *warehouseRepository) Delete(id uint) error {
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Where("id = ?", id).Delete(&models.Warehouse{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	var inventories []models.Inventory
	if err := tx.Where("warehouse_id = ?", id).Find(&inventories).Error; err != nil {
			tx.Rollback()
			return err
	}

	if err := tx.Where("warehouse_id = ?", id).Delete(&models.Inventory{}).Error; err != nil {
			tx.Rollback()
			return err
	}

	for _, inv := range inventories {
			if err := tx.Where("inventory_id = ?", inv.ID).Delete(&models.Transaction{}).Error; err != nil {
					tx.Rollback()
					return err
			}
	}

	if err := tx.Commit().Error; err != nil {
			return err
	}

	return nil
}
