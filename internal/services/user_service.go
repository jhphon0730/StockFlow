package services

import (
	"net/http"

	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
)

type UserService interface {
	FindAll() (int, []models.User, error)
	Create(user *models.User) (int, *models.User, error)
}

type userService struct {
	userRepository repositories.UserRepository
}

func NewUserService(userRepository repositories.UserRepository) UserService {
	return &userService{
		userRepository: userRepository,
	}
}

func (u *userService) FindAll() (int, []models.User, error) {
	users, err := u.userRepository.FindAll()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, users, nil
}

func (u *userService) Create(user *models.User) (int, *models.User, error) {
	createdUser, err := u.userRepository.Create(user)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdUser, nil
}
