package repositories

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByID(id uint) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByRole(role string) ([]models.User, error)
	FindAll() ([]models.User, error)

	Create(user *models.User) (*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User

	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindByRole(role string) ([]models.User, error) {
	var users []models.User

	if err := r.db.Where("role = ?", role).Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepository) FindAll() ([]models.User, error) {
	var users []models.User

	if err := r.db.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepository) Create(user *models.User) (*models.User, error) {
	if err := r.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}
