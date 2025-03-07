package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

type UserHandler interface {
	FindAllUsers(c *gin.Context)
	SignUpUser(c *gin.Context)
}

type userHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) UserHandler {
	return &userHandler{
		userService: userService,
	}
}

func (u *userHandler) FindAllUsers(c *gin.Context) {
	status, users, err := u.userService.FindAll()
	utils.JSONResponse(c, status, users, err)

	return
}

func (u *userHandler) SignUpUser(c *gin.Context) {
	// 0. Body Parse
	// 1. 중복 유저 있는 지 체크
	// 2. 비밀번호 암호화
	// 3. 유저 생성
	// 5. Response
}
