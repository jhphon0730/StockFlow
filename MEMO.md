### - [ ] Transaction ( with Inventory )
- in/out 시에 Inventory 수정하는 로직을 추가하여야 함

```
Transaction 모델에서 in, out, adjust의 의미
in: 입고 → 새 상품이 창고에 들어옴. inventory.quantity 값을 증가시켜야 함.

out: 출고 → 창고에서 상품이 빠져나감. inventory.quantity 값을 감소시켜야 함.

adjust: 조정 → 재고 조사나 오류 수정으로 수량을 변경. 기존 수량을 새로운 값으로 설정해야 함.
```
