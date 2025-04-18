import { Transaction } from "@/types/transaction";
import { Product } from "@/types/product";
import { Warehouse } from "@/types/warehouse";

export interface Inventory {
	ID: number;
	warehouse_id: number;
	product_id: number;
	quantity: number;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Product: Product;
	Warehouse: Warehouse;
	Transactions: Transaction[] | null;
}

export interface inventorySearchParams {
	warehouse_id?: number;
	product_id?: number;
}

export interface CreateProductParams {
	warehouse_id: number;
	product_id: number;
}
