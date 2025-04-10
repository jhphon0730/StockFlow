package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/pkg/redis"

	"context"
	"net/http"
)

type ProductService interface {
	FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Product, error)
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

func (p *productService) getProductRedis(ctx context.Context) redis.ProductRedis {
	productRedis, err := redis.GetProductRedis(ctx)
	if err != nil {
		return nil
	}

	return productRedis
}

func (p *productService) FindAll(ctx context.Context, search_filter map[string]interface{}) (int, []models.Product, error) {
	productRedis := p.getProductRedis(ctx)

	if productRedis != nil && len(search_filter) == 0 {
		products, err := productRedis.GetProductCache(ctx)
		if err == nil && len(products) > 0 {
			return http.StatusOK, products, nil
		}
	}

	products, err := p.productRepository.FindAll(search_filter)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	if productRedis != nil && len(search_filter) == 0 {
		_ = productRedis.SetProductCache(ctx, products)
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

	redis.RestoreRedisData(ctx)

	return http.StatusCreated, createdProduct, nil
}

func (p *productService) Delete(id uint, ctx context.Context) (int, error) {
	err := p.productRepository.Delete(id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	redis.RestoreRedisData(ctx)

	return http.StatusOK, nil
}
