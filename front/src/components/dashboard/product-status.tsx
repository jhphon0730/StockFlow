import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react"

import { DashboardInfo } from "@/types/dashboard"

interface ProductStatusProps {
	isLoadingDashboard: boolean
	dashboardInfo: DashboardInfo | null
}

export const ProductStatus = ({isLoadingDashboard, dashboardInfo}: ProductStatusProps) => {
	return (
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
	)
}
