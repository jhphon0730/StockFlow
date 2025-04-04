package handlers

import "github.com/jhphon0730/StockFlow/internal/services"

type DashboardHandler interface {
}

type dashboardHandler struct {
	dashboardService services.DashboardService
}

func NewDashboardHandler(dashboardService services.DashboardService) DashboardHandler {
	return &dashboardHandler{
		dashboardService: dashboardService,
	}
}
