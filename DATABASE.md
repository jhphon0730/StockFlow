테이블의 역할을 정리한 표입니다.

| 테이블      | 역할 및 설명                                  | 관계                          |
|------------|----------------------------------|-----------------------------|
| User       | 관리자 및 창고 직원의 정보를 저장              | -                           |
| Warehouse  | 창고 정보(이름, 위치 등)를 저장               | 1:N → Inventory            |
| Product    | 제품 정보(이름, 설명, SKU)를 저장            | 1:N → Inventory            |
| Inventory  | 특정 창고의 제품 재고 수량을 관리            | N:1 → Warehouse, N:1 → Product, 1:N → Transaction |
| Transaction | 입고, 출고, 재고 조정과 같은 재고 변동 이벤트를 기록 | N:1 → Inventory            |


### 📌 테이블 간 관계 요약
- **User** → `Order` (1:N)  
- **Warehouse** → `Inventory` (1:N)  
- **Product** → `Inventory` & `OrderItem` (1:N)  
- **Inventory** → `Transaction` (1:N)  
- **Order** → `OrderItem` (1:N)  

### 🛠 전체적인 사용 흐름
💡 사용자는 주로 다음과 같은 흐름으로 창고를 관리함
- 관리자(Admin) 또는 직원(Staff) 으로 로그인
- 창고(Warehouse) 생성 (관리자가 수행)
- 제품(Product) 등록
- 창고에 제품을 추가 → 재고(Inventory) 생성
- 제품의 입고/출고 → 재고 이동(Transaction) 생성
- 재고 및 제품 목록 조회
- 필요 시 재고 조정(Inventory 조정)

### 📌 예시: 창고에 재고가 쌓이는 과정
```
1️⃣ 창고(Warehouse) 생성

관리자(Admin)가 창고를 새롭게 등록
(예: 서울 물류창고, 부산 물류창고)
2️⃣ 제품(Product) 등록

관리자가 관리할 제품을 등록
(예: 삼성 SSD 1TB, LG TV 50인치)
3️⃣ 재고(Inventory) 추가

특정 창고에 특정 제품을 추가 (즉, Inventory 테이블에 데이터가 생성됨)
예를 들어:
서울 물류창고에 삼성 SSD 1TB → 50개 보관
부산 물류창고에 LG TV 50인치 → 20개 보관
즉, Inventory는 "창고 - 제품 - 수량"을 연결하는 테이블
4️⃣ 입고/출고(Transaction) 처리

물류 센터에서 제품이 들어오거나 나갈 때 Transaction을 생성하고, Inventory 수량을 변경
예:
삼성 SSD 1TB 10개 추가 입고 (Inventory +10, Transaction 기록됨)
LG TV 50인치 5개 출고 (Inventory -5, Transaction 기록됨)
```

### 📌 실사용 흐름 예제
```
💼 예제 시나리오: "직원이 재고를 관리하는 과정"

1️⃣ 로그인
사용자가 이메일 & 비밀번호 입력 후 로그인
JWT를 받아서 API 호출 시 사용

2️⃣ 창고 생성 (Warehouse)
관리자(Admin)만 창고를 생성할 수 있음
예: 서울 물류창고 (Warehouse ID = 1), 부산 물류창고 (Warehouse ID = 2)

3️⃣ 제품 등록 (Product)
관리자(Admin)가 시스템에 제품 등록
예:
Product ID = 1 → 삼성 SSD 1TB
Product ID = 2 → LG TV 50인치

4️⃣ 특정 창고에 제품을 추가 (Inventory 생성)
관리자가 제품을 창고에 추가 → Inventory 테이블에 새로운 데이터 생성됨
예:
서울 물류창고(Warehouse ID=1)에 삼성 SSD 1TB(Product ID=1) 50개 추가
부산 물류창고(Warehouse ID=2)에 LG TV 50인치(Product ID=2) 20개 추가
{
  "warehouse_id": 1,
  "product_id": 1,
  "quantity": 50
}

5️⃣ 입고/출고 처리 (Transaction & Inventory 변경)
✅ 입고(제품이 창고에 들어올 때)
창고 직원이 "삼성 SSD 1TB 10개 입고" 라고 시스템에 입력

Transaction 테이블에 기록되고, Inventory 수량이 증가
{
  "inventory_id": 1,
  "type": "in",
  "quantity": 10
}
Inventory 테이블에서 quantity 값이 50 → 60으로 변경
Transaction 테이블에 "삼성 SSD 1TB 10개 입고" 기록됨

❌ 출고(제품이 창고에서 나갈 때)
창고 직원이 "LG TV 50인치 5개 출고" 입력

Transaction 테이블에 기록되고, Inventory 수량이 감소
{
  "inventory_id": 2,
  "type": "out",
  "quantity": 5
}
Inventory 테이블에서 quantity 값이 20 → 15로 변경
Transaction 테이블에 "LG TV 50인치 5개 출고" 기록됨

6️⃣ 재고 조회
창고 직원이 현재 각 창고에 있는 제품 재고를 조회
예: 서울 물류창고의 재고 조회 API를 호출하면
[
  {
    "product_name": "삼성 SSD 1TB",
    "quantity": 60
  }
]
직원이 출고 요청을 넣기 전에 현재 창고의 재고가 충분한지 확인 가능
```
