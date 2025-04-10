import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Package, Warehouse } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"

import { CreateInventory } from "@/lib/api/inventory"
import { GetAllWarehouses } from "@/lib/api/warehouse"
import { GetAllProducts } from "@/lib/api/product"
import type { Warehouse as WarehouseType } from "@/types/warehouse"
import type { Product } from "@/types/product"

const InventoryCreate = () => {
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined)
  const [productId, setProductId] = useState<number | undefined>(undefined)
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ warehouseId?: string; productId?: string }>({})

  const navigate = useNavigate()
  const searchParams = useSearchParams()[0]

  useEffect(() => {
    // URL에서 초기값 가져오기
    const warehouseIdParam = searchParams.get("warehouse_id")
    const productIdParam = searchParams.get("product_id")

    if (warehouseIdParam) {
      setWarehouseId(Number.parseInt(warehouseIdParam, 10))
    }
    if (productIdParam) {
      setProductId(Number.parseInt(productIdParam, 10))
    }

    // 창고 및 제품 목록 가져오기
    fetchOptions()
  }, [searchParams])

  const fetchOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const [warehousesRes, productsRes] = await Promise.all([GetAllWarehouses(), GetAllProducts()])

      if (warehousesRes.data) {
        setWarehouses(warehousesRes.data.warehouses)
      }

      if (productsRes.data) {
        setProducts(productsRes.data.products)
      }
    } catch (error) {
      console.error("옵션 로딩 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "데이터 로딩 실패",
        text: "창고 및 제품 목록을 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const validateForm = () => {
    const newErrors: { warehouseId?: string; productId?: string } = {}
    let isValid = true

    if (!warehouseId) {
      newErrors.warehouseId = "창고를 선택해주세요"
      isValid = false
    }

    if (!productId) {
      newErrors.productId = "제품을 선택해주세요"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !warehouseId || !productId) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await CreateInventory({
        warehouse_id: warehouseId,
        product_id: productId,
      })

      if (response.error) {
        let errorMessage = "재고 생성 중 오류가 발생했습니다."
        if (response.error.includes("duplicate")) {
          errorMessage = "이미 해당 창고에 같은 제품의 재고가 존재합니다."
        }

        Swal.fire({
          icon: "error",
          title: "재고 생성 실패",
          text: errorMessage,
        })
        setIsSubmitting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "재고 생성 성공",
        text: "새 재고가 성공적으로 생성되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate(`/inventory/${response.data.inventory.ID}`)
      })
    } catch (error) {
      console.error("재고 생성 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 생성 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Link to="/inventory">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">새 재고 추가</h1>
          <p className="text-muted-foreground">새로운 재고 정보를 입력하세요.</p>
        </div>
      </div>

      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            재고 정보
          </CardTitle>
          <CardDescription>새 재고의 기본 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">
                창고 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Warehouse className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  id="warehouse"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={warehouseId || ""}
                  onChange={(e) => setWarehouseId(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
                  disabled={isLoadingOptions}
                >
                  <option value="">창고 선택</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.ID} value={warehouse.ID}>
                      {warehouse.name} ({warehouse.location})
                    </option>
                  ))}
                </select>
              </div>
              {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">
                제품 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  id="product"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={productId || ""}
                  onChange={(e) => setProductId(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
                  disabled={isLoadingOptions}
                >
                  <option value="">제품 선택</option>
                  {products.map((product) => (
                    <option key={product.ID} value={product.ID}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">수량</Label>
              <Input id="quantity" type="number" value={0} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">
                재고 생성 시 초기 수량은 항상 0으로 설정됩니다. 재고 생성 후 재고 수정을 통해 수량을 조정할 수 있습니다.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" className="cursor-pointer">
              <Link to="/inventory">취소</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingOptions} className="cursor-pointer">
              {isSubmitting ? <Loading size="sm" text="저장 중..." /> : "저장"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default InventoryCreate
