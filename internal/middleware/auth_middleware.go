package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/jhphon0730/StockFlow/pkg/auth"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Check Header
		header := c.GetHeader("Authorization")
		if header == "" {
			utils.JSONResponse(c, http.StatusUnauthorized, nil, errors.New("비정상 요청입니다"))
			c.Abort()
			return
		}

		// 2. Check Token
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" {
			utils.JSONResponse(c, http.StatusUnauthorized, nil, errors.New("비정상 요청입니다"))
			c.Abort()
			return
		}

		// 3. Validate Token
		claims, err := auth.ValidateAndParseJWT(token)
		if err != nil {
			utils.JSONResponse(c, http.StatusUnauthorized, nil, err)
			c.Abort()
			return
		}

		// 4. Save UserID to Context & Token
		userID := claims.UserID
		c.Set("userID", userID)
		c.Set("token", token)
		c.Next()
	}
}
