package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/model"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() (*[]model.User, error)
}

type userRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		DB: db,
	}
}

func (r *userRepository) FindAll() (*[]model.User, error) {
	var users *[]model.User

	if err := r.DB.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}
