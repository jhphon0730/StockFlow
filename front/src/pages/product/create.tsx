import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Package, Barcode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loading } from "@/components/ui/loading"

import { CreateProduct } from "@/lib/api/product"
import { SendUpdateMessage } from "@/hooks/use-websocket";

const ProductCreate = () => {
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; sku?: string }>({})

  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { name?: string; sku?: string } = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = "제품 이름을 입력해주세요"
      isValid = false
    }

    if (!sku.trim()) {
      newErrors.sku = "SKU를 입력해주세요"
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
      const response = await CreateProduct({ name, description, sku })

      if (response.error) {
				let errorMessage = "제품 생성 중 오류가 발생했습니다."
				if (response.error.includes("duplicate") && response.error.includes("sku")) {
					errorMessage = "이미 사용 중인 SKU입니다."
				}

        Swal.fire({
          icon: "error",
          title: "제품 생성 실패",
          text: errorMessage,
        })
        setIsSubmitting(false)
        return
      }

			SendUpdateMessage()
      Swal.fire({
        icon: "success",
        title: "제품 생성 성공",
        text: "새 제품이 성공적으로 생성되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate(`/product/${response.data.product.ID}`)
      })
    } catch (error) {
      console.error("제품 생성 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "제품 생성 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
					<Link to="/product" >
						<ArrowLeft className="h-45 w-45" />
					</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">새 제품 추가</h1>
          <p className="text-muted-foreground">새로운 제품 정보를 입력하세요.</p>
        </div>
      </div>

      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            제품 정보
          </CardTitle>
          <CardDescription>새 제품의 기본 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                제품 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="제품 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sku"
                  placeholder="제품 SKU를 입력하세요"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`pl-10 ${errors.sku ? "border-red-500" : ""}`}
                />
              </div>
              {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                제품 설명 <span className="text-muted-foreground text-sm">(선택사항)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="제품에 대한 설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" className="cursor-pointer">
							<Link to="/product">
								취소
							</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? <Loading size="sm" text="저장 중..." /> : "저장"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ProductCreate
