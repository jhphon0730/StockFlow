import type React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { Package, Barcode, Plus, Search, X, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingCard } from "@/components/ui/loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

import type { Product } from "@/types/product"
import { GetAllProducts } from "@/lib/api/product"
import { useWebSocketStore } from "@/store/useWebSocketStore"

const Products = () => {
  // 검색 된 제품 데이터 목록
  const [products, setProducts] = useState<Product[] | null>(null)
  // 검색 필터 쿼리 파라미터
  const [searchName, setSearchName] = useState("")
  const [searchSku, setSearchSku] = useState("")
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  // 모달 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  // 모달에서 입력하는 데이터
  const [tempSearchName, setTempSearchName] = useState("")
  const [tempSearchSku, setTempSearchSku] = useState("")

  const searchParams = useSearchParams()[0]
  const navigate = useNavigate()
	const { message } = useWebSocketStore()

	useEffect(() => {
		if (!message) {
			return
		}

		toast.info("제품 목록이 업데이트되었습니다.", {
			position: "top-right",
			autoClose: 2000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: false,
		})

		getProductWithQuery()
	}, [message])

  // Get query parameters on initial load
  useEffect(() => {
		getProductWithQuery()
  }, [searchParams])

	const getProductWithQuery = () => {
    const nameParam = searchParams.get("name")
    const skuParam = searchParams.get("sku")

    if (nameParam) {
      setSearchName(nameParam)
      setTempSearchName(nameParam)
    }
    if (skuParam) {
      setSearchSku(skuParam)
      setTempSearchSku(skuParam)
    }

    getProductsHandler({
      name: nameParam || undefined,
      sku: skuParam || undefined,
    })
	}

  const getProductsHandler = async (params?: { name?: string; sku?: string }) => {
    setIsLoading(true)
    try {
      const res = await GetAllProducts(params)
      if (res.error) {
        Swal.fire({
          icon: "error",
          title: "제품 목록 조회 실패",
          text: res.error,
        })
        return
      }

      if (res.data) {
        setProducts(res.data.products)
      }
    } catch (error) {
      console.error("제품 목록 조회 중 오류 발생:", error)
      Swal.fire({
        icon: "error",
        title: "제품 목록 조회 실패",
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
    setSearchName(tempSearchName)
    setSearchSku(tempSearchSku)

    // Build query parameters
    const params = new URLSearchParams()
    if (tempSearchName) params.set("name", tempSearchName)
    if (tempSearchSku) params.set("sku", tempSearchSku)

    // Update URL with search parameters
    navigate(`/product?${params.toString()}`)

    // Fetch products with search parameters
    getProductsHandler({
      name: tempSearchName || undefined,
      sku: tempSearchSku || undefined,
    })

    // Close the modal
    setIsSearchModalOpen(false)
  }

  const clearSearch = () => {
    setSearchName("")
    setSearchSku("")
    setTempSearchName("")
    setTempSearchSku("")
    navigate("/product")
    getProductsHandler()
    setIsSearchModalOpen(false)
  }

  const openSearchModal = () => {
    // Initialize temp values with current search values
    setTempSearchName(searchName)
    setTempSearchSku(searchSku)
    setIsSearchModalOpen(true)
  }

  const hasSearchFilters = searchName || searchSku

  // Calculate total inventory for each product
  const getProductTotalInventory = (product: Product) => {
    if (!product.Inventories || product.Inventories.length === 0) return 0
    return product.Inventories.reduce((total, inventory) => total + inventory.quantity, 0)
  }

  // Get inventory locations for each product
  const getProductLocations = (product: Product) => {
    if (!product.Inventories || product.Inventories.length === 0) return []
    return [...new Set(product.Inventories.map((inv) => inv.Warehouse?.name).filter(Boolean))]
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 id="products-title" className="text-3xl font-bold tracking-tight">
          제품
        </h1>
        <p className="text-muted-foreground">모든 제품을 관리하고 새 제품을 추가하세요.</p>
      </header>

      <nav className="flex justify-between items-center" aria-label="제품 필터 및 작업">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openSearchModal} className="cursor-pointer">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>검색 필터</span>
          </Button>

          {hasSearchFilters && (
            <div className="flex items-center text-sm text-muted-foreground ml-2" aria-live="polite">
              <span className="font-medium">필터:</span>{" "}
              {searchName && (
                <span>
                  이름: <mark className="bg-transparent font-medium">{searchName}</mark>
                </span>
              )}
              {searchName && searchSku && <span> / </span>}
              {searchSku && (
                <span>
                  SKU: <mark className="bg-transparent font-medium">{searchSku}</mark>
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

        <Button asChild>
          <Link to="/product/create">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>새 제품 추가</span>
          </Link>
        </Button>
      </nav>

      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>제품 검색</DialogTitle>
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
                <Label htmlFor="modal-name">제품 이름</Label>
                <Input
                  id="modal-name"
                  placeholder="제품 이름으로 검색"
                  value={tempSearchName}
                  onChange={(e) => setTempSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-sku">SKU</Label>
                <Input
                  id="modal-sku"
                  placeholder="SKU로 검색"
                  value={tempSearchSku}
                  onChange={(e) => setTempSearchSku(e.target.value)}
                />
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

      <section aria-labelledby="products-title">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="제품 목록 로딩 중">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0" aria-label="제품 목록">
            {products.map((product) => {
              const totalInventory = getProductTotalInventory(product)
              const locations = getProductLocations(product)

              return (
                <li key={product.ID}>
                  <article className="h-full">
                    <Card className="overflow-hidden transition-all hover:shadow-md h-full">
                      <CardHeader className="pb-2">
                        <CardTitle>{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid gap-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <dt className="sr-only">SKU</dt>
                            <dd className="flex items-center">
                              <Barcode className="mr-1 h-4 w-4" aria-hidden="true" />
                              {product.sku || "SKU 없음"}
                            </dd>
                          </div>
                          <div className="flex items-center text-sm">
                            <dt className="sr-only">총 재고</dt>
                            <dd className="flex items-center">
                              <Package className="mr-1 h-4 w-4" aria-hidden="true" />
                              <span className="font-medium">{totalInventory}</span>
                              <span className="ml-1 text-muted-foreground">총 재고</span>
                            </dd>
                          </div>
                          {locations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <dt className="sr-only">보관 위치</dt>
                              <dd className="flex flex-wrap gap-1 w-full">
                                {locations.map((location, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {location}
                                  </Badge>
                                ))}
                              </dd>
                            </div>
                          )}
                          <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            <dt className="sr-only">설명</dt>
                            <dd>{product.description || "설명 없음"}</dd>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/product/${product.ID}`}>
                                <span>상세 정보</span>
                              </Link>
                            </Button>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10"
            role="status"
            aria-live="polite"
          >
            <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium mb-2">
              {hasSearchFilters ? "검색 결과가 없습니다" : "등록된 제품이 없습니다"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {hasSearchFilters
                ? "다른 검색어로 다시 시도하거나 모든 제품을 확인하세요."
                : "새 제품을 추가하여 재고를 관리해보세요."}
            </p>
            {hasSearchFilters ? (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" aria-hidden="true" />
                <span>필터 초기화</span>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/product/create">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>새 제품 추가</span>
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>

      <footer className="mt-4 text-sm text-muted-foreground">
        <p>총 {products?.length || 0}개의 제품이 있습니다.</p>
        <time dateTime={new Date().toISOString()}>마지막 업데이트: {new Date().toLocaleString()}</time>
      </footer>
    </div>
  )
}

export default Products
