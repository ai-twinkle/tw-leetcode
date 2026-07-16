# 3867. Sum of GCD of Formed Pairs

You are given an integer array `nums` of length `n`.

Construct an array prefixGcd where for each index `i`:

- Let `mx_i = max(nums[0], nums[1], ..., nums[i])`.
- `prefixGcd[i] = gcd(nums[i], mx_i)`.

After constructing `prefixGcd`:

- Sort `prefixGcd` in non-decreasing order.
- Form pairs by taking the smallest unpaired element and the largest unpaired element.
- Repeat this process until no more pairs can be formed.
- For each formed pair, compute the `gcd` of the two elements.
- If `n` is odd, the middle element in the `prefixGcd` array remains unpaired and should be ignored.

Return an integer denoting the sum of the GCD values of all formed pairs.

The term `gcd(a, b)` denotes the greatest common divisor of `a` and `b`.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題要求先建構一個 `prefixGcd` 陣列，其中每個位置的值取決於「當前元素」與「前綴最大值」的最大公因數；接著將此陣列排序後，以「最小配最大」的雙指標方式兩兩成對，計算每對的最大公因數並加總。

在思考解法時，可掌握以下核心觀察：

- **前綴最大值具單調不減性質**：
  由於 `mx_i` 是從開頭到當前位置的最大值，隨著索引增加只會維持或變大，因此無須每次重新掃描，只要在單次遍歷中持續更新即可。

- **配對規則等價於排序後的雙指標收斂**：
  「取最小與最大配對」的操作，本質上就是先將陣列排序，再從兩端向中央同時逼近，每次取一組後兩端各自內縮一格。

- **奇數長度的中間元素自然被略過**：
  當左右指標相遇時即停止，若長度為奇數，正中間的元素不會被納入任何一對，符合題目忽略中間元素的要求。

- **最大公因數為基本運算單元**：
  無論是建構階段或配對階段，皆需反覆求取兩數的最大公因數，因此可獨立出一個輔助函數以歐幾里得演算法處理。

依據以上特性，可以採用以下策略：

- **以單次遍歷同步維護前綴最大值並填入 `prefixGcd`**，避免重複計算最大值。
- **排序後利用雙指標從兩端向內收斂完成配對**，同時累加每對的最大公因數。
- **以歐幾里得演算法作為求取最大公因數的共用工具**，供兩個階段重複使用。

此策略能在排序主導的時間成本下，完成整體計算，簡潔且高效。

## 解題步驟

### Step 1：以歐幾里得演算法實作最大公因數輔助函數

先獨立出求取最大公因數的函數，透過輾轉相除法反覆以餘數更新兩數，直到餘數為 0，此時的 `first` 即為最大公因數。

```typescript
function computeGcd(first: number, second: number): number {
  while (second !== 0) {
    const remainder = first % second;
    first = second;
    second = remainder;
  }

  return first;
}
```

### Step 2：取得陣列長度並初始化前綴結構

取得輸入陣列長度，並以型別化陣列儲存 `prefixGcd` 以降低記憶體負擔，同時準備一個變數追蹤前綴最大值。

```typescript
const length = nums.length;

// 使用型別化陣列儲存前綴 gcd 值以降低記憶體負擔
const prefixGcd = new Int32Array(length);
let runningMax = 0;
```

### Step 3：單次遍歷建構 prefixGcd

逐一走訪每個元素，先更新前綴最大值 `runningMax`（因其單調不減，僅需與當前值比較），再以當前值與前綴最大值求取最大公因數並填入對應位置。

```typescript
// 建構 prefixGcd；由於 mx_i 單調不減，可於單次遍歷中追蹤
for (let index = 0; index < length; index++) {
  const current = nums[index];

  if (current > runningMax) {
    runningMax = current;
  }

  prefixGcd[index] = computeGcd(current, runningMax);
}
```

### Step 4：將 prefixGcd 排序

將 `prefixGcd` 以非遞減順序原地排序，使後續能以雙指標從兩端進行「最小配最大」的配對。

```typescript
// 以非遞減順序對型別化陣列進行原地排序
prefixGcd.sort();
```

### Step 5：初始化累加總和與雙指標

準備累加變數 `total`，並設定左指標指向最小值、右指標指向最大值，作為雙指標收斂的起點。

```typescript
let total = 0;
let left = 0;
let right = length - 1;
```

### Step 6：以雙指標向內收斂並累加每對的最大公因數

當左指標仍在右指標左側時，取出兩端元素求取最大公因數並累加，隨後左指標右移、右指標左移；若長度為奇數，兩指標相遇時中間元素自然被略過。

```typescript
// 最小配最大，累加每對的 gcd
while (left < right) {
  total += computeGcd(prefixGcd[right], prefixGcd[left]);
  left++;
  right--;
}
```

### Step 7：回傳配對結果總和

完成所有配對後，回傳累加得到的最大公因數總和。

```typescript
return total;
```

## 時間複雜度

- 建構 `prefixGcd` 需遍歷 `n` 個元素，每次計算最大公因數為 $O(\log V)$，其中 `V` 為數值上界；
- 排序需 $O(n \log n)$；
- 配對階段共 `n / 2` 對，每對計算最大公因數為 $O(\log V)$，合計 $O(n \log V)$；
- 總時間複雜度為 $O(n \log n + n \log V)$。

> $O(n \log n + n \log V)$

## 空間複雜度

- 使用長度為 `n` 的型別化陣列儲存 `prefixGcd`；
- 排序與其餘變數僅需常數或對數層級的額外空間；
- 總空間複雜度為 $O(n)$。

> $O(n)$
