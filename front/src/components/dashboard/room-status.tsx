import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

import { GetRoomInfo } from "@/lib/api/dashboard";
import { WebSocketInformation } from "@/types/dashboard";

export const RoomStatus = () => {
	const [rooms, setRooms] = useState<WebSocketInformation[] | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getRoomInfoHandler()

    const intervalId = setInterval(() => {
      getRoomInfoHandler()
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

	const getRoomInfoHandler = async() => {
		setIsLoading(() => true)
		const res = await GetRoomInfo();
		if (res.error) {
			return
		}

		setRooms(res.data);
		setIsLoading(() => false)

		return
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-medium">실시간 접속 현황</CardTitle>
					<CardDescription>각 페이지별 접속자 수</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[200px] flex items-center justify-center">
						<p className="text-muted-foreground">로딩 중...</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">실시간 접속 현황</CardTitle>
        <CardDescription>각 페이지별 접속자 수</CardDescription>
      </CardHeader>
      <CardContent>
        {!rooms || rooms.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">접속 중인 사용자가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.roomID} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{getRoomDisplayName(room.roomID)}</p>
                    <p className="text-sm text-muted-foreground">Room ID: {room.roomID}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{room.connectedClientCount}</span>
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
	)
}

// Room ID를 사용자 친화적인 이름으로 변환
const getRoomDisplayName = (roomID: string): string => {
  const roomMap: Record<string, string> = {
    dashboard: "대시보드",
    products: "제품 목록",
    warehouses: "창고 목록",
    inventory: "재고 관리",
    reports: "보고서",
    users: "사용자 관리",
    settings: "설정",
  }

  // 제품 상세 페이지 처리
  if (roomID.startsWith("products/")) {
    return "제품 상세"
  }

  // 창고 상세 페이지 처리
  if (roomID.startsWith("warehouses/")) {
    return "창고 상세"
  }

  return roomMap[roomID] || roomID
}

