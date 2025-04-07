package handlers

import (
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gin-gonic/gin"
)

type DashboardHandler interface {
	GetDashboard(c *gin.Context)
}

type dashboardHandler struct {
	dashboardService services.DashboardService
}

func NewDashboardHandler(dashboardService services.DashboardService) DashboardHandler {
	return &dashboardHandler{
		dashboardService: dashboardService,
	}
}

func (d *dashboardHandler) GetDashboard(c *gin.Context) {
	status, warehouse_count, warehouse_comparison, err := d.dashboardService.GetWarehouseCount()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	status, product_count, product_comparison, err := d.dashboardService.GetProductCount()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	status, inventory_count, inventory_comparison, err := d.dashboardService.GetInventoryCount()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	status, zero_quantity_count, err := d.dashboardService.GetZeroQuantityProducts()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	status, recent_transactions, err := d.dashboardService.GetRecentTransactions(5)
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"warehouse": gin.H {
			"count":       warehouse_count,
			"comparison":  warehouse_comparison,
		},
		"product": gin.H {
			"count":       product_count,
			"comparison":  product_comparison,
		},
		"inventory": gin.H {
			"count":       inventory_count,
			"comparison":  inventory_comparison,
		},
		"zero_quantity": gin.H {
			"count":       zero_quantity_count,
		},
		"recent_transactions": recent_transactions,
	}
	
	utils.JSONResponse(c, status, res_data, nil)
}

