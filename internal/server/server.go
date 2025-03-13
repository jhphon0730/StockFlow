package server

import (
	"github.com/jhphon0730/StockFlow/internal/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"net/http"
	"time"
)

var (
	DB *gorm.DB = database.GetDB()
)

type Server struct {
	router *gin.Engine
	PORT   string
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Init(PORT string) {
	s.router = gin.Default()
	s.router.Use(gin.Logger())

	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://192.168.0.5:3000", "http://localhost:3000"}, // 실제 프론트엔드 주소
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Credentials 허용
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
}

func (s *Server) Run() {
	api := s.router.Group("/api")
	{
		user_api := api.Group("/users")
		s.RegisterUserRoutes(user_api)
	}

	s.router.Run(":" + s.PORT)
}
