# 1726. Tuple with Same Product

Given an array `nums` of distinct positive integers, 
return the number of tuples `(a, b, c, d)` such that `a * b = c * d` where 
`a`, `b`, `c`, and `d` are elements of `nums`, and `a != b != c != d`.

## 基礎思路
利用暴力枚舉所有兩兩組合的方式，記錄每個乘積出現的次數，並在遇到重複乘積時，根據已經出現的次數計算出可以構成多少個新的四元組。
由於每兩組數對可以產生 8 種排列，所以每次發現重複乘積時，都會將計數器增加 8 乘上(已出現次數 + 1)。

> Tips
> `A`, `B`, `C`, `D` 會有 8 種排列組合，因為會有 2 組 `A與B`、`C與D`，其排列是 2! * 2! = 4。
> 而 `A與B` 與 `C與D` 也可以交換位置，所以是 4 * 2! = 8。

## 解題步驟

### Step 1: 初始化變數

```typescript
const n = nums.length;                         // 輸入陣列長度
const productMap = new Map<number, number>();  // 乘積與出現次數的對應表
```

### Step 2: 枚舉所有兩兩組合

```typescript
let count = 0;
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {      
    // 計算該對數字的乘積
    const product = nums[i] * nums[j];

    /*  
        當前這一對的乘積 product 已經在之前出現過了多少次，就代表之前有這麼多對 (a, b)
        滿足 a * b = product。新的這一對 (nums[i], nums[j]) 與之前每一對組合起來，
        都可以形成一組滿足條件的四元組 (因為兩對數字的乘積相等)。
        而每組兩對數字可以排列出 8 種不同的 tuple，所以增加的計數就是 8 * (目前 product 在 map 中已經出現的次數)
    */
    count += 8 * (productMap.get(product) || 0);

    // 更新 productMap：將當前乘積 product 出現的次數增加 1
    productMap.set(product, (productMap.get(product) || 0) + 1);
  }
}
```

## 時間複雜度
- 需要比對所有兩兩組合，所以時間複雜度為 $O(n^2)$
- 總體時間複雜度為 $O(n^2)$

> $O(n^2)$

## 空間複雜度
- 在最壞情況下，假如每一對數字所計算出的乘積都是唯一的，那麼 productMap 中就會有 $O(n^2)$ 個不同的鍵值對。
- 總體空間複雜度為 $O(n^2)$

> $O(n^2)$
