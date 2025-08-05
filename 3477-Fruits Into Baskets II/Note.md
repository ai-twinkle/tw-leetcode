# 3477. Fruits Into Baskets II

You are given two arrays of integers, `fruits` and `baskets`, each of length `n`, 
where `fruits[i]` represents the quantity of the $i^{th}$ type of fruit, and `baskets[j]` represents the capacity of the $j^{th}$ basket.

From left to right, place the fruits according to these rules:

- Each fruit type must be placed in the leftmost available basket with a capacity greater than or equal to the quantity of that fruit type.
- Each basket can hold only one type of fruit.
- If a fruit type cannot be placed in any basket, it remains unplaced.

Return the number of fruit types that remain unplaced after all possible allocations are made.

**Constraints:**

- `n == fruits.length == baskets.length`
- `1 <= n <= 100`
- `1 <= fruits[i], baskets[i] <= 1000`

## 基礎思路

本題的核心在於從左至右依序嘗試將每一種水果放入最靠左且容量足夠的籃子中。
由於每個籃子僅能放入一種水果，且每個水果也僅能選擇一個籃子，因此我們可以透過以下方式解決問題：

- 對於每個水果，從最左邊的籃子開始尋找。
- 一旦找到容量足夠且未被使用的籃子，即放入該水果，並標記籃子已被使用。
- 若掃描完所有籃子仍未找到合適者，則此水果無法被放置，記錄下來。
- 最終統計無法被放置的水果數量作為答案。

## 解題步驟

### Step 1：初始化輔助變數及資料結構

首先需初始化輔助變數與資料結構，用以儲存籃子使用狀態及無法放置的水果數量：

- `numberOfBaskets`：儲存籃子的總數量。
- `basketCapacities`：複製原始籃子容量資料，便於標記已使用籃子。
- `numberOfUnplacedFruits`：用來記錄無法放置的水果。


```typescript
// 使用 TypedArray 加快後續籃子容量檢查的效能
const numberOfBaskets = baskets.length;
const basketCapacities = new Uint16Array(baskets);
let numberOfUnplacedFruits = 0; // 記錄無法放置的水果數量
```
### Step 2：逐一檢查每個水果的放置情況

依序處理每個水果，嘗試從左至右找到合適的籃子：

- 外層迴圈遍歷每個水果類型。
- 內層迴圈從最左側籃子開始，尋找第一個容量足夠且未使用的籃子。
- 若找到合適籃子即標記使用，否則記錄無法放置。

```typescript
for (let fruitIndex = 0; fruitIndex < fruits.length; fruitIndex++) {
  const fruitQuantity = fruits[fruitIndex]; // 取得當前水果的數量
  let fruitPlaced = false; // 標記該水果是否成功放置

  // 從左至右尋找可放置此水果的籃子
  for (let basketIndex = 0; basketIndex < numberOfBaskets; basketIndex++) {
    if (basketCapacities[basketIndex] >= fruitQuantity) {
      basketCapacities[basketIndex] = 0; // 標記此籃子已被使用
      fruitPlaced = true; // 水果成功放置
      break; // 找到即離開內層迴圈
    }
  }

  // 若無法放置此水果，增加無法放置的計數
  if (!fruitPlaced) {
    numberOfUnplacedFruits += 1;
  }
}
```

### Step 3：回傳無法放置的水果數量

迴圈結束後，回傳結果：

```typescript
return numberOfUnplacedFruits;
```

## 時間複雜度

- 外層迴圈需遍歷 $n$ 種水果，內層迴圈在最差情況下須遍歷 $n$ 個籃子，因此最壞情況下需要 $n \times n$ 次操作。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 額外使用長度為 $n$ 的 TypedArray (`basketCapacities`) 儲存籃子容量，及少量固定輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
