import { FetchWithAuth, Response } from "@/lib/api"
import type { Transaction, transactionSearchParams, CreateTransactionParams } from "@/types/transaction"

export const GetAllTransactions = async (params?: transactionSearchParams): Promise<Response<{ transactions: Transaction[] }>> => {
  let url = "/transactions"

  // Add query parameters if they exist
  if (params) {
    const queryParams = new URLSearchParams()
    if (params.inventory_id) queryParams.append("inventory_id", params.inventory_id.toString())
    if (params.type) queryParams.append("type", params.type)

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

export const GetTransactionById = async (id: number): Promise<Response<{ transaction: Transaction }>> => {
  const res = await FetchWithAuth(`/transactions/${id}`, {
    method: "GET",
  })
  return {
    data: res.data,
    error: res.error,
  }
}

export const CreateTransaction = async (data: CreateTransactionParams): Promise<Response<{transaction: Transaction}>> => {
  const res = await FetchWithAuth("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return {
    data: res.data,
    error: res.error,
  }
}

export const DeleteTransaction = async (id: number): Promise<Response<null>> => {
  const res = await FetchWithAuth(`/transactions/${id}`, {
    method: "DELETE",
  })
  return {
    data: res.data,
    error: res.error,
  }
}
