import { Inventory } from "@/types/inventory";

export interface Product {
	ID: number;
	name: string;
	description: string;
	sku: string;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Inventories: Inventory[] | null;
}

export interface productSearchParams {
	name?: string;
	sku?: string;
}

export interface ProductResponse {
	products: Product[];
}

export interface CreateProductParams {
	name: string;
	description: string;
	sku: string;
}
