import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Package, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { CreateTransaction } from "@/lib/api/transaction"
import { GetInventoryById } from "@/lib/api/inventory"
import type { Inventory } from "@/types/inventory"
import type { TransactionType } from "@/types/transaction"

// 소문자 타입 (UI용)
type LowercaseTransactionType = "in" | "out" | "adjust"

// 소문자 타입을 대문자 타입으로 변환하는 함수
const toUppercaseType = (type: LowercaseTransactionType): TransactionType => {
  switch (type) {
    case "in":
      return "IN"
    case "out":
      return "OUT"
    case "adjust":
      return "ADJUST"
  }
}

const TransactionCreate = () => {
  const [inventoryId, setInventoryId] = useState<number | undefined>(undefined)
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [type, setType] = useState<LowercaseTransactionType>("in")
  const [quantity, setQuantity] = useState<number>(0)
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ type?: string; quantity?: string }>({})

  const navigate = useNavigate()
  const searchParams = useSearchParams()[0]

  useEffect(() => {
    // URL에서 초기값 가져오기
    const inventoryIdParam = searchParams.get("inventory_id")

    if (inventoryIdParam) {
      const id = Number.parseInt(inventoryIdParam, 10)
      setInventoryId(id)
      fetchInventoryData(id)
    }
  }, [searchParams])

  const fetchInventoryData = async (id: number) => {
    setIsLoadingInventory(true)
    try {
      const response = await GetInventoryById(id)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "재고 정보 조회 실패",
          text: response.error,
        })
        navigate("/inventory")
        return
      }
      setInventory(response.data.inventory)
    } catch (error) {
      console.error("재고 정보 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 정보 조회 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      navigate("/inventory")
    } finally {
      setIsLoadingInventory(false)
    }
  }

  const validateForm = () => {
    const newErrors: { type?: string; quantity?: string } = {}
    let isValid = true

    if (!type) {
      newErrors.type = "재고 내역 유형을 선택해주세요"
      isValid = false
    }

    if (quantity <= 0) {
      newErrors.quantity = "수량은 0보다 커야 합니다"
      isValid = false
    }

    // 출고 시 현재 재고보다 많은 수량을 출고할 수 없음
    if (type === "out" && inventory && quantity > inventory.quantity) {
      newErrors.quantity = `현재 재고(${inventory.quantity})보다 많은 수량을 출고할 수 없습니다`
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !inventoryId) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await CreateTransaction({
        inventory_id: inventoryId,
        type: toUppercaseType(type), // 대문자로 변환
        quantity: Math.abs(quantity),
      })

      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "재고 내역 생성 실패",
          text: response.error,
        })
        setIsSubmitting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "재고 내역 생성 성공",
        text: "재고 내역이 성공적으로 추가되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate(`/inventory/${inventoryId}`)
      })
    } catch (error) {
      console.error("재고 내역 생성 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 내역 생성 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (transactionType: LowercaseTransactionType) => {
    switch (transactionType) {
      case "in":
        return <ArrowUpRight className="h-4 w-4 text-green-500" aria-hidden="true" />
      case "out":
        return <ArrowDownRight className="h-4 w-4 text-blue-500" aria-hidden="true" />
      case "adjust":
        return <BarChart3 className="h-4 w-4 text-amber-500" aria-hidden="true" />
    }
  }

  const getTypeLabel = (transactionType: LowercaseTransactionType) => {
    switch (transactionType) {
      case "in":
        return "입고"
      case "out":
        return "출고"
      case "adjust":
        return "조정"
    }
  }

  if (isLoadingInventory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]" aria-busy="true">
        <Loading size="lg" text="재고 정보를 불러오는 중입니다..." />
      </div>
    )
  }

  if (!inventory && inventoryId) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10"
        role="alert"
        aria-live="assertive"
      >
        <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
        <h1 className="text-lg font-medium mb-2">재고 정보를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground mb-4 text-center">요청하신 재고 정보를 찾을 수 없습니다.</p>
        <Button asChild>
          <Link to="/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>재고 목록으로 돌아가기</span>
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <header className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Link to={inventory ? `/inventory/${inventory.ID}` : "/inventory"}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">뒤로 가기</span>
          </Link>
        </Button>
        <div>
          <h1 id="transaction-create-title" className="text-3xl font-bold tracking-tight">
            재고 내역 추가
          </h1>
          {inventory && (
            <p className="text-muted-foreground">
              <span className="font-medium">{inventory.Product.name}</span> - {inventory.Warehouse.name} (현재 수량:{" "}
              {inventory.quantity})
            </p>
          )}
        </div>
      </header>

      <section aria-labelledby="transaction-create-title">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" aria-hidden="true" />
              <span>재고 내역 정보</span>
            </CardTitle>
            <CardDescription>재고 내역 정보를 입력해주세요.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <fieldset className="space-y-4">
                <legend className="text-sm font-medium mb-2">
                  재고 내역 유형 <span className="text-red-500">*</span>
                </legend>
                <RadioGroup
                  value={type}
                  onValueChange={(value) => setType(value as LowercaseTransactionType)}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  {(["in", "out", "adjust"] as const).map((transactionType) => (
                    <div key={transactionType} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={transactionType}
                        id={`type-${transactionType}`}
                        aria-describedby={`type-${transactionType}-description`}
                      />
                      <Label htmlFor={`type-${transactionType}`} className="flex items-center cursor-pointer space-x-2">
                        {getTypeIcon(transactionType)}
                        <span>{getTypeLabel(transactionType)}</span>
                      </Label>
                      <span id={`type-${transactionType}-description`} className="sr-only">
                        {transactionType === "in"
                          ? "재고를 추가합니다"
                          : transactionType === "out"
                            ? "재고를 감소시킵니다"
                            : "재고를 조정합니다"}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  수량 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={errors.quantity ? "border-red-500" : ""}
                  aria-describedby="quantity-description"
                />
                <p id="quantity-description" className="text-sm text-muted-foreground">
                  {type === "in"
                    ? "입고할 수량을 입력하세요."
                    : type === "out"
                      ? "출고할 수량을 입력하세요."
                      : "조정할 수량을 입력하세요."}
                </p>
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>

            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button type="button" variant="outline" className="cursor-pointer">
                <Link to={inventory ? `/inventory/${inventory.ID}` : "/inventory"}>
                  <span>취소</span>
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? <Loading size="sm" text="저장 중..." /> : "저장"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </main>
  )
}

export default TransactionCreate
