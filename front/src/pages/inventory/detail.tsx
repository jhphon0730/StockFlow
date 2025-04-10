import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Package, Warehouse, Calendar, Edit, Trash2, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

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

import type { Inventory } from "@/types/inventory"
import { GetInventoryById, DeleteInventory } from "@/lib/api/inventory"
import { formatDate } from "@/lib/utils"

const InventoryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchInventoryData(Number.parseInt(id))
  }, [id])

  const fetchInventoryData = async (inventoryId: number) => {
    setIsLoading(true)
    try {
      const response = await GetInventoryById(inventoryId)
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
      setIsLoading(false)
    }
  }

  const handleDeleteInventory = async () => {
    if (!inventory) return

    setIsDeleting(true)
    try {
      const response = await DeleteInventory(inventory.ID)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "재고 삭제 실패",
          text: response.error,
        })
        setIsDeleting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "재고 삭제 성공",
        text: "재고가 성공적으로 삭제되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate("/inventory")
      })
    } catch (error) {
      console.error("재고 삭제 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 삭제 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="재고 정보 로딩 중">
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

  if (!inventory) {
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

  const hasTransactions = inventory.Transactions && inventory.Transactions.length > 0

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Link to="/inventory">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">재고 목록으로 돌아가기</span>
            </Link>
          </Button>
          <div>
            <h1 id="inventory-detail-title" className="text-3xl font-bold tracking-tight">
              {inventory.Product.name || "알 수 없는 제품"} 재고
            </h1>
            <address className="text-muted-foreground flex items-center not-italic">
              <Warehouse className="h-4 w-4 mr-1" aria-hidden="true" />
              {inventory.Warehouse.name || "알 수 없는 창고"} ({inventory.Warehouse.location || "위치 정보 없음"})
            </address>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/inventory/${inventory.ID}/edit`}>
              <Edit className="h-4 w-4" aria-hidden="true" />
              <span>편집</span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>삭제</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>재고 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 재고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 내역 데이터가 함께
                  삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteInventory}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
                >
                  {isDeleting ? <Loading size="sm" text="삭제 중..." /> : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3" aria-label="재고 요약 정보">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">현재 수량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
              <Badge variant={inventory.quantity > 0 ? "outline" : "destructive"} className="text-lg px-2 py-1">
                {inventory.quantity}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">제품 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
              <div className="flex flex-col">
                <span>{inventory.Product.name || "알 수 없는 제품"}</span>
                <span className="text-xs text-muted-foreground">SKU: {inventory.Product.sku || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">생성일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
              <time dateTime={inventory.CreatedAt}>{formatDate(inventory.CreatedAt)}</time>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="inventory-detail-title">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions" className="cursor-pointer">
              내역
            </TabsTrigger>
            <TabsTrigger value="info" className="cursor-pointer">
              재고 정보
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>내역</CardTitle>
                  <CardDescription>이 재고의 모든 입출고 내역입니다.</CardDescription>
                </div>
                <Button asChild>
                  <Link to={`/transaction/create?inventory_id=${inventory.ID}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>내역 추가</span>
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {hasTransactions ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table aria-label="내역 목록">
                      <TableHeader>
                        <TableRow>
                          <TableHead>유형</TableHead>
                          <TableHead>수량</TableHead>
                          <TableHead>날짜</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.Transactions &&
                          inventory.Transactions.map((transaction) => (
                            <TableRow key={transaction.ID}>
                              <TableCell>
                                <Badge
                                  variant={
                                    transaction.type === "in"
                                      ? "secondary"
                                      : transaction.type === "out"
                                        ? "default"
                                        : "outline"
                                  }
                                >
                                  {transaction.type === "in" ? (
                                    <ArrowUpRight className="h-3 w-3 mr-1" aria-hidden="true" />
                                  ) : transaction.type === "out" ? (
                                    <ArrowDownRight className="h-3 w-3 mr-1" aria-hidden="true" />
                                  ) : null}
                                  <span>
                                    {transaction.type === "in" ? "입고" : transaction.type === "out" ? "출고" : "조정"}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {transaction.type === "in" ? "+" : transaction.type === "out" ? "-" : ""}
                                {Math.abs(transaction.quantity)}
                              </TableCell>
                              <TableCell>
                                <time dateTime={transaction.timestamp}>{formatDate(transaction.timestamp)}</time>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10"
                    role="status"
                    aria-live="polite"
                  >
                    <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-medium mb-2">내역이 없습니다</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      이 재고의 입출고 내역이 없습니다. 새 내역을 추가해보세요.
                    </p>
                    <Button asChild>
                      <Link to={`/transaction/create?inventory_id=${inventory.ID}`}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>내역 추가</span>
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
                <CardTitle>재고 정보</CardTitle>
                <CardDescription>재고의 상세 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl>
                  <div>
                    <dt className="text-sm font-medium mb-1">재고 ID</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.ID}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">제품 이름</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.Product.name || "알 수 없는 제품"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">제품 SKU</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.Product.sku || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">창고 이름</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.Warehouse.name || "알 수 없는 창고"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">창고 위치</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.Warehouse.location || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">현재 수량</dt>
                    <dd className="text-sm text-muted-foreground">{inventory.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">생성일</dt>
                    <dd className="text-sm text-muted-foreground">
                      <time dateTime={inventory.CreatedAt}>{formatDate(inventory.CreatedAt)}</time>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1">최종 수정일</dt>
                    <dd className="text-sm text-muted-foreground">
                      <time dateTime={inventory.UpdatedAt}>{formatDate(inventory.UpdatedAt)}</time>
                    </dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link to={`/inventory/${inventory.ID}/edit`}>
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    <span>정보 수정</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

export default InventoryDetail
