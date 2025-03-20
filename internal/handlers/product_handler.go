package handlers

import (
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gin-gonic/gin"

	"errors"
	"net/http"
	"strconv"
)

type ProductHandler interface {
	GetAllProducts(c *gin.Context)
	GetProduct(c *gin.Context)
	CreateProduct(c *gin.Context)
}

type productHandler struct {
	productService services.ProductService
}

func NewProductHandler(productservice services.ProductService) ProductHandler {
	return &productHandler{
		productService: productservice,
	}
}

func (p *productHandler) GetAllProducts(c *gin.Context) {
	status, products, err := p.productService.FindAll()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"products": products,
	}

	utils.JSONResponse(c, status, res_data, nil)
}

func (p *productHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.JSONResponse(c, http.StatusBadRequest, nil, errors.New("id is required"))
		return
	}

	id_int, err := strconv.Atoi(id)
	if err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	status, product, err := p.productService.FindByID(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"product": product,
	}
	utils.JSONResponse(c, status, res_data, nil)

}

func (p *productHandler) CreateProduct(c *gin.Context) {
	var createProductDTO dto.CreateProductDTO
	if err := c.ShouldBind(&createProductDTO); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// 1. Check Regex
	if check, err := createProductDTO.CheckCreateProductDTO(); !check {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// 2. Convert DTO to Model & creaet
	status, product, err := p.productService.Create(createProductDTO.ToModel())
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"product": product,
	}

	utils.JSONResponse(c, status, res_data, nil)
}
