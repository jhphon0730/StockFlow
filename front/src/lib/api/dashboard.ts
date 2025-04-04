import { FetchWithAuth, Response } from "@/lib/api";
import { WebSocketInformation } from "@/types/dashboard";

export const GetRoomInfo = async (): Promise<Response<WebSocketInformation[]>> => {
	const res = await FetchWithAuth('/ws/room', {
		method: "GET",
	})
	return {
		data: res.data,
		error: res.error,
	}
}
