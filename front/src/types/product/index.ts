import { Inventory } from "@/types/inventory";

export interface Product {
	ID: number;
	name: string;
	description: string;
	sku: string;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Inventories: Inventory[];
}
