import { FetchWithAuth, Response } from "@/lib/api";
import { WarehouseResponse } from "@/types/warehouse";

export const GetAllWarehouses = async (): Promise<Response<WarehouseResponse>> => {
	const res = await FetchWithAuth('/warehouses', {
		method: "GET",
	})
	return {
		data: res.data,
		error: res.error,
	}
}
