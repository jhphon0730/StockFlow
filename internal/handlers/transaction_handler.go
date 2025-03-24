package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

type TransactionHandler interface {
	GetAllTransaction(c *gin.Context)
}

type transactionHandler struct {
	transactionService services.TransactionService
}

func NewTransactionHandler(transactionService services.TransactionService) TransactionHandler {
	return &transactionHandler{
		transactionService: transactionService,
	}
}

func (t *transactionHandler) GetAllTransaction(c *gin.Context) {
	status, transactions, err := t.transactionService.FindAll()
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"transactions": transactions,
	}

	utils.JSONResponse(c, status, res_data, nil)
}
