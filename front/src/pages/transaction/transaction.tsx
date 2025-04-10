import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Package, ArrowUpRight, ArrowDownRight, BarChart3, Search, X, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LoadingTable } from "@/components/ui/loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import type { Transaction, TransactionType } from "@/types/transaction"
import { GetAllTransactions } from "@/lib/api/transaction"
import { GetAllInventories } from "@/lib/api/inventory"
import type { Inventory } from "@/types/inventory"
import { formatDate } from "@/lib/utils"

const Transactions = () => {
  // 검색 된 재고 내역 데이터 목록
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  // 재고 목록 (검색 필터용)
  const [inventories, setInventories] = useState<Inventory[]>([])
  // 검색 필터 쿼리 파라미터
  const [searchInventoryId, setSearchInventoryId] = useState<number | undefined>(undefined)
  const [searchType, setSearchType] = useState<TransactionType | undefined>(undefined)
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  // 모달 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  // 모달에서 입력하는 데이터
  const [tempSearchInventoryId, setTempSearchInventoryId] = useState<number | undefined>(undefined)
  const [tempSearchType, setTempSearchType] = useState<TransactionType | undefined>(undefined)

  const searchParams = useSearchParams()[0]
  const navigate = useNavigate()

  // Get query parameters on initial load
  useEffect(() => {
    const inventoryIdParam = searchParams.get("inventory_id")
    const typeParam = searchParams.get("type") as TransactionType | null

    if (inventoryIdParam) {
      const inventoryId = Number.parseInt(inventoryIdParam, 10)
      setSearchInventoryId(inventoryId)
      setTempSearchInventoryId(inventoryId)
    }
    if (typeParam) {
      setSearchType(typeParam)
      setTempSearchType(typeParam)
    }

    getTransactionsHandler({
      inventory_id: inventoryIdParam ? Number.parseInt(inventoryIdParam, 10) : undefined,
      type: typeParam || undefined,
    })

    // 재고 목록 가져오기 (검색 필터용)
    fetchFilterOptions()
  }, [searchParams])

  const fetchFilterOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const inventoriesRes = await GetAllInventories()

      if (inventoriesRes.data) {
        setInventories(inventoriesRes.data.inventories)
      }
    } catch (error) {
      console.error("필터 옵션 로딩 중 오류 발생:", error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const getTransactionsHandler = async (params?: { inventory_id?: number; type?: TransactionType }) => {
    setIsLoading(true)
    try {
      const res = await GetAllTransactions(params)
      if (res.error) {
        Swal.fire({
          icon: "error",
          title: "재고내역 목록 조회 실패",
          text: res.error,
        })
        return
      }

      if (res.data) {
        setTransactions(res.data.transactions)
      }
    } catch (error) {
      console.error("재고 내역 목록 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "재고 내역 목록 조회 실패",
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
    setSearchInventoryId(tempSearchInventoryId)
    setSearchType(tempSearchType)

    // Build query parameters
    const params = new URLSearchParams()
    if (tempSearchInventoryId) params.set("inventory_id", tempSearchInventoryId.toString())
    if (tempSearchType) params.set("type", tempSearchType)

    // Update URL with search parameters
    navigate(`/transaction?${params.toString()}`)

    // Fetch transactions with search parameters
    getTransactionsHandler({
      inventory_id: tempSearchInventoryId,
      type: tempSearchType,
    })

    // Close the modal
    setIsSearchModalOpen(false)
  }

  const clearSearch = () => {
    setSearchInventoryId(undefined)
    setSearchType(undefined)
    setTempSearchInventoryId(undefined)
    setTempSearchType(undefined)
    navigate("/transaction")
    getTransactionsHandler()
    setIsSearchModalOpen(false)
  }

  const openSearchModal = () => {
    // Initialize temp values with current search values
    setTempSearchInventoryId(searchInventoryId)
    setTempSearchType(searchType)
    setIsSearchModalOpen(true)
  }

  const hasSearchFilters = searchInventoryId !== undefined || searchType !== undefined

  // 재고 정보 가져오기
  const getInventoryInfo = (inventoryId?: number) => {
    if (!inventoryId) return { productName: "알 수 없음", warehouseName: "알 수 없음" }
    const inventory = inventories.find((inv) => inv.ID === inventoryId)
    return {
      productName: inventory?.Product?.name || "알 수 없음",
      warehouseName: inventory?.Warehouse?.name || "알 수 없음",
    }
  }

  // 재고 내역 타입에 따른 아이콘 및 색상
  const getTypeInfo = (type: TransactionType) => {
    switch (type) {
      case "IN":
        return {
          icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
          label: "입고",
          variant: "secondary" as const,
        }
      case "OUT":
        return {
          icon: <ArrowDownRight className="h-4 w-4 text-blue-500" />,
          label: "출고",
          variant: "default" as const,
        }
      case "ADJUST":
        return { icon: <BarChart3 className="h-4 w-4 text-amber-500" />, label: "조정", variant: "outline" as const }
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 id="transaction-title" className="text-3xl font-bold tracking-tight">
          재고 내역
        </h1>
        <p className="text-muted-foreground">모든 재고 내역을 조회하고 관리하세요.</p>
      </header>

      <nav className="flex justify-between items-center" aria-label="재고 내역 필터 및 작업">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openSearchModal} className="cursor-pointer">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>검색 필터</span>
          </Button>

          {hasSearchFilters && (
            <div className="flex items-center text-sm text-muted-foreground ml-2" aria-live="polite">
              <span className="font-medium">필터:</span>{" "}
              {searchInventoryId !== undefined && (
                <span>
                  제품:{" "}
                  <mark className="bg-transparent font-medium">{getInventoryInfo(searchInventoryId).productName}</mark>
                </span>
              )}
              {searchInventoryId !== undefined && searchType !== undefined && <span> / </span>}
              {searchType !== undefined && (
                <span>
                  유형: <mark className="bg-transparent font-medium">{getTypeInfo(searchType).label}</mark>
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1"
                onClick={clearSearch}
                aria-label="필터 초기화"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">필터 초기화</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>재고 내역 검색</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
          >
            <fieldset className="grid gap-4 py-4">
              <legend className="sr-only">검색 조건</legend>
              <div className="space-y-2">
                <Label htmlFor="modal-inventory">재고</Label>
                <select
                  id="modal-inventory"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={tempSearchInventoryId || ""}
                  onChange={(e) =>
                    setTempSearchInventoryId(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                  }
                  disabled={isLoadingOptions}
                  aria-busy={isLoadingOptions}
                >
                  <option value="">모든 재고</option>
                  {inventories.map((inventory) => (
                    <option key={inventory.ID} value={inventory.ID}>
                      {inventory.Product?.name || "알 수 없음"} - {inventory.Warehouse?.name || "알 수 없음"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-type">유형</Label>
                <select
                  id="modal-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={tempSearchType || ""}
                  onChange={(e) => setTempSearchType((e.target.value as TransactionType) || undefined)}
                >
                  <option value="">모든 유형</option>
                  <option value="IN">입고</option>
                  <option value="OUT">출고</option>
                  <option value="ADJUST">조정</option>
                </select>
              </div>
            </fieldset>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" aria-hidden="true" />
                <span>필터 초기화</span>
              </Button>
              <Button type="submit" disabled={isSearching}>
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>{isSearching ? "검색 중..." : "검색"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <section aria-labelledby="transaction-title">
        {isLoading ? (
          <div aria-busy="true" aria-label="재고 내역 목록 로딩 중">
            <LoadingTable rows={5} columns={5} />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>재고 내역 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table aria-label="재고 내역 목록 테이블">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">유형</TableHead>
                      <TableHead className="text-center">제품</TableHead>
                      <TableHead className="text-center">창고</TableHead>
                      <TableHead className="text-center">수량</TableHead>
                      <TableHead className="text-center">날짜</TableHead>
                      <TableHead className="text-center">메모</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const typeInfo = getTypeInfo(transaction.type)
                      const inventoryInfo = transaction.Inventory
                        ? {
                            productName: transaction.Inventory.Product?.name || "알 수 없음",
                            warehouseName: transaction.Inventory.Warehouse?.name || "알 수 없음",
                          }
                        : getInventoryInfo(transaction.inventory_id)

                      return (
                        <TableRow key={transaction.ID} className="text-center">
                          <TableCell>
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.icon}
                              <span className="ml-1">{typeInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{inventoryInfo.productName}</TableCell>
                          <TableCell>{inventoryInfo.warehouseName}</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {transaction.type === "IN" ? "+" : transaction.type === "OUT" ? "-" : ""}
                              {Math.abs(transaction.quantity)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <time dateTime={transaction.timestamp}>{formatDate(transaction.timestamp)}</time>
                          </TableCell>
                          <TableCell>{transaction.note || "-"}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10"
            role="status"
            aria-live="polite"
          >
            <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium mb-2">
              {hasSearchFilters ? "검색 결과가 없습니다" : "등록된 재고 내역이 없습니다"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {hasSearchFilters
                ? "다른 검색 조건으로 다시 시도하거나 모든 재고 내역을 확인하세요."
                : "재고 내역이 없습니다. 재고 상세 페이지에서 재고 내역을 추가해보세요."}
            </p>
            {hasSearchFilters && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" aria-hidden="true" />
                <span>필터 초기화</span>
              </Button>
            )}
          </div>
        )}
      </section>

      <footer className="mt-4 text-sm text-muted-foreground">
        <p>총 {transactions?.length || 0}개의 재고 내역이 있습니다.</p>
      </footer>
    </main>
  )
}

export default Transactions
