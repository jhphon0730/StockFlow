package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setup() (*gorm.DB, *gin.Engine, repositories.ProductRepository, services.ProductService, handlers.ProductHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	productRepo := repositories.NewProductRepository(db)
	productService := services.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	router := gin.Default()
	return db, router, productRepo, productService, productHandler
}

func cleanup(db *gorm.DB) {
	// 테스트 후 DB 초기화
	db.Exec("DELETE FROM products")
}

func TestCreateProduct(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, router, _, _, productHandler := setup()
	router.POST("/products", productHandler.CreateProduct)

	payload := dto.CreateProductDTO{
		Name:        "TestProduct",
		Description: "TestDescription",
		SKU:         "TestSKU",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/products", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("Expected status %v, got %v", http.StatusCreated, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Product *models.Product `json:"product"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Data.Product == nil {
		t.Fatalf("Expected product to be created")
	}

	if resp.Data.Product.Name != payload.Name {
		t.Errorf("Expected product name %v, got %v", payload.Name, resp.Data.Product.Name)
	}
}

func TestGetAllProduct(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, productHandler := setup()
	router.GET("/products", productHandler.GetAllProducts)

	// Test 데이터 삽입
	cleanup(db)
	CreateTestProduct(db, "test1", "test1")
	CreateTestProduct(db, "test2", "test2")

	req, err := http.NewRequest("GET", "/products", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status %v, got %v", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Products []models.Product `json:"products"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if len(resp.Data.Products) != 2 {
		t.Errorf("Expected 2 products, got %v", len(resp.Data.Products))
	}
}

func TestGetProduct(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, productHandler := setup()
	router.GET("/products/:id", productHandler.GetProduct)

	// Test 데이터 삽입
	cleanup(db)
	CreateTestProduct(db, "test1", "test1")

	req, err := http.NewRequest("GET", "/products/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status %v, got %v", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Product *models.Product `json:"product"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Data.Product == nil {
		t.Fatalf("Expected product to be non-nil")
	}
}

func TestDeleteProduct(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, productHandler := setup()
	router.DELETE("/products/:id", productHandler.DeleteProduct)

	// Test 데이터 삽입
	cleanup(db)
	CreateTestProduct(db, "test1", "test1")

	req, err := http.NewRequest("DELETE", "/products/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status %v, got %v", http.StatusOK, rr.Code)
	}
}
