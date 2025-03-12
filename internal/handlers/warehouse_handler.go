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

type WareHouseHandler interface {
	GetWarehouse(c *gin.Context)
	CreateWarehouse(c *gin.Context)
}

type warehouseHandler struct {
	warehouseService services.WarehouseService
}

func NewWarehouseHandler(warehouseService services.WarehouseService) WareHouseHandler {
	return &warehouseHandler{
		warehouseService: warehouseService,
	}
}

func (w *warehouseHandler) GetWarehouse(c *gin.Context) {
	// 요청 시에는 /warehouses/:id 로 요청이 들어옴
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

	status, warehouse, err := w.warehouseService.FindByID(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"warehouse": warehouse,
	}
	utils.JSONResponse(c, status, res_data, nil)
}

func (w *warehouseHandler) CreateWarehouse(c *gin.Context) {
	var createWarehouseDTO dto.CreateWarehouseDTO
	if err := c.ShouldBind(&createWarehouseDTO); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// 1. Check Regex
	if check, err := createWarehouseDTO.CheckCreateWarehouseDTO(); !check {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	// 2. 창고 생성
	status, warehouse, err := w.warehouseService.Create(createWarehouseDTO.ToModel())
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"warehouse": warehouse,
	}

	utils.JSONResponse(c, status, res_data, nil)
}
