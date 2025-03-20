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

type WarehouseHandler interface {
	GetAllWarehouses(c *gin.Context)
	GetWarehouse(c *gin.Context)
	CreateWarehouse(c *gin.Context)
	DeleteWarehouse(c *gin.Context)
}

type warehouseHandler struct {
	warehouseService services.WarehouseService
}

func NewWarehouseHandler(warehouseService services.WarehouseService) WarehouseHandler {
	return &warehouseHandler{
		warehouseService: warehouseService,
	}
}

func (w *warehouseHandler) GetAllWarehouses(c *gin.Context) {
	status, warehouses, err := w.warehouseService.FindAll()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"warehouses": warehouses,
	}
	utils.JSONResponse(c, status, res_data, nil)
}

func (w *warehouseHandler) GetWarehouse(c *gin.Context) {
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

func (w *warehouseHandler) DeleteWarehouse(c *gin.Context) {
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

	status, err := w.warehouseService.Delete(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	utils.JSONResponse(c, status, nil, nil)
}
