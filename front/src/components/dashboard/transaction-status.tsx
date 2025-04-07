import { ArrowDownRight, ArrowUpRight, BarChart3, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { DashboardInfo } from "@/types/dashboard"

interface TransactionRecentListProps {
	isLoadingDashboard: boolean
	dashboardInfo: DashboardInfo | null
}

export const TransactionRecentList = ({ isLoadingDashboard, dashboardInfo }: TransactionRecentListProps) => {
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
	)
}
