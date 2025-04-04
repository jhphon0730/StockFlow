import { Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface HeaderProps {
	isConnected: boolean
	currentRoomClientCount: number
	setSidebarOpen: (open: boolean) => void
}

export const Header = ({isConnected, currentRoomClientCount, setSidebarOpen}: HeaderProps) => {
	return (
		<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
			<Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
				<Menu className="h-5 w-5" />
				<span className="sr-only">사이드바 열기</span>
			</Button>

			<div className="flex-1 flex items-center gap-4">
				<div className="relative hidden md:flex items-center w-full max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input type="search" placeholder="검색..." className="pl-8 w-full" />
				</div>
			</div>

			<div className="flex items-center gap-2">
				{/* WebSocket 연결 상태 표시 */}
				{isConnected ? (
					<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
						연결됨 / 연결된 사용자: {currentRoomClientCount}명
					</Badge>
				) : (
					<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
						연결 끊김
					</Badge>
				)}

				{/*
					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-5 w-5" />
						<span className="sr-only">알림</span>
						<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
					</Button>
				*/}

				<Button variant="ghost" size="icon" className="md:hidden">
					<Search className="h-5 w-5" />
					<span className="sr-only">검색</span>
				</Button>
			</div>
		</header>
	)
}
