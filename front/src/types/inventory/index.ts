import { Transaction } from "@/types/transaction";
import { Product } from "@/types/product";

export interface Inventory {
	ID: number;
	warehouse_id: number;
	product_id: number;
	quantity: number;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Product: Product;
	Transactions: Transaction[]
}
