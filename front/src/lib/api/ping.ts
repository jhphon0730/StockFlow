import { FetchWithAuth, Response } from "@/lib/api";

export const ping = async (): Promise<Response<null>> => {
  await FetchWithAuth('/ping', {
    method: 'GET',
  })
  return {
    data: null,
    error: null,
  }
}
