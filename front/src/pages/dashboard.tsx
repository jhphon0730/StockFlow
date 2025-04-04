import React, { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, BarChart3, Box, Package, Truck, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomStatus } from "@/components/dashboard/room-status"

import { DashboardInfo } from "@/types/dashboard"
import { GetDashboardInfo } from "@/lib/api/dashboard"

const Dashboard = () => {
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)

	useEffect(() => {
		getDashboardInfoHandler()
	}, [])

	const getDashboardInfoHandler = async () => {
		const res = await GetDashboardInfo()
		if (res.error) {
			console.error(res.error)
		} else {
			setDashboardInfo(res.data)
		}
		setIsLoadingDashboard(false)
	}
  // 트랜잭션 타입에 따른 색상 및 아이콘 반환
  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case "in":
        return { color: "bg-green-500", icon: <ArrowUpRight className="h-3 w-3 text-green-500" /> }
      case "out":
        return { color: "bg-blue-500", icon: <ArrowDownRight className="h-3 w-3 text-blue-500" /> }
      case "adjust":
        return { color: "bg-amber-500", icon: <BarChart3 className="h-3 w-3 text-amber-500" /> }
      default:
        return { color: "bg-gray-500", icon: <Clock className="h-3 w-3 text-gray-500" /> }
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko })
    } catch (error) {
      return "날짜 정보 없음"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">재고 현황 및 최근 트랜잭션을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 제품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mb-1"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardInfo && dashboardInfo.product.count || 0}</div>
                {dashboardInfo?.product.comparison !== 0 && (
                  <div
                    className={`flex items-center text-xs ${dashboardInfo && dashboardInfo.product.comparison > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {dashboardInfo && dashboardInfo.product.comparison > 0 ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    전월 대비 {Math.abs(dashboardInfo?.product.comparison || 0)}%
                  </div>
                )}
                {dashboardInfo?.product.comparison === 0 && (
                  <p className="text-xs text-muted-foreground">전월과 동일</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 재고</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mb-1"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardInfo && dashboardInfo.inventory.count || 0}</div>
                {dashboardInfo?.inventory.comparison !== 0 && (
                  <div
                    className={`flex items-center text-xs ${dashboardInfo && dashboardInfo.inventory.comparison > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {dashboardInfo && dashboardInfo.inventory.comparison > 0 ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    전월 대비 {Math.abs(dashboardInfo?.inventory.comparison || 0)}%
                  </div>
                )}
                {dashboardInfo?.inventory.comparison === 0 && (
                  <p className="text-xs text-muted-foreground">전월과 동일</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">부족 재고</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <div className="flex items-center text-xs text-red-500">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              전월 대비 +4
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">창고</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mb-1"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardInfo && dashboardInfo.warehouse.count || 0}</div>
                {dashboardInfo?.warehouse.comparison !== 0 && (
                  <div
                    className={`flex items-center text-xs ${dashboardInfo && dashboardInfo.warehouse.comparison > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {dashboardInfo && dashboardInfo.warehouse.comparison > 0 ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    전월 대비 {Math.abs(dashboardInfo?.warehouse.comparison || 0)}%
                  </div>
                )}
                {dashboardInfo?.warehouse.comparison === 0 && (
                  <p className="text-xs text-muted-foreground">전월과 동일</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Room 상태 컴포넌트 */}
        <RoomStatus />

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>시스템에서 최근에 발생한 활동 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                    <div className="w-full">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardInfo?.recent_transactions && dashboardInfo.recent_transactions.length > 0 ? (
              <div className="space-y-4">
                {dashboardInfo.recent_transactions.map((transaction) => {
                  const { color } = getTransactionTypeInfo(transaction.type)
                  return (
                    <div key={transaction.ID} className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.Inventory?.Product?.name || "제품"}
                          {transaction.type === "in" ? "입고" : transaction.type === "out" ? "출고" : "조정"} (
                          {transaction.quantity > 0 ? "+" : ""}
                          {transaction.quantity})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)} •{" "}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">최근 활동 내역이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
