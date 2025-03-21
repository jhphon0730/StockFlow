package dto

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"errors"
)

type CreateInventoryDTO struct {
	WarehouseID uint `json:"warehouse_id"`
	ProductID   uint `json:"product_id"`
	Quantity    int  `json:"quantity"` // 생성 시에 초기 값은 0으로 무조건 고정
}

func (c *CreateInventoryDTO) CheckCreateInventoryDTO() (bool, error) {
	if c.WarehouseID == 0 {
		return false, errors.New("창고 ID는 필수 입력 사항입니다")
	}

	if c.ProductID == 0 {
		return false, errors.New("제품 ID는 필수 입력 사항입니다")
	}

	if c.Quantity != 0 {
		return false, errors.New("수량이 잘못 입력되었습니다")
	}

	return true, nil
}

func (c *CreateInventoryDTO) ToModel() *models.Inventory {
	return &models.Inventory{
		WarehouseID: c.WarehouseID,
		ProductID:   c.ProductID,
		Quantity:    c.Quantity,
	}
}
