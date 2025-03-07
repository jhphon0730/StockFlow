package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() (*[]models.User, error)
}

type userRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		DB: db,
	}
}

func (r *userRepository) FindAll() (*[]models.User, error) {
	var users *[]models.User

	if err := r.DB.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}
