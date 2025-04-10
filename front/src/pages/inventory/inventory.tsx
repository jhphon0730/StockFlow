import type React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Package, Plus, Search, X, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LoadingTable } from "@/components/ui/loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import type { Inventory,  } from "@/types/inventory"
import { GetAllInventories } from "@/lib/api/inventory"
import { GetAllWarehouses } from "@/lib/api/warehouse"
import { GetAllProducts } from "@/lib/api/product"
import type { Warehouse as WarehouseType } from "@/types/warehouse"
import type { Product } from "@/types/product"

const Inventory = () => {
  // 검색 된 재고 데이터 목록
  const [inventories, setInventories] = useState<Inventory[] | null>(null)
  // 창고 및 제품 목록 (검색 필터용)
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  // 검색 필터 쿼리 파라미터
  const [searchWarehouseId, setSearchWarehouseId] = useState<number | undefined>(undefined)
  const [searchProductId, setSearchProductId] = useState<number | undefined>(undefined)
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  // 모달 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  // 모달에서 입력하는 데이터
  const [tempSearchWarehouseId, setTempSearchWarehouseId] = useState<number | undefined>(undefined)
  const [tempSearchProductId, setTempSearchProductId] = useState<number | undefined>(undefined)

  const searchParams = useSearchParams()[0]
  const navigate = useNavigate()

  // Get query parameters on initial load
  useEffect(() => {
    const warehouseIdParam = searchParams.get("warehouse_id")
    const productIdParam = searchParams.get("product_id")

    if (warehouseIdParam) {
      const warehouseId = Number.parseInt(warehouseIdParam, 10)
      setSearchWarehouseId(warehouseId)
      setTempSearchWarehouseId(warehouseId)
    }
    if (productIdParam) {
      const productId = Number.parseInt(productIdParam, 10)
      setSearchProductId(productId)
      setTempSearchProductId(productId)
    }

    getInventoriesHandler({
      warehouse_id: warehouseIdParam ? Number.parseInt(warehouseIdParam, 10) : undefined,
      product_id: productIdParam ? Number.parseInt(productIdParam, 10) : undefined,
    })

    // 창고 및 제품 목록 가져오기 (검색 필터용)
    fetchFilterOptions()
  }, [searchParams])

  const fetchFilterOptions = async () => {
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
      console.error("필터 옵션 로딩 중 오류 발생:", error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const getInventoriesHandler = async (params?: { warehouse_id?: number; product_id?: number }) => {
    setIsLoading(true)
    try {
      const res = await GetAllInventories(params)
      if (res.error) {
        Swal.fire({
          icon: "error",
          title: "재고 목록 조회 실패",
          text: res.error,
        })
        return
      }

      if (res.data) {
        setInventories(res.data.inventories)
      }
    } catch (error) {
      console.error("재고 목록 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 목록 조회 실패",
        text: "서버와의 통신 중 오류가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSearching(true)

    // Update actual search values from temp values
    setSearchWarehouseId(tempSearchWarehouseId)
    setSearchProductId(tempSearchProductId)

    // Build query parameters
    const params = new URLSearchParams()
    if (tempSearchWarehouseId) params.set("warehouse_id", tempSearchWarehouseId.toString())
    if (tempSearchProductId) params.set("product_id", tempSearchProductId.toString())

    // Update URL with search parameters
    navigate(`/inventory?${params.toString()}`)

    // Fetch inventories with search parameters
    getInventoriesHandler({
      warehouse_id: tempSearchWarehouseId,
      product_id: tempSearchProductId,
    })

    // Close the modal
    setIsSearchModalOpen(false)
  }

  const clearSearch = () => {
    setSearchWarehouseId(undefined)
    setSearchProductId(undefined)
    setTempSearchWarehouseId(undefined)
    setTempSearchProductId(undefined)
    navigate("/inventory")
    getInventoriesHandler()
    setIsSearchModalOpen(false)
  }

  const openSearchModal = () => {
    // Initialize temp values with current search values
    setTempSearchWarehouseId(searchWarehouseId)
    setTempSearchProductId(searchProductId)
    setIsSearchModalOpen(true)
  }

  const hasSearchFilters = searchWarehouseId !== undefined || searchProductId !== undefined

  // 창고 이름 가져오기
  const getWarehouseName = (warehouseId?: number) => {
    if (!warehouseId) return "알 수 없음"
    const warehouse = warehouses.find((w) => w.ID === warehouseId)
    return warehouse ? warehouse.name : "알 수 없음"
  }

  // 제품 이름 가져오기
  const getProductName = (productId?: number) => {
    if (!productId) return "알 수 없음"
    const product = products.find((p) => p.ID === productId)
    return product ? product.name : "알 수 없음"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">재고 관리</h1>
        <p className="text-muted-foreground">모든 재고를 관리하고 새 재고를 추가하세요.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openSearchModal} className="cursor-pointer">
            <Filter className="h-4 w-4" />
            검색 필터
          </Button>

          {hasSearchFilters && (
            <div className="flex items-center text-sm text-muted-foreground ml-2">
              <span className="font-medium">필터:</span>{" "}
              {searchWarehouseId !== undefined && <span>창고: {getWarehouseName(searchWarehouseId)}</span>}
              {searchWarehouseId !== undefined && searchProductId !== undefined && <span> / </span>}
              {searchProductId !== undefined && <span>제품: {getProductName(searchProductId)}</span>}
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={clearSearch}>
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">필터 초기화</span>
              </Button>
            </div>
          )}
        </div>

        <Button asChild>
          <Link to="/inventory/create">
            <Plus className="h-4 w-4" />새 재고 추가
          </Link>
        </Button>
      </div>

      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>재고 검색</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="modal-warehouse">창고</Label>
                <select
                  id="modal-warehouse"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={tempSearchWarehouseId || ""}
                  onChange={(e) =>
                    setTempSearchWarehouseId(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                  }
                  disabled={isLoadingOptions}
                >
                  <option value="">모든 창고</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.ID} value={warehouse.ID}>
                      {warehouse.name} ({warehouse.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-product">제품</Label>
                <select
                  id="modal-product"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={tempSearchProductId || ""}
                  onChange={(e) =>
                    setTempSearchProductId(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                  }
                  disabled={isLoadingOptions}
                >
                  <option value="">모든 제품</option>
                  {products.map((product) => (
                    <option key={product.ID} value={product.ID}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" />
                필터 초기화
              </Button>
              <Button type="submit" disabled={isSearching}>
                <Search className="h-4 w-4" />
                {isSearching ? "검색 중..." : "검색"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <LoadingTable rows={5} columns={4} />
      ) : inventories && inventories.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>재고 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">제품</TableHead>
                  <TableHead className="text-center">SKU</TableHead>
                  <TableHead className="text-center">창고</TableHead>
                  <TableHead className="text-center">수량</TableHead>
                  <TableHead className="text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventories.map((inventory) => (
                  <TableRow key={inventory.ID} className="text-center">
                    <TableCell>{inventory.Product?.name || "알 수 없음"}</TableCell>
                    <TableCell>{inventory.Product?.sku || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col justify-center items-center">
                        <span>{inventory.Warehouse?.name || "알 수 없음"}</span>
                        <span className="text-xs text-muted-foreground">{inventory.Warehouse?.location || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inventory.quantity > 0 ? "outline" : "destructive"}>{inventory.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/inventory/${inventory.ID}`}>상세</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/inventory/${inventory.ID}/edit`}>수정</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasSearchFilters ? "검색 결과가 없습니다" : "등록된 재고가 없습니다"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {hasSearchFilters
              ? "다른 검색 조건으로 다시 시도하거나 모든 재고를 확인하세요."
              : "새 재고를 추가하여 재고를 관리해보세요."}
          </p>
          {hasSearchFilters ? (
            <Button variant="outline" onClick={clearSearch}>
              <X className="h-4 w-4" />
              필터 초기화
            </Button>
          ) : (
            <Button asChild>
              <Link to="/inventory/create">
                <Plus className="h-4 w-4" />새 재고 추가
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default Inventory
