import { FetchWithAuth, Response } from "@/lib/api";
import { productSearchParams, ProductResponse } from "@/types/product";

export const GetAllProducts = async (params?: productSearchParams): Promise<Response<ProductResponse>> => {
  let url = "/products"

  // Add query parameters if they exist
  if (params) {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append("name", params.name)
    if (params.sku) queryParams.append("location", params.sku)

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
