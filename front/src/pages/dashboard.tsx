import { useEffect, useState } from "react"

import { RoomStatus } from "@/components/dashboard/room-status"

import { DashboardInfo } from "@/types/dashboard"
import { ProductStatus } from "@/components/dashboard/product-status"
import { InventoryStatus, ZeroInventoryStatus } from "@/components/dashboard/inventory-status"
import { TransactionRecentList } from "@/components/dashboard/transaction-status"
import { WarehouseStatus } from "@/components/dashboard/warehouse-status"
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">재고 현황 및 최근 트랜잭션을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<ProductStatus isLoadingDashboard={isLoadingDashboard} dashboardInfo={dashboardInfo} />
				<InventoryStatus isLoadingDashboard={isLoadingDashboard} dashboardInfo={dashboardInfo} />
				<ZeroInventoryStatus isLoadingDashboard={isLoadingDashboard} dashboardInfo={dashboardInfo} />
				<WarehouseStatus isLoadingDashboard={isLoadingDashboard} dashboardInfo={dashboardInfo} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RoomStatus />
				<TransactionRecentList isLoadingDashboard={isLoadingDashboard} dashboardInfo={dashboardInfo} />
      </div>
    </div>
  )
}

export default Dashboard
