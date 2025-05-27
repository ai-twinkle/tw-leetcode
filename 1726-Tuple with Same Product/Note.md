# 1726. Tuple with Same Product

Given an array `nums` of distinct positive integers, 
return the number of tuples `(a, b, c, d)` such that `a * b = c * d` where 
`a`, `b`, `c`, and `d` are elements of `nums`, and `a != b != c != d`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 10^4`
- All elements in `nums` are distinct.

## 基礎思路

本題問的是有多少組 $(a, b, c, d)$ 來自於陣列 `nums`，使得 $a \times b = c \times d$，且四個元素皆不相同。

如果直接暴力窮舉所有四元組，時間複雜度將高達 $O(n^4)$，不切實際。因此在開始寫程式前，我們先尋找一種能高效計算的思路：

1. **轉換為配對乘積問題：**
   任意兩個不同元素 $(a, b)$ 的乘積 $P = a \times b$。只要有多組 $(a, b)$ 配對產生相同乘積，就能彼此組成合法的 $(a, b, c, d)$ 四元組。

2. **計數轉化：**
   若某個乘積 $P$ 出現過 $k$ 次，則這 $k$ 組配對可以互相搭配，每一對 $(a, b)$ 和先前任一對 $(c, d)$（且四個元素皆不重複）都能形成 $8$ 種合法排列（分配給 $(a,b)$ 和 $(c,d)$ 並交換順序）。

3. **實作策略：**

    * 遍歷所有 $(i, j)$，計算乘積並用哈希表（`Map`）紀錄各乘積出現次數。
    * 當遇到一個新的配對產生乘積 $P$，就把它與之前所有相同乘積的配對搭配，並累加答案。
    * 為了效率與剪枝，可以排序後提前判斷配對的乘積是否落在可行範圍，提前跳出。

透過這種「所有配對乘積統計」的思路，我們能把複雜度降到 $O(n^2)$，大幅提升運算效率。

## 解題步驟

### Step 1：初始化與基礎檢查

首先取得陣列長度，若元素少於 4 個，直接回傳 0（不可能構成兩對不重複的配對）。

```typescript
const n = nums.length;

// 如果少於 4 個數字，無法形成配對
if (n < 4) {
  return 0;
}
```

### Step 2：排序與輔助變數設定

將 `nums` 排序，方便後續最小/最大乘積的剪枝。初始化一個 `Map` 作為乘積計數器，以及 `result` 作為最終答案。

```typescript
// 為了最小/最大乘積的捷徑，一次性排序
nums.sort((a, b) => a - b);

const productCounts = new Map<number, number>();
let result = 0;

const maxProduct = nums[n - 1] * nums[n - 2];
const minProduct = nums[0] * nums[1];
```

### Step 3：雙層迴圈遍歷所有配對，統計答案

用兩層迴圈枚舉所有 $(i, j)$ 配對，計算乘積。

- 若乘積太小或太大，分別 continue 或 break 剪枝。
- 用 `Map` 查出目前這個乘積已經出現幾次，並將累計結果加上 `freq * 8`。
- 最後更新乘積次數。

```typescript
for (let i = 0; i < n - 1; i++) {
  // 暫存 nums[i]
  const firstNumber = nums[i];
  for (let j = i + 1; j < n; j++) {
    const product = firstNumber * nums[j];

    // 乘積太小，跳過
    if (product < minProduct) {
      continue;
    }

    // 乘積太大，後續 j 更大，無需繼續
    if (product > maxProduct) {
      break;
    }

    const freq = productCounts.get(product) ?? 0;
    result += freq * 8; // 每一個先前的配對會產生 8 種元組
    productCounts.set(product, freq + 1);
  }
}
```

### Step 4：回傳最終結果

```typescript
return result;
```

## 時間複雜度

- 排序：$O(n \log n)$
- 雙層迴圈最壞情況 $O(n^2)$
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `Map` 儲存最多 $O(n^2)$ 個不同配對乘積
- 其他變數 $O(1)$
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
