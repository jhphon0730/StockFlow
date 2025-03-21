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

type InventoryHandler interface {
	GetAllInventory(c *gin.Context)
	GetInventory(c *gin.Context)
	CreateInventory(c *gin.Context)
	DeleteInventory(c *gin.Context)
}

type inventoryHandler struct {
	inventoryService services.InventoryService
}

func NewInventoryHandler(inventoryService services.InventoryService) InventoryHandler {
	return &inventoryHandler{
		inventoryService: inventoryService,
	}
}

func (i *inventoryHandler) GetAllInventory(c *gin.Context) {
	status, inventories, err := i.inventoryService.FindAll()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"inventories": inventories,
	}

	utils.JSONResponse(c, status, res_data, nil)
}

func (i *inventoryHandler) GetInventory(c *gin.Context) {
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

	status, inventory, err := i.inventoryService.FindByID(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"inventory": inventory,
	}

	utils.JSONResponse(c, status, res_data, nil)
}

func (i *inventoryHandler) CreateInventory(c *gin.Context) {
	warehouse_id := c.Param("warehouse_id")
	product_id := c.Param("product_id")

	if warehouse_id == "" || product_id == "" {
		utils.JSONResponse(c, http.StatusBadRequest, nil, errors.New("id, warehouse_id, product_id are required"))
		return
	}

	warehouse_id_int, err := strconv.Atoi(warehouse_id)
	if err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	product_id_int, err := strconv.Atoi(product_id)
	if err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	createInventoryDTO := dto.CreateInventoryDTO{
		WarehouseID: uint(warehouse_id_int),
		ProductID:   uint(product_id_int),
		Quantity:    0,
	}

	if ok, err := createInventoryDTO.CheckCreateInventoryDTO(); !ok {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	status, inventory, err := i.inventoryService.Create(createInventoryDTO.ToModel())
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"inventory": inventory,
	}

	utils.JSONResponse(c, status, res_data, nil)
}

func (i *inventoryHandler) DeleteInventory(c *gin.Context) {
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

	status, err := i.inventoryService.Delete(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	utils.JSONResponse(c, status, nil, nil)
}
