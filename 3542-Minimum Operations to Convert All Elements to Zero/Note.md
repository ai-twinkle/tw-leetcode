# 3542. Minimum Operations to Convert All Elements to Zero

You are given an array `nums` of size `n`, consisting of non-negative integers. 
Your task is to apply some (possibly zero) operations on the array so that all elements become 0.

In one operation, you can select a subarray `[i, j]` (where `0 <= i <= j < n`) and set all occurrences of the minimum non-negative integer in that subarray to 0.

Return the minimum number of operations required to make all elements in the array 0.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`

## 基礎思路

本題要求將陣列中所有元素變為 `0`，每次操作可選擇任意子陣列 `[i, j]`，並將該子陣列中**最小的非零數值**全部設為 `0`。目標是找出使整個陣列歸零所需的最少操作次數。

在思考解法時，我們需注意以下幾個觀察與性質：

- **零的切割效果**：
  由於操作僅能在連續子陣列中進行，而 `0` 在任何子陣列中都不影響「最小非零值」的判定，因此可將整個陣列被 `0` 分割成多個獨立區段。各區段的操作數可分別計算再加總。

- **單調關係與層級遞增**：
  若將非零值視作「高度」，當我們從左到右掃描陣列時，每遇到一個新的更高數值（比前面低或相等者不會增加操作），即意味著需要一個新操作層來清除此新高度。
  因此，我們只需統計「由低往高的上升次數」即可。

- **棧模擬高度層**：
  為了高效維護「當前區段中尚未清除的高度層」，可使用一個**單調遞增棧**。
  每當遇到比棧頂更小的數，表示前面的層級已結束；遇到更大的數，則代表出現新的層級（即新增一次操作）。

依據此思路，我們可以用線性時間完成整體計算。
每個元素最多進出棧一次，因此演算法可達 $O(n)$ 時間複雜度。

## 解題步驟

### Step 1：初始化變數

建立單調遞增棧（使用 TypedArray 優化記憶體存取），同時初始化操作次數與棧頂指標。

```typescript
// 建立單調遞增棧（以 TypedArray 優化）
// top = -1 表示棧為空
const length = nums.length;
const stack = new Int32Array(length);
let top = -1;
let operationCount = 0;
```

### Step 2：遍歷陣列元素並處理零分段

若當前值為 0，代表一個區段結束，需清空棧以重新開始下一段計算。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // 若為 0，代表新區段開始，重置棧狀態
  if (value === 0) {
    top = -1;
    continue;
  }

  // ...
}
```

### Step 3：維護單調遞增棧結構

若當前值小於棧頂值，表示前面較高的層級已結束，需不斷彈出棧頂直到符合遞增條件。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：遍歷陣列元素並處理零分段

  // 維持棧遞增，若出現更小的值，代表前層已完成
  while (top >= 0 && stack[top] > value) {
    top--;
  }

  // ...
}
```

### Step 4：判斷是否出現新層級

若棧為空（全新起點）或當前值高於棧頂，代表出現新層，需增加一次操作並將該層高度入棧。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：遍歷陣列元素並處理零分段
  
  // Step 3：維護單調遞增棧結構
  
  // 出現新高度層（尚未出現過），計入一次操作
  if (top < 0 || stack[top] < value) {
    operationCount++;
    stack[++top] = value;
  }
  // 若等於棧頂，代表與前層同高，無需額外操作
}
```

### Step 5：回傳最終操作次數

當所有元素掃描完畢後，回傳累積的操作次數。

```typescript
// 回傳最終操作次數
return operationCount;
```

## 時間複雜度

- 每個元素最多被壓入與彈出棧各一次；
- 其餘操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 $n$ 的棧結構（TypedArray）儲存高度層；
- 其他輔助變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
