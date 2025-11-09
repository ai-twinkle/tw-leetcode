# 2169. Count Operations to Obtain Zero

You are given two non-negative integers `num1` and `num2`.

In one operation, if `num1 >= num2`, you must subtract `num2` from `num1`, otherwise subtract `num1` from `num2`.

- For example, if `num1 = 5` and `num2 = 4`, subtract `num2` from `num1`, thus obtaining `num1 = 1` and `num2 = 4`. 
  However, if `num1 = 4` and `num2 = 5`, after one operation, `num1 = 4` and `num2 = 1`.

Return the number of operations required to make either `num1 = 0` or `num2 = 0`.

**Constraints:**

- `0 <= num1, num2 <= 10^5`

## 基礎思路

本題要求計算使兩個非負整數 `num1` 與 `num2` 之中**至少一個變為 0** 所需的操作次數。
每次操作規則如下：

- 若 `num1 >= num2`，則以 `num2` 減去 `num1`；
- 否則以 `num1` 減去 `num2`；
- 每次操作後，更新被減的那一個數值。

舉例：

- 若 `(num1, num2) = (5, 4)`，執行一次操作後變為 `(1, 4)`；
- 若 `(num1, num2) = (4, 5)`，執行一次操作後變為 `(4, 1)`。

要使任一數變為 `0`，需重複上述過程直到其中之一為零。
此問題的本質其實等價於**模擬輾轉相除法（Euclidean Algorithm）** 的過程，只不過我們不僅要找出最大公因數，而是要**累積減法次數**。

因此我們可以採取以下策略：

- **觀察規律**：若 `num1 >= num2`，在連續減法中，實際上可以直接減去整數倍 `num2`，直到餘數小於 `num2`；
  因此一次可統計多個減法次數，並令 `num1 = num1 % num2`。
- **角色互換**：當 `num1 < num2` 時，交換操作邏輯，繼續減至一方為 0。
- **終止條件**：當任一數值變為 0 時結束，回傳累積的操作次數。

此方法不需模擬每次減法，而是以整除方式快速跳躍，時間效率與歐幾里得算法相同，能在常數時間內處理大數。

## 解題步驟

### Step 1：初始檢查 — 若任一為 0 則無需操作

若一開始 `num1` 或 `num2` 為 0，代表已達目標，直接回傳 0。

```typescript
// 若任一數為 0，則不需任何操作
if (num1 === 0 || num2 === 0) {
  return 0;
}
```

### Step 2：初始化操作計數器

設置變數用來記錄總共執行的操作次數。

```typescript
// 用於統計操作次數
let operationCount = 0;
```

### Step 3：執行迴圈 — 模擬輾轉相除法過程

只要兩數皆非零，就持續進行以下步驟：

- 若 `num1 >= num2`，計算可減去 `num2` 的整數倍數；
- 若 `num1 < num2`，則反向計算；
- 將可減次數累加，並更新剩餘值為「餘數」。

```typescript
// 當兩數皆不為 0 時持續進行
while (num1 !== 0 && num2 !== 0) {
  if (num1 >= num2) {
    // 計算可減的次數（等價於整除結果）
    operationCount += Math.floor(num1 / num2);

    // 更新 num1 為餘數
    num1 = num1 % num2;
  } else {
    // 同理，若 num2 較大，反向執行
    operationCount += Math.floor(num2 / num1);

    // 更新 num2 為餘數
    num2 = num2 % num1;
  }
}
```

### Step 4：回傳最終操作次數

當任一數變為 0 時，代表操作完成，輸出總次數。

```typescript
// 輸出累計的操作次數
return operationCount;
```

## 時間複雜度

- 每次迭代都會將較大數減為餘數，其過程等價於輾轉相除法。
- 每輪運算的代價為常數，迭代次數與輸入大小的對數成正比。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用常數級變數 `operationCount`、`num1`、`num2`。
- 不使用額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
