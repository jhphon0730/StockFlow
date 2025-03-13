package server

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"

	"github.com/gin-gonic/gin"
)

var (
	userRepository repositories.UserRepository = repositories.NewUserRepository(DB)
	userService    services.UserService        = services.NewUserService(userRepository)
	userHandler    handlers.UserHandler        = handlers.NewUserHandler(userService)

	warehouseRepository repositories.WarehouseRepository = repositories.NewWarehouseRepository(DB)
	warehouseService    services.WarehouseService        = services.NewWarehouseService(warehouseRepository)
	warehouseHandler    handlers.WarehouseHandler        = handlers.NewWarehouseHandler(warehouseService)
)

func (s *Server) RegisterUserRoutes(router *gin.RouterGroup) {
	router.GET("", userHandler.FindAllUsers)
	router.POST("/signup", userHandler.SignUpUser)
	router.POST("/signin", userHandler.SignInUser)
}

func (s *Server) RegisterWarehouseRoutes(router *gin.RouterGroup) {
	router.POST("", warehouseHandler.CreateWarehouse)
	router.GET("/:id", warehouseHandler.GetWarehouse)
	router.DELETE("/:id", warehouseHandler.DeleteWarehouse)
}
