"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Warehouse, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"

import { CreateWarehouse } from "@/lib/api/warehouse"
import { SendUpdateMessage } from "@/hooks/use-websocket";

const WarehouseCreate = () => {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; location?: string }>({})

  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { name?: string; location?: string } = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = "창고 이름을 입력해주세요"
      isValid = false
    }

    if (!location.trim()) {
      newErrors.location = "위치를 입력해주세요"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await CreateWarehouse({ name, location })

      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "창고 생성 실패",
          text: response.error,
        })
        setIsSubmitting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "창고 생성 성공",
        text: "새 창고가 성공적으로 생성되었습니다.",
        timer: 1500,
      }).then(() => {
				SendUpdateMessage()
        navigate(`/warehouse/${response.data.warehouse.ID}`)
      })
    } catch (error) {
      console.error("창고 생성 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "창고 생성 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
					<Link to="/warehouse" >
						<ArrowLeft className="h-45 w-45" />
					</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">새 창고 추가</h1>
          <p className="text-muted-foreground">새로운 창고 정보를 입력하세요.</p>
        </div>
      </div>

      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            창고 정보
          </CardTitle>
          <CardDescription>새 창고의 기본 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                창고 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="창고 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                위치 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="창고 위치를 입력하세요"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                />
              </div>
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline">
							<Link to="/warehouse">
								취소
							</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loading size="sm" text="저장 중..." /> : "저장"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default WarehouseCreate

