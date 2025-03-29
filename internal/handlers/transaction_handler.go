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

type TransactionHandler interface {
	GetAllTransactions(c *gin.Context)
	GetTransaction(c *gin.Context)
	CreateTransaction(c *gin.Context)
	DeleteTransaction(c *gin.Context)
}

type transactionHandler struct {
	transactionService services.TransactionService
}

func NewTransactionHandler(transactionService services.TransactionService) TransactionHandler {
	return &transactionHandler{
		transactionService: transactionService,
	}
}

func (t *transactionHandler) GetAllTransactions(c *gin.Context) {
	ctx := c.Request.Context()
	status, transactions, err := t.transactionService.FindAll(ctx)
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

func (t *transactionHandler) CreateTransaction(c *gin.Context) {
	ctx := c.Request.Context()
	var createTransactionDTO dto.CreateTransactionDTO
	if err := c.ShouldBindJSON(&createTransactionDTO); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	if ok, err := createTransactionDTO.CheckCreateInventoryDTO(); !ok {
		utils.JSONResponse(c, http.StatusBadRequest, nil, err)
		return
	}

	status, transaction, err := t.transactionService.Create(createTransactionDTO.ToModel(), ctx)
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	res_data := gin.H{
		"transaction": transaction,
	}

	utils.JSONResponse(c, status, res_data, nil)
}

func (t *transactionHandler) DeleteTransaction(c *gin.Context) {
	ctx := c.Request.Context()
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

	status, err := t.transactionService.Delete(uint(id_int), ctx)
	if err != nil {
		utils.JSONResponse(c, status, nil, err)
		return
	}

	utils.JSONResponse(c, status, nil, nil)
}
