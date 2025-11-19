# 2154. Keep Multiplying Found Values by Two

You are given an array of integers `nums`. 
You are also given an integer `original` which is the first number that needs to be searched for in `nums`.

You then do the following steps:

1. If `original` is found in `nums`, multiply it by two (i.e., set original = 2 * original).
2. Otherwise, stop the process.
3. Repeat this process with the new number as long as you keep finding the number.

Return the final value of `original`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i], original <= 1000`

## 基礎思路

本題要求我們從一個整數 `original` 開始，檢查它是否存在於陣列 `nums` 中：

- 若存在，則將 `original` 變為 `original * 2`，然後繼續檢查新的數值；
- 若不存在，流程立即停止並回傳此時的 `original`。

重點在於：
這是一個 **「重複檢查是否存在 → 若存在就倍增」** 的過程，而整個陣列 `nums` 的大小最多為 1000，且值域也在 1 到 1000 之間。因此，我們可以利用以下觀察來設計高效方法：

- 陣列值域僅到 1000，因此可以建立一個固定大小的 presence map（存在表）來標記哪些數值在 `nums` 中出現；
- 由於 `original` 每次倍增，因此它的值會非常快速地超過 1000；
- 一旦 `original` 超過 1000，就不可能出現在 `nums` 中，因此流程必然會停止。

基於以上，我們可以利用一個固定長度（1001）的 `Uint8Array` 存取存在資訊，使查詢達到 O(1)。

整體流程時間複雜度可以降至 $O(n)$，其中 n 為陣列長度。

## 解題步驟

### Step 1：建立存在表（presence map）並初始化

利用 `Uint8Array(1001)` 來標記 `nums` 中出現的數，確保後續查詢存在否為 O(1)。

```typescript
// 使用緊湊的 TypedArray 建立 nums 中數值的存在表
const presenceMap = new Uint8Array(MAXIMUM_ALLOWED_VALUE + 1);

const length = nums.length;
```

### Step 2：遍歷 nums 並標記出現數值

掃描整個 `nums`，只要數值在合法範圍（≤1000），就記錄為存在。

```typescript
// 將 nums 中的所有數值標記為存在（僅標記合法範圍內的數值）
for (let index = 0; index < length; index += 1) {
  const value = nums[index];

  if (value <= MAXIMUM_ALLOWED_VALUE) {
    // 標記此數值已出現
    presenceMap[value] = 1;
  }
}
```

### Step 3：執行倍增檢查流程

從 `original` 開始，只要它仍在存在表中，就一直倍增。

```typescript
// 使用給定的 original 作為起始值
let currentValue = original;

// 只要 currentValue 存在於 nums，就持續倍增
// 若 currentValue 超過值域上限，便不可能出現在 nums 中，因此可直接停止
while (
  currentValue <= MAXIMUM_ALLOWED_VALUE &&
  presenceMap[currentValue] === 1
  ) {
  // 將 currentValue 倍增並繼續檢查
  currentValue = currentValue * 2;
}
```

### Step 4：回傳最終數值

當某次倍增後的 `currentValue` 不再出現在 `nums` 中，即回傳答案。

```typescript
// 當不再找到此數值時，回傳最終結果
return currentValue;
```

## 時間複雜度

- 建立存在表需要掃描整個陣列 → $O(n)$
- 每次倍增最多 log₂(1000) ≈ 10 次 → 可視為常數時間 O(1)
- 查詢存在表皆為 O(1)
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小的 1001-byte 存在表 → $O(1)$
  （與輸入大小無關，為常數級空間）
- 總空間複雜度為 $O(1)$。

> $O(1)$
