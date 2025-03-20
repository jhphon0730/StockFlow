package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll() ([]models.Product, error)
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

	if err := r.db.Find(&products).Preload("Inventories").Error; err != nil {
		return nil, err
	}

	return products, nil
}
