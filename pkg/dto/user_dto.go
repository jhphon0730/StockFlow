package dto

import (
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"errors"
)

type SignUpUserDTO struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (s *SignUpUserDTO) CheckSignUpDTO() (bool, error) {
	if !utils.IsValidName(s.Name) {
		return false, errors.New("이름은 3자 이상 20자 이하여야 합니다")
	}

	if !utils.IsValidEmail(s.Email) {
		return false, errors.New("이메일은 5자 이상 50자 이하여야 합니다")
	}

	if !utils.IsValidPassword(s.Password) {
		return false, errors.New("비밀번호는 8자 이상 32자 이하여야 합니다")
	}

	return true, nil
}

func (s *SignUpUserDTO) ToModel() *models.User {
	return &models.User{
		Name:     s.Name,
		Email:    s.Email,
		Password: s.Password,
		Role:     "staff",
	}
}

type SignInUserDTO struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (s *SignInUserDTO) CheckSignInDTO() (bool, error) {
	if !utils.IsValidEmail(s.Email) {
		return false, errors.New("이메일은 5자 이상 50자 이하여야 합니다")
	}

	if !utils.IsValidPassword(s.Password) {
		return false, errors.New("비밀번호는 8자 이상 32자 이하여야 합니다")
	}

	return true, nil
}
