# 2364. Count Number of Bad Pairs

You are given a 0-indexed integer array `nums`. 
A pair of indices `(i, j)` is a bad pair if `i < j` and `j - i != nums[j] - nums[i]`.

Return the total number of bad pairs in `nums`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

我們的目標是找到符合條件的所有 bad pairs，即找到所有的 `i, j` 使得 `i < j` 且 `j - i != nums[j] - nums[i]`。

這個條件約束範圍很廣，我們可以設想一下，如果我們對所有的 `i, j` 進行暴力搜索，時間複雜度會非常高。
但是他的補集條件 `j - i == nums[j] - nums[i]` 似乎可以簡化問題。我們稱之為 "good pairs"。

我們可以將這個條件經過以下操作轉換:

1. 移項操作: $j - i - nums[j] == - nums[i]$
2. 移項操作: $j - nums[j] == i - nums[i]$
3. 同乘上 `-1`: $nums[j] - j == nums[i] - i$

我們發現 "good pairs" 的條件是當該數值與其索引的差值相等時，即成立。
我們找到所有的 "good pairs" 組合，然後將 "total pairs" 減去 "good pairs" 即可得到 "bad pairs"。

## 解題步驟

### Step 1: 紀錄長度與索引紀錄表

- `n` 代表陣列長度。
- `count` 是一個雜湊表，用來紀錄每個 $nums[i] - i$ 的值出現了幾次。

```typescript
const n = nums.length;
const count = new Map<number, number>(); // 差值與出現次數的對應表
```

### Step 2: 計算所有的 good pairs

- 差值 `diff` 代表每個索引及其值的唯一組合。
- `count.get(diff)` 取得當前這個差值在前面已出現幾次，每次都能組成一組 new good pair。
- 將這個值累加到 goodPairs。
- 最後，更新當前差值的次數。

```typescript 
// 紀錄所有的 good pairs 數量
let goodPairs = 0;

for (let i = 0; i < n; i++) {
  // 計算當前索引的差值
  // 如果 nums[i] - i 等於 nums[j] - j，則 i 和 j 組成一個 good pair
  const diff = nums[i] - i;

  // 取得當前差值的出現次數，如果沒有出現過，則預設為 0
  const current = count.get(diff) || 0;

  // 每一個相同差值的出現次數都會對當前索引構成一個 good pair
  goodPairs += current;

  // 更新當前差值的出現次數
  count.set(diff, current + 1);
}
```

### Step 3: 計算 Total pairs

組合公式 $C(n, 2)$，計算所有可能的 $(i, j)$ 組合，$i < j$。

```typescript
// 這個式子是 n choose 2 的組合數計算公式展開結果
// nCr(n, 2) = n! / (2! * (n - 2)!) = n * (n - 1) / 2
const totalPairs = (n * (n - 1)) / 2;
```

### Step 4: 計算 Bad pairs

bad pairs 數量即為所有組合扣除 good pairs。

```typescript
// bad pairs = total pairs - good pairs
return totalPairs - goodPairs;
```

## 時間複雜度

- 需遍歷一次陣列，時間複雜度為 $O(n)$。
- 雜湊表操作均為均攤 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個額外的空間來存儲差值與出現次數的對應表，最壞情況下需要 $O(n)$ 的空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
