package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"
)

type InventoryRepository interface {
	FindAll(search_filter map[string]interface{}) ([]models.Inventory, error)
	FindByID(id uint) (*models.Inventory, error)
	Create(inventory *models.Inventory) (*models.Inventory, error)
	Delete(id uint) error
	UpdateQuantity(id uint, quantity int, transaction_type string) error
	GetCount() (int64, error)
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	return &inventoryRepository{
		db: db,
	}
}

func (r *inventoryRepository) FindAll(search_filter map[string]interface{}) ([]models.Inventory, error) {
	var inventories []models.Inventory
	query := r.db

	for key, value := range search_filter {
		switch key {
		case "product_id":
			query = query.Where("product_id = ?", value)
		case "warehouse_id":
			query = query.Where("warehouse_id = ?", value)
		}
	}

	if err := query.Preload("Product").Find(&inventories).Error; err != nil {
		return nil, err
	}

	return inventories, nil
}

func (r *inventoryRepository) FindByID(id uint) (*models.Inventory, error) {
	var inventory models.Inventory

	if err := r.db.Preload("Product").First(&inventory, id).Error; err != nil {
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
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Delete(&models.Inventory{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Where("inventory_id = ?", id).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *inventoryRepository) UpdateQuantity(id uint, quantity int, transaction_type string) error {
	var inventory *models.Inventory
	tx := r.db.Begin()
	if err := tx.Error; err != nil {
		return err
	}

	if err := tx.First(&inventory, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	switch transaction_type {
	case "IN":
	inventory.Quantity += quantity
	case "OUT":
	inventory.Quantity -= quantity
	case "ADJUST":
	inventory.Quantity = quantity
	}

	if err := tx.Save(inventory).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *inventoryRepository) GetCount() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Inventory{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
