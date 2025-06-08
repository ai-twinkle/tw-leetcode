# 386. Lexicographical Numbers

Given an integer `n`, return all the numbers in the range `[1, n]` sorted in lexicographical order.

You must write an algorithm that runs in `O(n)` time and uses `O(1)` extra space.

**Constraints:**

- `1 <= n <= 5 * 10^4`

## 基礎思路

本題目要求將範圍 $[1, n]$ 中的數字，以字典序（lexicographical order）排序後回傳，且需要滿足 $O(n)$ 的時間複雜度與 $O(1)$ 的空間複雜度要求。
字典序的特點在於數字會依照前綴逐層排列，例如 $1$ 之後會接 $10$，然後是 $100, 101, ...$ 等。

因此，我們可以將數字範圍看成一棵十進位樹，以深度優先搜尋（DFS）的方式逐一走訪節點：

- 每次優先向下延伸（數字乘以10）。
- 若無法繼續往下，則改向右方兄弟節點前進（數字加1）。
- 若抵達末端，則返回上一層並繼續橫向移動。

這種方法可確保每個數字只被訪問一次，達到 $O(n)$ 的時間複雜度，且過程中不需額外資料結構來儲存中間狀態，因此符合空間複雜度 $O(1)$ 的要求。

## 解題步驟

### Step 1：初始化結果陣列和必要變數

```typescript
// 一次性配置結果陣列，避免重複擴充，並快取最大值方便後續使用
const resultList: number[] = new Array(n);
const maxValue = n;

let currentNumber = 1;
```

### Step 2：遍歷所有數字並依字典序插入結果

```typescript
for (let position = 0; position < maxValue; position++) {
  // 將當前數字加入結果
  resultList[position] = currentNumber;

  // 若能往下一層延伸，則數字乘以10
  if (currentNumber * 10 <= maxValue) {
    currentNumber *= 10;
    continue;
  }

  // 若無法繼續延伸，則回到上一層並嘗試右邊兄弟節點
  if (currentNumber >= maxValue) {
    currentNumber = (currentNumber / 10) | 0;
  }

  // 移動到右側兄弟節點
  currentNumber += 1;

  // 去除尾部的0，確保不跳到無效節點
  while (currentNumber % 10 === 0) {
    currentNumber = (currentNumber / 10) | 0;
  }
}
```

### Step 3：回傳最終排序後的結果陣列

```typescript
return resultList;
```

## 時間複雜度

- 每個數字只會訪問且插入結果陣列一次，每次操作耗時為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除了返回結果外，只使用固定數量的輔助變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
