import React, { useEffect, useState} from "react"
import { useLocation, Navigate, Outlet } from "react-router-dom"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

import { ping } from "@/lib/api/ping";
import { useWebSocket } from "@/hooks/use-websocket"
import { isAuthenticated } from "@/lib/api/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />
  }
  return <>{children}</>
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isConnected, currentRoomClientCount } = useWebSocket()

  useEffect(() => {
    setSidebarOpen(false)

		ping()
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
				<Header
					isConnected={isConnected}
					currentRoomClientCount={currentRoomClientCount}
					setSidebarOpen={setSidebarOpen}
				/>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
					<ProtectedRoute>
						<Outlet />
					</ProtectedRoute>
				</main>

        {/* Footer */}
				<Footer />
      </div>
    </div>
  )
}

