# 2179. Count Good Triplets in an Array

You are given two 0-indexed arrays nums1 and nums2 of length `n`, 
both of which are permutations of `[0, 1, ..., n - 1]`.

A good triplet is a set of `3` distinct values 
which are present in increasing order by position both in `nums1` and `nums2`. 
In other words, if we consider $\text{pos1}_v$ as the index of the value `v` in `nums1` and
$\text{pos2}_v$ as the index of the value `v` in `nums2`, 
then a good triplet will be a set `(x, y, z)` where `0 <= x, y, z <= n - 1`, 
such that $\text{pos1}_x$ < $\text{pos1}_y$ < $\text{pos1}_z$ and $\text{pos2}_x$ < $\text{pos2}_y$ < $\text{pos2}_z$.

Return the total number of good triplets.

## 基礎思路

題目要求找出好三元組，即在兩個陣列 `nums1` 與 `nums2`（皆為 $[0, 1, ..., n - 1]$ 的排列）中，選出三個不同的值 $(x, y, z)$，使得：

- 在 `nums1` 中，三者的出現順序滿足：  
  $$\text{pos1}_x < \text{pos1}_y < \text{pos1}_z$$
- 在 `nums2` 中，也滿足：  
  $$\text{pos2}_x < \text{pos2}_y < \text{pos2}_z$$

我們觀察到，若將某個數值作為「中間值」$y$，則可以：

- 在其左邊找出符合條件的 $x$ 個數：  
  即在 nums1 中出現在 $y$ 前面，且在 nums2 中也在 $y$ 前的數；
- 在其右邊找出符合條件的 $z$ 個數：  
  即在 nums1 中尚未出現，且在 nums2 中出現在 $y$ 後的數。

對於每個 $y$，可形成的好三元組數量為：
$${\text{left}_y} \times {\text{right}_y}$$

## 解題步驟

### Step 1：建立值對應在 nums2 的位置

我們先建立一個長度為 $n$ 的陣列 `posInNums2`，其中記錄每個數值在 `nums2` 中出現的位置。

```typescript
const n = nums1.length;

// 建立映射：值 -> 在 nums2 中的位置
const posInNums2 = new Uint32Array(n);
for (let i = 0; i < n; i++) {
  posInNums2[nums2[i]] = i;
}
```

### Step 2：初始化 BIT 與計數器

BIT 用來動態維護 prefix sum，我們初始化一個大小為 $n + 1$ 的 `Uint32Array` 作為 BIT（採 1-indexed）。

```typescript
const bit = new Uint32Array(n + 1);
let count = 0;
```

### Step 3：遍歷 nums1，逐步統計符合條件的組合數量

#### Step 3.1：取得 nums1 中元素於 nums2 的索引位置 (`pos2`)

由於我們要確認位置順序，首先將當前的元素 `nums1[i]`，轉換成在 `nums2` 中對應的位置：

```typescript
for (let i = 0; i < n; i++) {
  // 3.1：取得 nums1[i] 在 nums2 中的位置
  const pos2 = posInNums2[nums1[i]];

  // ...
}
```

#### Step 3.2：利用 BIT 查詢已處理元素中，符合在 nums2 中前於 `pos2` 位置的數量 (`left`)

這一步是透過 BIT 來快速求出：

- 已處理的元素中有幾個是出現在 nums2 中 `pos2` 前方的。

這個數字就是候選「左側元素」$x$ 的數量。

BIT 採用 1-indexed 的方式，因此查詢時我們將索引轉為 `pos2 + 1`：

```typescript
for (let i = 0; i < n; i++) {
  // 3.1：取得 nums1[i] 在 nums2 中的位置

  // 3.2：查詢 BIT，統計左側（已處理）中出現在 nums2 前方的數量
  let left = 0;
  let j = pos2 + 1; // BIT 採用 1-indexed
  while (j > 0) {
    left += bit[j];       // 累計 BIT 中已經記錄的數量
    j -= j & -j;          // 移動至前一個位置
  }

  // ...
}
```

#### Step 3.3：計算尚未處理的元素中，符合在 nums2 中後於 `pos2` 位置的數量 (`right`)

下一步我們需計算可作為候選「右側元素」$z$ 的數量：

- `totalGreater`：在 nums2 中，`pos2` 後面總共有幾個元素。
- `placedGreater`：已處理的元素中，有幾個在 nums2 中是位於 `pos2` 的右側（即不符合 left 條件的已處理元素）。
- `right`：從上述兩個數量中計算尚未處理、且位於 nums2 後方的候選數量：

計算方式：

- nums2 後方總數量：
  $$\text{totalGreater} = (n - 1) - \text{pos2}$$

- 已處理且位於 nums2 後方數量：
  $$\text{placedGreater} = i - \text{left}$$

- 最終可用數量：
  $$\text{right} = \text{totalGreater} - \text{placedGreater}$$

```typescript
for (let i = 0; i < n; i++) {
  // 3.1：取得 nums1[i] 在 nums2 中的位置

  // 3.2：查詢 BIT，統計左側（已處理）中出現在 nums2 前方的數量

  // 3.3：計算 right 數量
  const totalGreater = n - 1 - pos2;    // nums2 中在 pos2 後方的總數量
  const placedGreater = i - left;       // 已處理但不符合 left 的數量
  const right = totalGreater - placedGreater; // 尚未處理且符合順序的數量

  // ...
}
```

---

#### Step 3.4：將當前元素可組成的好三元組數量累加到答案中

根據題意，每個當前元素可組成的好三元組數量即為：

$$\text{left} \times \text{right}$$

因此，我們將此結果加到總數 `count` 中：

```typescript
for (let i = 0; i < n; i++) {
  // 3.1：取得 nums1[i] 在 nums2 中的位置

  // 3.2：查詢 BIT，統計左側數量

  // 3.3：計算 right 數量
  
  // 3.4：將當前組合對應的好三元組數量累加
  count += left * right;

  // ...
}
```

#### Step 3.5：更新 BIT，紀錄當前元素已處理

最後，將當前元素在 BIT 中標記已處理：

- 將當前元素的 BIT 對應位置 (pos2 + 1) 加一。

```typescript
for (let i = 0; i < n; i++) {
  // 3.1：取得 nums1[i] 在 nums2 中的位置

  // 3.2：查詢 BIT，統計左側數量

  // 3.3：計算 right 數量
  
  // 3.4：將當前組合對應的好三元組數量累加

  // 3.5：更新 BIT，標記此元素已被處理
  let index = pos2 + 1;
  while (index <= n) {
    bit[index]++;        // 將當前位置累加標記
    index += index & -index; // 更新至 BIT 下一個索引位置
  }
}
```

### Step 4：回傳答案

```typescript
return count;
```

## 時間複雜度分析

- 外層迴圈執行 $n$ 次；
- 每次 BIT 查詢與更新皆為 $O(\log n)$。
- 總時間複雜度為 $O(\log n)$

> $O(\log n)$

## 空間複雜度分析

- `posInNums2` 與 `bit` 各佔 $O(n)$ 空間；
- 其他變數為常數空間。
- 總空間複雜度為 $O(n)$

> $O(n)$
