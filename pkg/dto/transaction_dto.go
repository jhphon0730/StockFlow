package dto

import (
	"github.com/jhphon0730/StockFlow/internal/models"

	"errors"
)

type CreateTransactionDTO struct {
	InventoryID uint   `json:"inventory_id"`
	Type        string `json:"type"`
	Quantity    int    `json:"quantity"` // Inventory의 Quantity를 변경할 때 사용 ( 기존 값도 받을 수 있도록 )
}

func (c *CreateTransactionDTO) CheckCreateInventoryDTO() (bool, error) {
	if c.InventoryID == 0 {
		return false, errors.New("Inventory ID는 필수 입력 사항입니다")
	}

	if c.Type == "" {
		return false, errors.New("Type은 필수 입력 사항입니다")
	}

	if c.Quantity == 0 {
		return false, errors.New("Quantity는 필수 입력 사항입니다")
	}

	return true, nil
}

func (c *CreateTransactionDTO) ToModel() *models.Transaction {
	return &models.Transaction{
		InventoryID: c.InventoryID,
		Type:        c.Type,
		Quantity:    c.Quantity,
		Timestamp:   models.GetNowTime(),
	}
}
