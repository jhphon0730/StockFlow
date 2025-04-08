import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { MapPin, Package, Plus, Search, X, Filter } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingCard } from "@/components/ui/loading"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import type { Warehouse as WarehouseType } from "@/types/warehouse"
import { GetAllWarehouses } from "@/lib/api/warehouse"

const Warehouses = () => {
	// 검색 된 창고 데이터 목록
  const [warehouses, setWarehouses] = useState<WarehouseType[] | null>(null)
	// 검색 필터 쿼리 파라미터
  const [searchName, setSearchName] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
	// 로딩 상태
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
	// 모달 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
	// 모달에서 입력하는 데이터
  const [tempSearchName, setTempSearchName] = useState("")
  const [tempSearchLocation, setTempSearchLocation] = useState("")
  
  const searchParams = useSearchParams()[0]
  const navigate = useNavigate()
  
  // Get query parameters on initial load
  useEffect(() => {
    const nameParam = searchParams.get("name")
    const locationParam = searchParams.get("location")
    
    if (nameParam) {
      setSearchName(nameParam)
      setTempSearchName(nameParam)
    }
    if (locationParam) {
      setSearchLocation(locationParam)
      setTempSearchLocation(locationParam)
    }
    
    getWarehousesHandler({
      name: nameParam || undefined,
      location: locationParam || undefined
    })
  }, [searchParams])

  const getWarehousesHandler = async (params?: { name?: string; location?: string }) => {
    setIsLoading(true)
    try {
      const res = await GetAllWarehouses(params)
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
      setIsSearching(false)
    }
  }
  
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    
    // Update actual search values from temp values
    setSearchName(tempSearchName)
    setSearchLocation(tempSearchLocation)
    
    // Build query parameters
    const params = new URLSearchParams()
    if (tempSearchName) params.set("name", tempSearchName)
    if (tempSearchLocation) params.set("location", tempSearchLocation)
    
    // Update URL with search parameters
    navigate(`/warehouse?${params.toString()}`)
    
    // Fetch warehouses with search parameters
    getWarehousesHandler({
      name: tempSearchName || undefined,
      location: tempSearchLocation || undefined
    })
    
    // Close the modal
    setIsSearchModalOpen(false)
  }
  
  const clearSearch = () => {
    setSearchName("")
    setSearchLocation("")
    setTempSearchName("")
    setTempSearchLocation("")
    navigate("/warehouse")
    getWarehousesHandler()
    setIsSearchModalOpen(false)
  }
  
  const openSearchModal = () => {
    // Initialize temp values with current search values
    setTempSearchName(searchName)
    setTempSearchLocation(searchLocation)
    setIsSearchModalOpen(true)
  }
  
  const hasSearchFilters = searchName || searchLocation

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">창고</h1>
        <p className="text-muted-foreground">모든 창고를 관리하고 새 창고를 추가하세요.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openSearchModal}>
            <Filter className="h-4 w-4" />
            검색 필터
          </Button>
          
          {hasSearchFilters && (
            <div className="flex items-center text-sm text-muted-foreground ml-2">
              <span className="font-medium">필터:</span>{' '}
              {searchName && <span>이름: {searchName}</span>}
              {searchName && searchLocation && <span> / </span>}
              {searchLocation && <span>위치: {searchLocation}</span>}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-1" 
                onClick={clearSearch}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">필터 초기화</span>
              </Button>
            </div>
          )}
        </div>
        
        <Button>
          <Plus className="h-4 w-4" />
					<Link to="/warehouse/create">
						새 창고 추가
					</Link>
        </Button>
      </div>
      
      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>창고 검색</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">창고 이름</Label>
                <Input
                  id="modal-name"
                  placeholder="창고 이름으로 검색"
                  value={tempSearchName}
                  onChange={(e) => setTempSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-location">위치</Label>
                <Input
                  id="modal-location"
                  placeholder="위치로 검색"
                  value={tempSearchLocation}
                  onChange={(e) => setTempSearchLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearSearch}
              >
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
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
                      <Link to={`/warehouse/${warehouse.ID}`}>상세 정보</Link>
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
          <h3 className="text-lg font-medium mb-2">
            {hasSearchFilters ? "검색 결과가 없습니다" : "등록된 창고가 없습니다"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {hasSearchFilters
              ? "다른 검색어로 다시 시도하거나 모든 창고를 확인하세요."
              : "새 창고를 추가하여 재고를 관리해보세요."}
          </p>
          {hasSearchFilters ? (
            <Button variant="outline" onClick={clearSearch}>
              <X className="h-4 w-4" />
              필터 초기화
            </Button>
          ) : (
            <Button>
              <Plus className="h-4 w-4" />
							<Link to="/warehouse/create">
								새 창고 추가
							</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default Warehouses

