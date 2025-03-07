package server

import "github.com/gin-gonic/gin"

func (s *Server) RegisterUserRoutes(router *gin.RouterGroup) {
	router.GET("/", userHandler.FindAllUsers)
	router.POST("/", userHandler.SignUpUser)
}
