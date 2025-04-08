import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Box } from "lucide-react"
import Swal from "sweetalert2"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { setCookie } from "@/lib/cookies"
import { signIn, logout } from "@/lib/api/auth"
import type { SignInUserDTO } from "@/types/auth"
import { useAuthStore } from "@/store/useAuthStore"

const SignIn = () => {
  const [formData, setFormData] = useState<SignInUserDTO>({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    logout()

    // URL에서 expired 파라미터 확인
    const queryParams = new URLSearchParams(location.search)
    const isExpired = queryParams.get("expired") === "true"
    if (isExpired) {
      Swal.fire({
        title: "세션 만료",
        text: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
        icon: "warning",
        confirmButtonText: "확인",
        confirmButtonColor: "#3182F6",
      })
    }

    const isSignup = queryParams.get("signup") === "true"
    if (isSignup) {
      Swal.fire({
        title: "회원가입 완료",
        text: "회원가입이 완료되었습니다. 로그인해 주세요.",
        icon: "success",
        confirmButtonText: "확인",
        confirmButtonColor: "#3182F6",
      })
    }
  }, [location.search])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn(formData)
      if (result.data) {
        setCookie("token", result.data.token)
        setCookie("userID", result.data.user.ID)
        useAuthStore.getState().setUser(result.data.user)

        // 이전에 접근하려던 페이지가 있으면 해당 페이지로 리다이렉트
        const redirectPath = sessionStorage.getItem("redirectAfterLogin")
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin") // 사용 후 삭제
          navigate(redirectPath, { replace: true })
        } else {
          navigate("/", { replace: true })
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error(err)
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Box className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">StockFlow</CardTitle>
          <CardDescription className="text-center">계정에 로그인하여 시스템에 접속하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignIn

