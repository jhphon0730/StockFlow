package services

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"

	"errors"
	"net/http"
)

type UserService interface {
	FindAll() (int, []models.User, error)
	Create(user *models.User) (int, *models.User, error)
	FindByEmail(email string) (int, *models.User, error)
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
	alreadyUser, _ := u.userRepository.FindByEmail(user.Email)
	if alreadyUser != nil {
		return http.StatusConflict, nil, errors.New("이미 존재하는 이메일입니다")
	}

	createdUser, err := u.userRepository.Create(user)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusCreated, createdUser, nil
}

func (u *userService) FindByEmail(email string) (int, *models.User, error) {
	user, err := u.userRepository.FindByEmail(email)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, user, nil
}
