테이블의 역할을 정리한 표입니다.

| 테이블 이름      | 역할 및 설명 |
|----------------|------------|
| **User** | 사용자 정보 저장 (관리자 및 창고 직원) |
| **Warehouse** | 각 창고의 정보 저장 (이름, 위치 등) |
| **Product** | 제품 정보 저장 (이름, 설명, SKU 등) |
| **Inventory** | 특정 창고의 제품 재고 관리 (창고별 제품 수량) |
| **Order** | 고객 주문 정보를 저장 (주문 상태 포함) |
| **OrderItem** | 주문 내 제품 리스트 저장 (제품 ID, 수량, 가격) |
| **Transaction** | 제품의 입출고 기록 저장 (입고, 출고, 조정) |

### 📌 테이블 간 관계 요약
- **User** → `Order` (1:N)  
- **Warehouse** → `Inventory` (1:N)  
- **Product** → `Inventory` & `OrderItem` (1:N)  
- **Inventory** → `Transaction` (1:N)  
- **Order** → `OrderItem` (1:N)  

