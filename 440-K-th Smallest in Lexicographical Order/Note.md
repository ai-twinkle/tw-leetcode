# 440. K-th Smallest in Lexicographical Order

Given two integers `n` and `k`, return the $k^{th}$ lexicographically smallest integer in the range `[1, n]`.

**Constraints:**

- `1 <= k <= n <= 10^9`

## 基礎思路

本題要求找出 $[1, n]$ 區間內，字典序第 $k$ 小的整數。若直接逐個數字排序，效率會遠遠不足。因此，我們可以將所有數字視作一棵以「前綴」為節點的樹（Trie 結構），每個節點代表一個特定的數字前綴，其下的子樹則包含所有以此前綴開頭的數字。

高效解法的關鍵在於利用「整個前綴區間」來批次跳過或深入：

- 先將數字視為一顆前綴樹（Trie），以「前綴」為單位進行遍歷。
- 每個前綴節點代表一個合法的數字範圍。
- 每次遍歷時，計算目前前綴底下所有合法數字的數量：

    - 若該數量大於剩餘步數，代表第 $k$ 個數就在此前綴內部，應繼續往下深入。
    - 若該數量小於等於剩餘步數，代表第 $k$ 個數不在此區間，可以直接跳過整個子樹。
- 反覆上述判斷，逐步減少剩餘步數，直到精確定位答案。

這樣就能有效避開暴力排序，直接以 $O(\log n)$ 的複雜度切換與跳躍，大幅提升效率。


## 解題步驟

### Step 1：初始化輔助變數

先建立核心所需的三個輔助變數，便於之後字典序遍歷：

```typescript
let currentPrefix = 1;      // 當前所在的字典序前綴
let remainingSteps = k - 1; // 剩餘需移動的步數（初始位置為 1 已佔一步）
const upperBound = n + 1;   // 快取以避免重複計算 n + 1
```

### Step 2：利用字典序樹遍歷，逐步定位答案

進入主迴圈，逐層探索子樹數量並決定跳躍或深入：

```typescript
while (remainingSteps > 0) {
  // 計算當前前綴下的子樹內數字數量
  let countUnderPrefix = 0;
  let first = currentPrefix;
  let next = currentPrefix + 1;

  // 逐層向下探索，計算以此前綴開頭的合法數字數量
  while (first < upperBound) {
    countUnderPrefix += (next < upperBound ? next : upperBound) - first;
    first *= 10;
    next *= 10;
  }

  // 根據數量決定是跳過還是深入
  if (countUnderPrefix <= remainingSteps) {
    // 跳過此前綴所代表的整個子樹
    currentPrefix += 1;
    remainingSteps -= countUnderPrefix;
  } else {
    // 深入此前綴的子樹，進到下一層的第一個節點
    currentPrefix *= 10;
    remainingSteps -= 1;
  }
}
```

### Step 3：完成遍歷後返回答案

當遍歷結束，當前的前綴即為所求字典序第 $k$ 個數字：

```typescript
return currentPrefix;
```

## 時間複雜度

- 主迴圈在最壞情況會執行 $k$ 次，每次計算子樹規模需深入至多 $\log_{10}(n)$ 層，因此單次計算為 $O(\log n)$。
- 總時間複雜度為 $O(k \cdot \log n)$。

> $O(k \cdot \log n)$

## 空間複雜度

- 使用固定的輔助變數，未使用其他額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
