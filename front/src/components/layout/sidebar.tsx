import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { BarChart3, Box, Home, LogOut, Package, Settings, Truck, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavItem } from "@/types/layout";
import { logout } from "@/lib/api/auth";
import { User } from "@/types/auth"

const navItems: NavItem[] = [
  {
    icon: <Home className="h-4 w-4" />,
    label: "대시보드",
    path: "/",
  },
  {
    icon: <Truck className="h-4 w-4" />,
    label: "창고",
    path: "/warehouse",
  },
  {
    icon: <Package className="h-4 w-4" />,
    label: "제품",
    path: "/product",
  },
  {
    icon: <Box className="h-4 w-4" />,
    label: "재고",
    path: "/inventory",
  },
	// Transaction
	{
		icon: <BarChart3 className="h-4 w-4" />,
		label: "재고 내역",
		path: "/transaction",
	},
]

interface SidebarProps {
	user: User | null
	sidebarOpen: boolean
	setSidebarOpen: (open: boolean) => void
}

const SidebarItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
  <Link
    to={item.path}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all w-full",
      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    {item.icon}
    <span className="flex-1">{item.label}</span>
    {item.badge && (
      <Badge
        variant={isActive ? "outline" : "secondary"}
        className={isActive ? "bg-primary-foreground text-primary" : ""}
      >
        {item.badge}
      </Badge>
    )}
  </Link>
)

export const Sidebar = ({user, sidebarOpen, setSidebarOpen}: SidebarProps) => {
	const navigate = useNavigate()

	const logoutHandler = () => {
		logout()
		navigate("/signin")
	}

	return (
		<>
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-14 items-center border-b px-4">
					<Link to="/" className="flex items-center gap-2 font-semibold">
						<Box className="h-6 w-6 text-primary" />
						<span>StockFlow</span>
					</Link>
					<Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
						<X className="h-5 w-5" />
						<span className="sr-only">사이드바 닫기</span>
					</Button>
				</div>
				<div className="flex flex-col gap-1 p-2">
					{navItems.map((item) => (
						<SidebarItem key={item.path} item={item} isActive={location.pathname === item.path || location.pathname.includes(item.path) && item.path !== "/"} />
					))}
				</div>
				{ user && <div className="mt-auto p-4 border-t">
					<div className="flex items-center gap-3">
						<Avatar className="h-9 w-9">
							<AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
							<AvatarFallback>{user.name.slice(1, 3)}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{user.name}</span>
							<span className="text-xs text-muted-foreground">
								{user.role === "admin" ? "관리자" : "일반 사용자"}
							</span>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="ml-auto">
									<Settings className="h-4 w-4" />
									<span className="sr-only">사용자 메뉴</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>내 계정</DropdownMenuLabel>
								<DropdownMenuItem>프로필</DropdownMenuItem>
								<DropdownMenuItem>설정</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logoutHandler}>
									<LogOut className="mr-2 h-4 w-4"/>
									로그아웃
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div> }
			</aside>
		</>
	)
}


