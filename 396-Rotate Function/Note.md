# 396. Rotate Function

You are given an integer array `nums` of length `n`.

Assume `arr_k` to be an array obtained by rotating `nums` by `k` positions clock-wise. 
We define the rotation function `F` on `nums` as follow:

- `F(k) = 0 * arr_k[0] + 1 * arr_k[1] + ... + (n - 1) * arr_k[n - 1]`.

Return the maximum value of `F(0), F(1), ..., F(n-1)`.

The test cases are generated so that the answer fits in a 32-bit integer.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 10^5`
- `-100 <= nums[i] <= 100`

## 基礎思路

本題要求對一個整數陣列計算所有旋轉版本的加權總和函數，並回傳其中的最大值。若直接對每個旋轉版本重新計算，時間複雜度將達到 $O(n^2)$，無法有效處理大規模輸入。

在思考解法時，可掌握以下核心觀察：

- **相鄰旋轉之間存在遞推關係**：
  從 $F(k-1)$ 推導 $F(k)$ 時，每個元素的權重均增加 1，唯有被旋轉至最前面的元素從高權重降至 0，這個規律可以被提煉為一條簡潔的遞推公式。

- **遞推公式的推導**：
  $F(k) = F(k-1) + \text{totalSum} - n \cdot \text{nums}[n-k]$，其中 $\text{totalSum}$ 為陣列所有元素之總和。利用此公式，每次旋轉僅需常數時間即可求得新的函數值。

- **初始值可在同一次迭代中計算**：
  陣列總和與 $F(0)$ 的計算目標相似，可在單次線性掃描中同時完成，避免重複遍歷。

- **遞推方向與索引對應**：
  以索引從 $n-1$ 遞減至 $1$ 進行迭代，恰好對應第 $k$ 次旋轉時被移至最前的元素 $\text{nums}[n-k]$，使得遞推邏輯自然映射到陣列索引。

依據以上特性，可以採用以下策略：

- **一次線性掃描同時求得陣列總和與 $F(0)$**，作為遞推的起點。
- **利用遞推公式以 $O(1)$ 時間從 $F(k-1)$ 推進至 $F(k)$**，並在每步更新最大值。
- **最終回傳所有旋轉中的最大函數值**，整體時間複雜度降至 $O(n)$。

此策略充分利用旋轉操作的結構性，將暴力法的二次複雜度優化為線性，適合處理大規模輸入。

## 解題步驟

### Step 1：一次掃描同時計算陣列總和與初始旋轉函數值

在同一個迴圈中，逐一累加每個元素至總和，同時以位置索引乘以元素值累積出 $F(0)$，避免對陣列進行兩次遍歷。

```typescript
const n = nums.length;

// 在同一次迴圈中計算總和與初始 F(0)，避免重複遍歷
let totalSum = 0;
let currentF = 0;
for (let index = 0; index < n; index++) {
  const value = nums[index];
  totalSum += value;
  currentF += index * value;
}
```

### Step 2：以初始旋轉函數值作為當前最大值

$F(0)$ 是第一個候選答案，先將其作為最大值的初始基準，後續每次遞推後再與其比較。

```typescript
let maxF = currentF;
```

### Step 3：利用遞推公式逐步推進並追蹤最大值

根據遞推關係 $F(k) = F(k-1) + \text{totalSum} - n \cdot \text{nums}[n-k]$，從索引 $n-1$ 遞減至 $1$ 進行迭代，每輪以常數時間求得下一個旋轉函數值，並即時更新最大值。

```typescript
// 使用遞推關係：F(k) = F(k-1) + totalSum - n * nums[n-k]
// 索引從 n-1 遞減至 1，對應 k 從 1 至 n-1 時的 nums[n-k]
for (let index = n - 1; index >= 1; index--) {
  currentF += totalSum - n * nums[index];
  // 使用內聯比較取代 Math.max 函式呼叫以提升效能
  if (currentF > maxF) {
    maxF = currentF;
  }
}
```

### Step 4：回傳所有旋轉中的最大函數值

迭代結束後，`maxF` 已記錄所有旋轉版本中的最大函數值，直接回傳即可。

```typescript
return maxF;
```

## 時間複雜度

- 第一次線性掃描計算 `totalSum` 與 `F(0)`，耗費 $O(n)$；
- 第二次線性迭代利用遞推公式求得所有旋轉函數值，耗費 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的輔助變數（總和、當前函數值、最大值）；
- 未配置任何與輸入規模相關的額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
