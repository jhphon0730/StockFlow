import { Inventory } from "@/types/inventory";

export interface Warehouse {
	ID: number;
	name: string;
	location: string;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Inventories: Inventory[];
}
