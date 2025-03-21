package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll() ([]models.Product, error)
	FindByID(id uint) (*models.Product, error)

	Create(product *models.Product) (*models.Product, error)
	Delete(id uint) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{
		db: db,
	}
}

func (r *productRepository) FindAll() ([]models.Product, error) {
	var products []models.Product

	if err := r.db.Preload("Inventories").Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil
}

func (r *productRepository) FindByID(id uint) (*models.Product, error) {
	var product models.Product

	if err := r.db.Preload("Inventories").First(&product, id).Error; err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *productRepository) Create(product *models.Product) (*models.Product, error) {
	if err := r.db.Create(product).Error; err != nil {
		return nil, err
	}

	return product, nil
}

func (r *productRepository) Delete(id uint) error {
	tx := r.db.Begin()
	if tx.Error != nil {
			return tx.Error
	}

	if err := tx.Where("id = ?", id).Delete(&models.Product{}).Error; err != nil {
			tx.Rollback()
			return err
	}

	var inventories []models.Inventory
	if err := tx.Where("product_id = ?", id).Find(&inventories).Error; err != nil {
			tx.Rollback()
			return err
	}

	if err := tx.Where("product_id = ?", id).Delete(&models.Inventory{}).Error; err != nil {
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
