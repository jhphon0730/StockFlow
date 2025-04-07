import { Transaction } from "@/types/transaction";

export interface WebSocketInformation {
  roomID: string;
  connectedClientCount: number;
}

export interface CountComparison {
  count: number;
  comparison: number;
}

export interface DashboardInfo {
  inventory: CountComparison;
  product: CountComparison;
  warehouse: CountComparison;
	zero_quantity: CountComparison;
  recent_transactions: Transaction[];
}
