import { ArrowDownRight, ArrowUpRight, Box, BarChart3 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { DashboardInfo } from "@/types/dashboard"

interface ZeroInventoryStatusProps {
	dashboardInfo: DashboardInfo | null
	isLoadingDashboard: boolean
}

interface InventoryStatusProps {
	dashboardInfo: DashboardInfo | null
	isLoadingDashboard: boolean
}

export const ZeroInventoryStatus = ({ isLoadingDashboard, dashboardInfo }: ZeroInventoryStatusProps) => {
	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">부족 재고</CardTitle>
					<BarChart3 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isLoadingDashboard ? (
						<div className="animate-pulse h-8 bg-gray-200 rounded w-16 mb-1"></div>
					): (
						<>
							<div className="text-2xl font-bold">{dashboardInfo && dashboardInfo.inventory.count || 0}</div>
							<p className="text-xs text-muted-foreground">집계 없음</p>
						</>
					)}
				</CardContent>
			</Card>
		</>
	)
}

export const InventoryStatus = ({ isLoadingDashboard, dashboardInfo }: InventoryStatusProps) => {
	return (
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
	)
}
