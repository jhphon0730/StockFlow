package dto

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"errors"
)

type CreateWarehouseDTO struct {
	Name     string `json:"name" binding:"required"`
	Location string `json:"location" binding:"required"`
}

func (c *CreateWarehouseDTO) CheckCreateWarehouseDTO() (bool, error) {
	if c.Name == "" {
		return false, errors.New("창고 이름은 필수 입력 사항입니다")
	}

	if c.Location == "" {
		return false, errors.New("창고 위치는 필수 입력 사항입니다")
	}

	return true, nil
}

func (c *CreateWarehouseDTO) ToModel() *models.Warehouse {
	return &models.Warehouse{
		Name:     c.Name,
		Location: c.Location,
	}
}
