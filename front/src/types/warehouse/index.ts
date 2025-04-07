import { Inventory } from "@/types/inventory";

export interface Warehouse {
	ID: number;
	name: string;
	location: string;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Inventories: Inventory[] | null;
}

export interface WarehouseResponse {
	warehouses: Warehouse[];
}

export interface warehouseSearchParams {
	name?: string
	location?: string
}
