import { Inventory } from "@/types/inventory";

export interface Transaction {
	ID: number;
	inventory_id: number;
	type: "in" | "out" | "adjust";
	quantity: number;
	timestamp: string;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;

	Inventory: Inventory;
}
