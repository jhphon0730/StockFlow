import { FetchWithAuth, Response } from "@/lib/api";
import { WebSocketInformation, DashboardInfo } from "@/types/dashboard";

export const GetRoomInfo = async (): Promise<Response<WebSocketInformation[]>> => {
	const res = await FetchWithAuth('/ws/room', {
		method: "GET",
	})
	return {
		data: res.data,
		error: res.error,
	}
}

export const GetDashboardInfo = async (): Promise<Response<DashboardInfo>> => {
	const res = await FetchWithAuth('/dashboard', {
		method: "GET",
	})
	return {
		data: res.data,
		error: res.error,
	}
}
