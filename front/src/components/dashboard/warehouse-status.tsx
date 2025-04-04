import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Truck } from "lucide-react"

import { DashboardInfo } from "@/types/dashboard"

interface WarehouseStatusProps {
	isLoadingDashboard: boolean
	dashboardInfo: DashboardInfo | null
}

export const WarehouseStatus = ({isLoadingDashboard, dashboardInfo}: WarehouseStatusProps) => {
	return (
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
	)
}
