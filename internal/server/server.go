package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jhphon0730/StockFlow/internal/database"
	"github.com/jhphon0730/StockFlow/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	DB *gorm.DB = database.GetDB()
)

type Server struct {
	router *gin.Engine
	PORT   string
	server *http.Server
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Init(PORT string) {
	s.router = gin.Default()
	s.router.Use(gin.Logger())

	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://192.168.0.5:3000", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		MaxAge: 12 * time.Hour,
	}))

	// OPTIONS
	s.router.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	s.PORT = PORT

	s.server = &http.Server{
		Addr:    ":" + s.PORT,
		Handler: s.router,
	}
}

func (s *Server) Run() error {
	api := s.router.Group("/api")
	{
		// ping
		ping_api := api.Group("/ping")
		ping_api.Use(middleware.AuthMiddleware())
		s.RegisterPingRoutes(ping_api)

		// auth
		user_api := api.Group("/users")
		s.RegisterUserRoutes(user_api)

		// anoher routes
		warehouse_api := api.Group("/warehouses")
		warehouse_api.Use(middleware.AuthMiddleware())
		s.RegisterWarehouseRoutes(warehouse_api)
		product_api := api.Group("/products")
		product_api.Use(middleware.AuthMiddleware())
		s.RegisterProductRoutes(product_api)
		inventory_api := api.Group("/inventories")
		inventory_api.Use(middleware.AuthMiddleware())
		s.RegisterInventoryRoutes(inventory_api)
		transaction_api := api.Group("/transactions")
		transaction_api.Use(middleware.AuthMiddleware())
		s.RegisterTransactionRoutes(transaction_api)
		ws_api := api.Group("/ws")
		s.RegisterWSRoutes(ws_api)
	}

	log.Println("Starting server on port", s.PORT)
	if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}

	return nil
}

func (s *Server) Shutdown(ctx context.Context) {
	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(ctx, 5*time.Second)
	defer shutdownCancel()

	if err := s.server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}
