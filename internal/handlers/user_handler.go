package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

type UserHandler interface {
	FindAll(c *gin.Context)
}

type userHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) UserHandler {
	return &userHandler{
		userService: userService,
	}
}

func (u *userHandler) FindAll(c *gin.Context) {
	status, users, err := u.userService.FindAll()
	utils.JSONResponse(c, status, users, err)

	return
}
