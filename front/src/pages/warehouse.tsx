import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import { MapPin, Package, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingCard } from "@/components/ui/loading"

import type { Warehouse as WarehouseType } from "@/types/warehouse"
import { GetAllWarehouses } from "@/lib/api/warehouse"

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getWarehousesHandler()
  }, [])

  const getWarehousesHandler = async () => {
    setIsLoading(true)
    try {
      const res = await GetAllWarehouses()
      if (res.error) {
        Swal.fire({
          icon: "error",
          title: "창고 목록 조회 실패",
          text: res.error,
        })
        return
      }

      if (res.data) {
        setWarehouses(res.data.warehouses)
      }
    } catch (error) {
      console.error("창고 목록 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "창고 목록 조회 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">창고</h1>
        <p className="text-muted-foreground">모든 창고를 관리하고 새 창고를 추가하세요.</p>
      </div>

      <div className="flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 창고 추가
        </Button>
      </div>

      {isLoading ? (
				<LoadingCard />
      ) : warehouses && warehouses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.ID} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>{warehouse.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {warehouse.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Package className="mr-1 h-4 w-4" />
                    <span className="font-medium">
                      {warehouse.Inventories && warehouse.Inventories.length > 0 ? warehouse.Inventories.length : 0}
                    </span>
                    <span className="ml-1 text-muted-foreground">제품</span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/warehouses/${warehouse.ID}`}>상세 정보</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">등록된 창고가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">새 창고를 추가하여 재고를 관리해보세요.</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />새 창고 추가
          </Button>
        </div>
      )}
    </div>
  )
}

export default Warehouses

