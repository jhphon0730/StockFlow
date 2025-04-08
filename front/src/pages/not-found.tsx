import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Home } from "lucide-react"

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-14rem)] text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold mt-4">페이지를 찾을 수 없습니다</h2>
      <p className="text-muted-foreground mt-2 max-w-md">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          홈으로 돌아가기
        </Link>
      </Button>
    </div>
  )
}

export default NotFound;
