import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, WarehouseIcon, MapPin, Calendar, Package, Edit, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loading, LoadingCard } from "@/components/ui/loading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { Warehouse } from "@/types/warehouse"
import { GetWarehouseById, DeleteWarehouse } from "@/lib/api/warehouse"
import { formatDate } from "@/lib/utils"

const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchWarehouseData(Number.parseInt(id))
  }, [id])

  const fetchWarehouseData = async (warehouseId: number) => {
    setIsLoading(true)
    try {
      const response = await GetWarehouseById(warehouseId)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "창고 정보 조회 실패",
          text: response.error,
        })
        navigate("/warehouses")
        return
      }
      setWarehouse(response.data.warehouse)
    } catch (error) {
      console.error("창고 정보 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "창고 정보 조회 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      navigate("/warehouses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWarehouse = async () => {
    if (!warehouse) return

    setIsDeleting(true)
    try {
      const response = await DeleteWarehouse(warehouse.ID)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "창고 삭제 실패",
          text: response.error,
        })
        setIsDeleting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "창고 삭제 성공",
        text: "창고가 성공적으로 삭제되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate("/warehouses")
      })
    } catch (error) {
      console.error("창고 삭제 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "창고 삭제 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <LoadingCard />
      </div>
    )
  }

  if (!warehouse) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
        <WarehouseIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">창고 정보를 찾을 수 없습니다</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">요청하신 창고 정보를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate("/warehouses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          창고 목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const hasInventory = warehouse.Inventories && warehouse.Inventories.length > 0
  const inventoryCount = hasInventory ? warehouse.Inventories?.length : 0
  const totalItems = hasInventory ? warehouse.Inventories?.reduce((sum, inv) => sum + inv.quantity, 0) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/warehouses")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
            <p className="text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {warehouse.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/warehouses/${warehouse.ID}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>창고 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 창고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 재고 데이터가 함께
                  삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteWarehouse}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Loading size="sm" text="삭제 중..." /> : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">생성일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(warehouse.CreatedAt)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">제품 종류</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{inventoryCount}개</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 재고량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <WarehouseIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{totalItems}개</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">재고 목록</TabsTrigger>
          <TabsTrigger value="info">창고 정보</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>재고 목록</CardTitle>
                <CardDescription>이 창고에 보관 중인 모든 제품 목록입니다.</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/inventory/create?warehouse_id=${warehouse.ID}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  재고 추가
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {hasInventory ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제품명</TableHead>
                        <TableHead>제품 코드</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead className="text-right">수량</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warehouse.Inventories.map((inventory) => (
                        <TableRow key={inventory.ID}>
                          <TableCell className="font-medium">{inventory.Product.name}</TableCell>
                          <TableCell>{inventory.Product.code || "-"}</TableCell>
                          <TableCell>
                            {inventory.Product.category ? (
                              <Badge variant="outline">{inventory.Product.category}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">{inventory.quantity}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/inventory/${inventory.ID}`}>상세</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">등록된 재고가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    이 창고에 보관 중인 제품이 없습니다. 새 재고를 추가해보세요.
                  </p>
                  <Button asChild>
                    <Link to={`/inventory/create?warehouse_id=${warehouse.ID}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      재고 추가
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>창고 정보</CardTitle>
              <CardDescription>창고의 상세 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">창고 ID</h3>
                <p className="text-sm text-muted-foreground">{warehouse.ID}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">창고 이름</h3>
                <p className="text-sm text-muted-foreground">{warehouse.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">위치</h3>
                <p className="text-sm text-muted-foreground">{warehouse.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">생성일</h3>
                <p className="text-sm text-muted-foreground">{formatDate(warehouse.CreatedAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">최종 수정일</h3>
                <p className="text-sm text-muted-foreground">{formatDate(warehouse.UpdatedAt)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link to={`/warehouses/${warehouse.ID}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  정보 수정
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WarehouseDetail
