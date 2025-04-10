import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import { ArrowLeft, Package, Barcode, Calendar, Edit, Trash2, Plus, Warehouse } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

import type { Product } from "@/types/product"
import { GetProductById, DeleteProduct } from "@/lib/api/product"
import { formatDate } from "@/lib/utils"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchProductData(Number.parseInt(id))
  }, [id])

  const fetchProductData = async (productId: number) => {
    setIsLoading(true)
    try {
      const response = await GetProductById(productId)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "제품 정보 조회 실패",
          text: response.error,
        })
        navigate("/product")
        return
      }
      setProduct(response.data.product)
    } catch (error) {
      console.error("제품 정보 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "제품 정보 조회 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
      navigate("/product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!product) return

    setIsDeleting(true)
    try {
      const response = await DeleteProduct(product.ID)
      if (response.error) {
        Swal.fire({
          icon: "error",
          title: "제품 삭제 실패",
          text: response.error,
        })
        setIsDeleting(false)
        return
      }

      Swal.fire({
        icon: "success",
        title: "제품 삭제 성공",
        text: "제품이 성공적으로 삭제되었습니다.",
        timer: 1500,
      }).then(() => {
        navigate("/product")
      })
    } catch (error) {
      console.error("제품 삭제 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "제품 삭제 실패",
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

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">제품 정보를 찾을 수 없습니다</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">요청하신 제품 정보를 찾을 수 없습니다.</p>
        <Button>
          <Link to="/product">
            <ArrowLeft className="mr-2 h-4 w-4" />
            제품 목록으로 돌아가기
          </Link>
        </Button>
      </div>
    )
  }

  const hasInventory = product.Inventories && product.Inventories.length > 0
  const inventoryCount = hasInventory ? product.Inventories?.length : 0
  const totalItems = hasInventory ? product.Inventories?.reduce((sum, inv) => sum + inv.quantity, 0) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Link to="/product">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground flex items-center">
              <Barcode className="h-4 w-4 mr-1" />
              {product.sku}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/product/${product.ID}/edit`}>
              <Edit className="h-4 w-4" />
              편집
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>제품 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 제품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 재고 데이터가 함께
                  삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white cursor-pointer"
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
              <span>{formatDate(product.CreatedAt)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">보관 창고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Warehouse className="h-4 w-4 mr-2 text-muted-foreground" />
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
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{totalItems}개</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory" className="cursor-pointer">
            재고 목록
          </TabsTrigger>
          <TabsTrigger value="info" className="cursor-pointer">
            제품 정보
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>재고 목록</CardTitle>
                <CardDescription>이 제품이 보관된 모든 창고 목록입니다.</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/inventory/create?product_id=${product.ID}`}>
                  <Plus className="h-4 w-4" />
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
                        <TableHead className="text-center">창고명</TableHead>
                        <TableHead className="text-center">위치</TableHead>
                        <TableHead className="text-center">수량</TableHead>
                        <TableHead className="text-center">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.Inventories &&
                        product.Inventories.map((inventory) => (
                          <TableRow key={inventory.ID} className="text-center">
                            <TableCell>{inventory.Warehouse.name || "-"}</TableCell>
                            <TableCell>{inventory.Warehouse.location || "-"}</TableCell>
                            <TableCell>{inventory.quantity}</TableCell>
                            <TableCell>
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
                  <Warehouse className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">등록된 재고가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    이 제품의 재고가 없습니다. 새 재고를 추가해보세요.
                  </p>
                  <Button asChild>
                    <Link to={`/inventory/create?product_id=${product.ID}`}>
                      <Plus className="h-4 w-4" />
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
              <CardTitle>제품 정보</CardTitle>
              <CardDescription>제품의 상세 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">제품 이름</h3>
                <p className="text-sm text-muted-foreground">{product.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">SKU</h3>
                <p className="text-sm text-muted-foreground">{product.sku}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">설명</h3>
                <p className="text-sm text-muted-foreground">{product.description || "설명 없음"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">생성일</h3>
                <p className="text-sm text-muted-foreground">{formatDate(product.CreatedAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">최종 수정일</h3>
                <p className="text-sm text-muted-foreground">{formatDate(product.UpdatedAt)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link to={`/product/${product.ID}/edit`}>
                  <Edit className="h-4 w-4" />
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

export default ProductDetail
