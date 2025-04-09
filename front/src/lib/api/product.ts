import { FetchWithAuth, Response } from "@/lib/api";
import { Product, productSearchParams, ProductResponse, CreateProductParams } from "@/types/product";

export const GetAllProducts = async (params?: productSearchParams): Promise<Response<ProductResponse>> => {
  let url = "/products"

  // Add query parameters if they exist
  if (params) {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append("name", params.name)
    if (params.sku) queryParams.append("sku", params.sku)

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

export const CreateProduct = async (params: CreateProductParams): Promise<Response<{product: Product}>> => {
	const res = await FetchWithAuth("/products", {
		method: "POST",
		body: JSON.stringify(params),
	})

	return {
		data: res.data,
		error: res.error,
	}
}

// GetProductById, DeleteProduct }
export const GetProductById = async (id: number): Promise<Response<{product: Product}>> => {
	const res = await FetchWithAuth(`/products/${id}`, {
		method: "GET",
	})

	return {
		data: res.data,
		error: res.error,
	}
}

export const DeleteProduct = async (id: number): Promise<Response<null>> => {
	const res = await FetchWithAuth(`/products/${id}`, {
		method: "DELETE",
	})

	return {
		data: res.data,
		error: res.error,
	}
}
