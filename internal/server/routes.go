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

	productRepository repositories.ProductRepository = repositories.NewProductRepository(DB)
	productService    services.ProductService        = services.NewProductService(productRepository)
	productHandler    handlers.ProductHandler        = handlers.NewProductHandler(productService)

	inventoryRepository repositories.InventoryRepository = repositories.NewInventoryRepository(DB)
	inventoryService    services.InventoryService        = services.NewInventoryService(inventoryRepository)
	inventoryHandler    handlers.InventoryHandler        = handlers.NewInventoryHandler(inventoryService)
)

func (s *Server) RegisterUserRoutes(router *gin.RouterGroup) {
	router.GET("", userHandler.FindAllUsers)
	router.POST("/signup", userHandler.SignUpUser)
	router.POST("/signin", userHandler.SignInUser)
}

func (s *Server) RegisterWarehouseRoutes(router *gin.RouterGroup) {
	router.GET("", warehouseHandler.GetAllWarehouses)
	router.POST("", warehouseHandler.CreateWarehouse)
	router.GET("/:id", warehouseHandler.GetWarehouse)
	router.DELETE("/:id", warehouseHandler.DeleteWarehouse)
}

func (s *Server) RegisterProductRoutes(router *gin.RouterGroup) {
	router.GET("", productHandler.GetAllProducts)
	router.POST("", productHandler.CreateProduct)
	router.GET("/:id", productHandler.GetProduct)
	router.DELETE("/:id", productHandler.DeleteProduct)
}

func (s *Server) RegisterInventoryRoutes(router *gin.RouterGroup) {
	router.GET("", inventoryHandler.GetAllInventory)
	router.POST("/:warehouse_id/:product_id", inventoryHandler.CreateInventory)
	router.GET("/:id", inventoryHandler.GetInventory)
	router.DELETE("/:id", inventoryHandler.DeleteInventory)
}
