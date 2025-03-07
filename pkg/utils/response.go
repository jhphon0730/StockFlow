package utils

import (
	"github.com/gin-gonic/gin"
)

// 공통 응답 구조체
type Response struct {
	Error string      `json:"error,omitempty"` // 에러 메시지 (없으면 생략)
	Data  interface{} `json:"data,omitempty"`  // 실제 응답 데이터
}

// JSON 응답을 반환하는 함수
func JSONResponse(c *gin.Context, statusCode int, data interface{}, err error) {
	var res Response

	if err != nil {
		res.Error = err.Error() // 에러 메시지 설정
		c.JSON(statusCode, res)
		return
	}

	res.Data = data // 정상 데이터 설정
	c.JSON(statusCode, res)
}
