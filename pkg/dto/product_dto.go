package dto

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"errors"
)

type CreateProductDTO struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SKU         string `json:"sku" binding:"required"`
}

func (c *CreateProductDTO) CheckCreateProductDTO() (bool, error) {
	if c.Name == "" {
		return false, errors.New("제품 이름은 필수 입력 사항입니다")
	}

	if c.SKU == "" {
		return false, errors.New("SKU는 필수 입력 사항입니다")
	}

	return true, nil
}

func (c *CreateProductDTO) ToModel() *models.Product {
	return &models.Product{
		Name:        c.Name,
		Description: c.Description,
		SKU:         c.SKU,
	}
}
