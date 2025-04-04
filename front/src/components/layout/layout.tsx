import React, { useEffect, useState} from "react"
import { useLocation, Navigate, Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

import { ping } from "@/lib/api/ping";
import { useWebSocket } from "@/hooks/use-websocket"
import { isAuthenticated } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore"

import 'react-toastify/dist/ReactToastify.css';

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
  const { user } = useAuthStore.getState()


  useEffect(() => {
    setSidebarOpen(false)

		ping()
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<Sidebar 
        user={user}
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

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

      <ToastContainer
        position="top-right" // 알람 위치 지정
        autoClose={1000} // 자동 off 시간
        hideProgressBar={false} // 진행시간바 숨김
        closeOnClick // 클릭으로 알람 닫기
        rtl={false} // 알림 좌우 반전
        pauseOnFocusLoss // 화면을 벗어나면 알람 정지
        draggable // 드래그 가능
        pauseOnHover // 마우스를 올리면 알람 정지
        theme="light"
        limit={6} // 알람 개수 제한
      />
				
    </div>
  )
}

