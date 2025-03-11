// user_handler_test.go
package handlers_test

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	// 내부 패키지 경로는 프로젝트에 맞게 수정하세요.
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
)

// SetupTestDB는 인메모리 SQLite를 사용하여 테스트용 DB를 초기화합니다.
func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to open test database: %v", err)
	}
	// User 모델만 마이그레이션 (필요에 따라 다른 모델도 추가)
	db.AutoMigrate(&models.User{})
	return db
}

func TestRegisterSuccess(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 테스트용 DB, 레포지토리, 서비스, 핸들러 초기화
	db := SetupTestDB()
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	// Gin 라우터 설정
	router := gin.Default()
	router.POST("/register", userHandler.SignUpUser)

	// 요청 페이로드 생성 (dto.RegisterUserDTO 사용)
	payload := dto.SignUpUserDTO{
		Name:     "TestUser",
		Email:    "testuser@example.com",
		Password: "password123!",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/register", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// HTTP 테스트 리코더 생성
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	// 회원가입 성공 시 상태 코드는 http.StatusCreated (201)여야 함
	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %v, got %v", http.StatusCreated, rr.Code)
	}

	// 응답 JSON 파싱 및 검증 (utils.JSONResponse에 따라 "data" 필드가 존재해야 함)
	var resp map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Errorf("Failed to parse JSON response: %v", err)
	}

	if _, exists := resp["data"]; !exists {
		t.Error("Response does not contain 'data' field")
	}
}
