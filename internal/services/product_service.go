package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"context"
	"net/http"
)

type ProductService interface {
	FindAll(ctx context.Context) (int, []models.Product, error)
	FindByID(id uint) (int, *models.Product, error)
	Create(product *models.Product, ctx context.Context) (int, *models.Product, error)
	Delete(id uint, ctx context.Context) (int, error)
}

type productService struct {
	productRepository repositories.ProductRepository
}

func NewProductService(productRepository repositories.ProductRepository) ProductService {
	return &productService{
		productRepository: productRepository,
	}
}

func (p *productService) FindAll(ctx context.Context) (int, []models.Product, error) {
	products, err := p.productRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, products, nil
}

func (p *productService) FindByID(id uint) (int, *models.Product, error) {
	product, err := p.productRepository.FindByID(id)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, product, nil
}

func (p *productService) Create(product *models.Product, ctx context.Context) (int, *models.Product, error) {
	createdProduct, err := p.productRepository.Create(product)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdProduct, nil
}

func (p *productService) Delete(id uint, ctx context.Context) (int, error) {
	err := p.productRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
