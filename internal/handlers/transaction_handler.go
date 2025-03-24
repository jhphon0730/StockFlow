package handlers

import (
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/utils"

	"github.com/gin-gonic/gin"

	"errors"
	"net/http"
	"strconv"
)

type TransactionHandler interface {
	GetAllTransaction(c *gin.Context)
	GetTransaction(c *gin.Context)
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

func (t *transactionHandler) GetTransaction(c *gin.Context) {
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

	status, transaction, err := t.transactionService.FindByID(uint(id_int))
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"transaction": transaction,
	}

	utils.JSONResponse(c, status, res_data, nil)
}
