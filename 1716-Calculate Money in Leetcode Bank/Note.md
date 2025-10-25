# 1716. Calculate Money in Leetcode Bank

Hercy wants to save money for his first car. 
He puts money in the Leetcode bank every day.

He starts by putting in `$1` on Monday, the first day. 
Every day from Tuesday to Sunday, he will put in `$1` more than the day before. 
On every subsequent Monday, he will put in `$1` more than the previous Monday.

Given `n`, return the total amount of money he will have in the Leetcode bank at the end of the $n^{th}$ day.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

本題要求計算 Hercy 在第 `n` 天結束時，存在 Leetcode 銀行的總金額。
根據題意，Hercy 存錢的規律如下：

1. **起始規律**：第一週的星期一存 $1，之後每天比前一天多 $1（即週一 $1、週二 $2、…、週日 $7）。
2. **週遞增規律**：每過一週，新的星期一會比上週一多存 $1。
    - 例如第二週：週一 $2、週二 $3、…、週日 $8。
3. **目標**：給定天數 `n`，求出第 `n` 天結束時的**累計總金額**。

觀察規律可得：

- 每週共有 7 天，且每週的存款形成等差數列。
- 若共有 `w` 週完整週數，則：
    - 第 `i` 週（從 0 起算）的總存款為：`28 + 7 * i`
        - 因為第一週和為 `1+2+3+4+5+6+7 = 28`
        - 之後每週首項多 1，因此每週多出 7。
- 若最後一週未滿 7 天，則這部分也能視為**等差數列的部分和**。

因此解題策略如下：

- **分兩段計算**：
    - 完整週部分：使用等差級數求和公式。
    - 不完整週部分：從當週星期一開始，逐日累加遞增。
- **組合總額**：將完整週與剩餘天相加即為答案。
- **最佳化考量**：由於 `n ≤ 1000`，可直接以常數時間公式求得，不需迴圈模擬。

## 解題步驟

### Step 1：初始化儲存結構與變數

使用 `Int32Array` 作為快取表（雖然本題範圍小，但提供重複呼叫時的 O(1) 存取）。

```typescript
// 初始化一個長度為 1001 的整數陣列，用來記錄計算結果（快取表）
const totalMoney = new Int32Array(1001);
```

### Step 2：計算完整週數與剩餘天數

以 7 為週期，計算已經過幾個完整週，以及多出的天數。

```typescript
// 以整除計算完整週數（相當於 Math.floor(n / 7)）
const weekCount = (n / 7) | 0;

// 剩餘天數 = 總天數 - 完整週天數
const remainingDays = n - weekCount * 7;
```

### Step 3：計算完整週的總和（等差數列求和）

每週和為 `28 + 7*i`，其中 `i` 為週索引。
因此完整週部分的總和為：

$$
S = 28 \times w + \frac{7w(w - 1)}{2}
$$

```typescript
// 使用等差數列求和公式計算所有完整週的總和
const completeWeeksSum =
  28 * weekCount + ((7 * weekCount * (weekCount - 1)) >> 1);
```

### Step 4：計算最後一週剩餘天數的存款

若最後一週未滿七天，需從該週的星期一開始遞增計算。
第 `weekCount` 週的星期一金額為 `(weekCount + 1)`，每天加 1，
因此其部分和為：

$$
S_r = d \times (w + 1) + \frac{d(d - 1)}{2}
$$

```typescript
// 計算最後一週的剩餘天數部分（以該週首日金額為 weekCount + 1）
const remainingSum =
  remainingDays * (weekCount + 1) + ((remainingDays * (remainingDays - 1)) >> 1);
```

### Step 5：組合總金額並回傳

將完整週與剩餘天數部分相加，即為最終總存款。
同時計入快取表，以便重複查詢。

```typescript
// 合併完整週與剩餘天數的總額
const total = completeWeeksSum + remainingSum;

// 儲存結果以便後續重複查詢
totalMoney[n] = total;

// 回傳最終結果
return total;
```

## 時間複雜度

- 所有計算皆為常數級別（不含任何迴圈或遞迴）。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用一個固定長度的 `Int32Array` 快取表，大小與輸入無關。
- 總空間複雜度為 $O(1)$。

> $O(1)$
