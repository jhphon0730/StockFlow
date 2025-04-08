package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"

	"time"
)

type WarehouseRepository interface {
	FindByID(id uint) (*models.Warehouse, error)
	FindAll(search_filter map[string]interface{}) ([]models.Warehouse, error)

	Create(warehouse *models.Warehouse) (*models.Warehouse, error)

	Delete(id uint) error
	GetCountWithComparison() (int64, float64, error)
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

	if err := r.db.Preload("Inventories").Preload("Inventories.Product").First(&warehouse, id).Error; err != nil {
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

	if err := query.Preload("Inventories").Find(&warehouses).Error; err != nil {
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

func (r *warehouseRepository) GetCountWithComparison() (int64, float64, error) {
	var totalCount int64
	if err := r.db.Model(&models.Warehouse{}).Count(&totalCount).Error; err != nil {
		return 0, 0, err
	}

	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// 전월까지 누적된 수량
	var previousCumulativeCount int64
	if err := r.db.Model(&models.Warehouse{}).
		Where("created_at < ?", currentMonthStart).
		Count(&previousCumulativeCount).Error; err != nil {
		return totalCount, 0, err
	}

	// 증감률 계산
	var percentageChange float64
	if previousCumulativeCount == 0 {
		if totalCount == 0 {
			percentageChange = 0
		} else {
			percentageChange = 100
		}
	} else {
		percentageChange = float64(totalCount-previousCumulativeCount) / float64(previousCumulativeCount) * 100
	}

	return totalCount, percentageChange, nil
}
