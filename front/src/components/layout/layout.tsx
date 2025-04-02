import React from "react"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { BarChart3, Box, Home, LogOut, Menu, Package, Settings, Truck, Users, X, Bell, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useWebSocket } from "@/hooks/use-websocket"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  badge?: string | number
}

interface LayoutProps {
  children: React.ReactNode
}

const navItems: NavItem[] = [
  {
    icon: <Home className="h-4 w-4" />,
    label: "대시보드",
    path: "/",
  },
  {
    icon: <Package className="h-4 w-4" />,
    label: "제품",
    path: "/products",
    badge: 12,
  },
  {
    icon: <Truck className="h-4 w-4" />,
    label: "창고",
    path: "/warehouses",
  },
  {
    icon: <Box className="h-4 w-4" />,
    label: "재고",
    path: "/inventory",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    label: "보고서",
    path: "/reports",
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: "사용자",
    path: "/users",
  },
  {
    icon: <Settings className="h-4 w-4" />,
    label: "설정",
    path: "/settings",
  },
]

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

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isConnected, roomID } = useWebSocket()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
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
            <SidebarItem key={item.path} item={item} isActive={location.pathname === item.path} />
          ))}
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">홍길동</span>
              <span className="text-xs text-muted-foreground">관리자</span>
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
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
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
                연결됨: {roomID}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                연결 끊김
              </Badge>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">알림</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">검색</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>

        {/* Footer */}
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
          <p>© 2023 StockFlow. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

