# 3068. Find the Maximum Sum of Node Values

There exists an undirected tree with `n` nodes numbered `0` to `n - 1`. 
You are given a 0-indexed 2D integer array `edges` of length `n - 1`, 
where `edges[i] = [u_i, v_i]` indicates that there is an edge between nodes `u_i` and `v_i` in the tree. 
You are also given a positive integer `k`, and a 0-indexed array of non-negative integers `nums` of length `n`, 
where `nums[i]` represents the value of the node numbered `i`.

Alice wants the sum of values of tree nodes to be maximum, 
for which Alice can perform the following operation any number of times (including zero) on the tree:

- Choose any edge `[u, v]` connecting the nodes `u` and `v`, and update their values as follows:
  - `nums[u] = nums[u] XOR k`
  - `nums[v] = nums[v] XOR k`

Return the maximum possible sum of the values Alice can achieve by performing the operation any number of times.

**Constraints:**

- `2 <= n == nums.length <= 2 * 10^4`
- `1 <= k <= 10^9`
- `0 <= nums[i] <= 10^9`
- `edges.length == n - 1`
- `edges[i].length == 2`
- `0 <= edges[i][0], edges[i][1] <= n - 1`
- The input is generated such that `edges` represent a valid tree.

## 基礎思路

本題的核心是決定如何透過任意次數的 XOR 操作，讓整棵樹節點的總和最大化。每次 XOR 操作需作用於樹中的某條邊，會同時改變邊的兩端節點的值，因此對於任意一次操作：

- 節點 `u` 和節點 `v` 同時被執行：

  ```
  nums[u] = nums[u] XOR k  
  nums[v] = nums[v] XOR k
  ```

我們觀察會注意到以下兩點的重要特性：

1. 每個節點最多可被多次選取，但最終影響節點值的只有奇數或偶數次 XOR 操作（因為 XOR 兩次會恢復原值）。
2. XOR 的特性決定每個節點最終狀態只有兩種可能：

   - **不切換**：保留原始值 `nums[i]`。
   - **切換一次**：值變成 `nums[i] XOR k`。

由於每次操作會同時改變一條邊上的兩個節點，因此最終被切換的節點數目一定是偶數個。因此，本題最終簡化成：

- 對每個節點計算出 **切換** 與 **不切換** 兩種情況下的差值（增益）。
- 若切換後的增益為正，則此節點應盡量切換，否則應保持原值。
- 若最終選出的正收益節點數目為偶數，則全部切換即可；
- 若為奇數，則需去除一個對整體影響最小（絕對值最小）的節點切換，以符合偶數限制。

## 解題步驟

### Step 1：初始化與輔助變數設定

先初始化所需的各個輔助變數，以利後續計算：

```typescript
const nodeCount = nums.length;

let totalSum = 0;               // 所有節點原始值的總和
let positiveDeltaSum = 0;       // 累計所有正收益節點的增益
let positiveDeltaCount = 0;     // 正收益節點的數目（用以判斷奇偶）

// 紀錄所有節點中絕對值最小的增益
let minimalAbsoluteDelta = Infinity;
```

### Step 2：逐一計算各節點切換與不切換的增益

遍歷每個節點，計算該節點是否值得被切換：

```typescript
for (let idx = 0; idx < nodeCount; idx++) {
  // 將原始節點值轉為 32 位元無號整數，避免負數異常
  const originalValue = nums[idx] >>> 0;

  // 計算 XOR 後的節點值
  const toggledValue = originalValue ^ k;

  // 計算節點切換與不切換之間的差值 (增益)
  const delta = toggledValue - originalValue;

  // 無論如何都要累加原始節點值
  totalSum += originalValue;

  // 計算目前節點增益的絕對值，以便之後判斷最小影響節點
  const absDelta = delta < 0 ? -delta : delta;

  // 更新目前最小的絕對增益值
  if (absDelta < minimalAbsoluteDelta) {
    minimalAbsoluteDelta = absDelta;
  }

  // 如果增益為正，累計此增益並增加計數
  if (delta > 0) {
    positiveDeltaSum += delta;
    positiveDeltaCount++;
  }
}
```

### Step 3：調整最終增益，滿足偶數節點條件並計算最終答案

因為題目限制每次切換影響兩個節點，因此需確認最終切換節點數量必為偶數：

```typescript
// 如果正收益節點數為奇數，需扣除影響最小的節點以滿足偶數條件
const adjustment = (positiveDeltaCount & 1) === 1
  ? minimalAbsoluteDelta
  : 0;

// 最終結果 = 原始總和 + 正增益總和 - 必要的調整值
return totalSum + positiveDeltaSum - adjustment;
```

## 時間複雜度

- 僅遍歷節點一次，且每個節點皆為 $O(1)$ 操作，因此整體為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了固定數量的輔助變數，無額外動態配置的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
