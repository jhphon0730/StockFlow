import { Inventory } from "@/types/inventory";

export type TransactionType = "IN" | "OUT" | "ADJUST"

export interface Transaction {
  ID: number
  inventory_id: number
  type: TransactionType
  quantity: number
  note?: string
  timestamp: string
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null

  Inventory?: Inventory
}

export interface transactionSearchParams {
	inventory_id?: number
	type?: TransactionType
}

export interface CreateTransactionParams {
	inventory_id: number
	type: TransactionType
	quantity: number
}
