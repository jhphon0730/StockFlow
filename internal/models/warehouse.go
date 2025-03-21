package models

import (
	"gorm.io/gorm"
)

/* 창고 정보 저장 */
type Warehouse struct {
	gorm.Model
	Name        string      `json:"name" binding:"required" validate:"required"`
	Location    string      `json:"location" binding:"required" validate:"required"`
	Inventories []Inventory `gorm:"foreignKey:WarehouseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // Warehouse 삭제 시 Inventory 삭제
}

// CASCADE ( Soft-Delete )
func (warehouse *Warehouse) AfterDelete(tx *gorm.DB) (err error) {
	if err = tx.Session(&gorm.Session{SkipHooks: true}).
		Where("warehouse_id = ?", warehouse.ID).
		Delete(&Inventory{}).Error; err != nil {
		return err
	}
	return nil
}
