package handlers

import (
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gin-gonic/gin"

	"net/http"
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
}

func (u *userHandler) SignUpUser(c *gin.Context) {
	var signUpDTO dto.SignUpUserDTO
	if err := c.ShouldBind(&signUpDTO); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// Check Regex
	if check, err := signUpDTO.CheckSignUpDTO(); !check {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// 2. 비밀번호 암호화
	hashedPW, err := utils.EncryptPassword(signUpDTO.Password)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, nil, err)
		return
	}
	signUpDTO.Password = hashedPW

	// 3. 유저 생성
	status, user, err := u.userService.Create(signUpDTO.ToUser())
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	utils.JSONResponse(c, status, user, nil)
}
