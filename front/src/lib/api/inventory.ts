import { FetchWithAuth, Response } from "@/lib/api";
import { Inventory, CreateProductParams, inventorySearchParams } from "@/types/inventory";

export const GetAllInventories = async (params?: inventorySearchParams): Promise<Response<{ inventories: Inventory[] }>> => {
	let url = "/inventories"

	// Add query parameters if they exist
	if (params) {
		const queryParams = new URLSearchParams()
		if (params.warehouse_id) queryParams.append("warehouse_id", params.warehouse_id.toString())
		if (params.product_id) queryParams.append("product_id", params.product_id.toString())

		const queryString = queryParams.toString()
		if (queryString) {
			url += `?${queryString}`
		}
	}

	const res = await FetchWithAuth(url, {
		method: "GET",
	})

	return {
		data: res.data,
		error: res.error,
	}
}

export const CreateInventory = async (params: CreateProductParams): Promise<Response<{ inventory: Inventory }>> => {
	const res = await FetchWithAuth("/inventories", {
		method: "POST",
		body: JSON.stringify(params),
	})

	return {
		data: res.data,
		error: null,
	}
}
