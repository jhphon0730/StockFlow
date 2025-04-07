import { FetchWithAuth, Response } from "@/lib/api";
import { WarehouseResponse, warehouseSearchParams } from "@/types/warehouse";

export const GetAllWarehouses = async (params?: warehouseSearchParams): Promise<Response<WarehouseResponse>> => {
  let url = "/warehouses"

  // Add query parameters if they exist
  if (params) {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append("name", params.name)
    if (params.location) queryParams.append("location", params.location)

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
