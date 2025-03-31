package utils

import (
	"github.com/gin-gonic/gin"
)

/* Handler 에서 gin.Context 를 Parameter로 받아서 특정 로직을 수항하는 경우
	* Context 에서 데이터를 복잡하게 추출하는 로직을 방지
*/

func GetWarehouseSearchQuery(c *gin.Context) map[string]interface{} {
	querys := make(map[string]interface{})

	if name := c.Query("name"); name != "" {
		querys["name"] = name
	}

	if location := c.Query("location"); location != "" {
		querys["location"] = location
	}

	return  querys
}

func GetProductSearchQuery(c *gin.Context) map[string]interface{} {
	querys := make(map[string]interface{})

	if name := c.Query("name"); name != "" {
		querys["name"] = name
	}

	if sku := c.Query("sku"); sku != "" {
		querys["sku"] = sku
	}

	return querys
}

func GetInventorySearchQuery(c *gin.Context) map[string]interface{} {
	querys := make(map[string]interface{})

	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		querys["warehouse_id"] = warehouseID
	}

	if productID := c.Query("product_id"); productID != "" {
		querys["product_id"] = productID
	}

	return querys
}
