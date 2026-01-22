# 3507. Minimum Pair Removal to Sort Array I

Given an array `nums`, you can perform the following operation any number of times:

- Select the adjacent pair with the minimum sum in `nums`. If multiple such pairs exist, choose the leftmost one.
- Replace the pair with their sum.

Return the minimum number of operations needed to make the array non-decreasing.

An array is said to be non-decreasing if each element is greater than or equal to its previous element (if it exists).

**Constraints:**

- `1 <= nums.length <= 50`
- `-1000 <= nums[i] <= 1000`

## 基礎思路

本題允許重複進行一種「合併相鄰元素」的操作：每次必須選擇**目前陣列中相鄰和最小**的那一對（若有多對同最小，取最左邊），把它們替換成一個元素（兩者的和）。我們要找讓陣列變成**非遞減**（每個元素 ≤ 下一個元素）所需的最少操作次數。

在思考解法時，需要注意幾個關鍵點：

* **操作選擇是被題目固定的**：每一步只能合併「最小相鄰和」且取最左邊，這不是我們自由決策的最佳化問題；我們只需要正確模擬此規則直到陣列非遞減。
* **陣列長度最多 50**：可以接受每一步做全掃描找最小相鄰和，但要小心實作時不要大量做陣列刪插（會造成額外搬移與複雜度不清）。
* **判斷何時已非遞減**：若每次都重新檢查整個陣列是否非遞減會造成重複掃描；更好的方式是追蹤「相鄰逆序對」數量（前一個 > 後一個 的位置數）。當逆序對為 0 時即達成目標。
* **合併只影響局部相鄰關係**：一次合併只會改變合併點附近的相鄰關係，因此逆序對的變化可以只針對局部更新，而不必全域重算。

因此我們可以利用以下策略來實作：

1. 用一個能快速「刪除節點但不搬移陣列」的結構表示目前仍存在的元素順序（用索引模擬鏈結）。
2. 初始先計算整體相鄰逆序對數量。
3. 反覆執行：全掃描目前存活的相鄰對，找最小相鄰和且最左者，合併之；並只在合併點附近更新逆序對計數。
4. 直到逆序對為 0 或只剩一個元素，回傳操作次數。

## 解題步驟

### Step 1：處理長度邊界

若陣列長度為 0 或 1，已必然非遞減，不需要任何操作。

```typescript
const length = nums.length;
if (length <= 1) {
  return 0;
}
```

### Step 2：以索引模擬雙向鏈結結構

使用 `nextIndex` / `previousIndex` 兩個陣列表示「目前仍存活元素」的相鄰關係，避免合併時做陣列刪除搬移。

```typescript
// 使用索引模擬鏈結串列，避免直接修改陣列結構
const nextIndex = new Int32Array(length);
const previousIndex = new Int32Array(length);

for (let index = 0; index < length; index++) {
  nextIndex[index] = index + 1;
  previousIndex[index] = index - 1;
}
nextIndex[length - 1] = -1;
```

### Step 3：初始化相鄰逆序對數量

先統計有多少個相鄰位置 `(i, i+1)` 使得 `nums[i] > nums[i+1]`。只要此數量為 0，陣列就是非遞減。

```typescript
// 計算相鄰逆序對數量，用來判斷何時已變為非遞減
let inversionCount = 0;
for (let index = 0; index + 1 < length; index++) {
  if (nums[index] > nums[index + 1]) {
    inversionCount++;
  }
}
```

### Step 4：初始化操作次數與存活元素數量

`aliveCount` 表示目前鏈結結構中仍有多少元素；每次合併會讓其減 1。

```typescript
let operationCount = 0;
let aliveCount = length;
```

### Step 5：在主迴圈中掃描所有存活相鄰對，找最左的最小相鄰和

依題意每次都必須選「相鄰和最小」且「最左」的那一對，因此需要掃描目前所有存活相鄰對。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // 掃描所有相鄰存活對，找最左的最小相鄰和
  let current = 0;
  let bestLeft = 0;
  let bestRight = nextIndex[0];
  let bestSum = nums[bestLeft] + nums[bestRight];

  while (true) {
    const left = current;
    const right = nextIndex[left];
    if (right === -1) {
      break;
    }

    const currentSum = nums[left] + nums[right];
    if (currentSum < bestSum) {
      bestSum = currentSum;
      bestLeft = left;
      bestRight = right;
    }

    current = right;
  }

  // ...
}
```

### Step 6：在主迴圈中移除合併前的逆序對貢獻

合併前，與 `(leftIndex, rightIndex)` 相關的相鄰關係將被改寫或刪除，因此先把這些舊的逆序對貢獻從 `inversionCount` 扣掉。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 5：在主迴圈中掃描所有存活相鄰對，找最左的最小相鄰和

  const leftIndex = bestLeft;
  const rightIndex = bestRight;

  const previousOfLeft = previousIndex[leftIndex];
  const nextOfRight = nextIndex[rightIndex];

  // 移除合併後將消失的逆序對貢獻
  if (previousOfLeft !== -1) {
    if (nums[previousOfLeft] > nums[leftIndex]) {
      inversionCount--;
    }
  }
  if (nums[leftIndex] > nums[rightIndex]) {
    inversionCount--;
  }
  if (nextOfRight !== -1) {
    if (nums[rightIndex] > nums[nextOfRight]) {
      inversionCount--;
    }
  }

  // ...
}
```

### Step 7：在主迴圈中合併並更新鏈結結構與計數

把合併結果寫回左節點位置，並將右節點自鏈結結構移除，同時更新 `aliveCount` 與 `operationCount`。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 5：在主迴圈中掃描所有存活相鄰對，找最左的最小相鄰和

  // Step 6：在主迴圈中移除合併前的逆序對貢獻

  // 將選中的相鄰對合併到左側位置
  nums[leftIndex] = bestSum;

  // 從鏈結串列中移除右節點
  nextIndex[leftIndex] = nextOfRight;
  if (nextOfRight !== -1) {
    previousIndex[nextOfRight] = leftIndex;
  }

  aliveCount--;
  operationCount++;

  // ...
}
```

### Step 8：在主迴圈中加入合併後新形成的逆序對貢獻

合併後，左節點值改變，會影響它與左右鄰居的相對大小，因此把新出現的逆序對貢獻加回 `inversionCount`。

```typescript
while (inversionCount > 0 && aliveCount > 1) {
  // Step 5：在主迴圈中掃描所有存活相鄰對，找最左的最小相鄰和

  // Step 6：在主迴圈中移除合併前的逆序對貢獻

  // Step 7：在主迴圈中合併並更新鏈結結構與計數

  // 加入合併後新產生的逆序對貢獻
  if (previousOfLeft !== -1) {
    if (nums[previousOfLeft] > nums[leftIndex]) {
      inversionCount++;
    }
  }
  if (nextOfRight !== -1) {
    if (nums[leftIndex] > nums[nextOfRight]) {
      inversionCount++;
    }
  }
}
```

### Step 9：回傳操作次數

當 `inversionCount` 變為 0（已非遞減）或只剩一個元素時，回傳累積的操作次數。

```typescript
return operationCount;
```

## 時間複雜度

- 建立鏈結索引陣列：一次 `for` 迴圈，時間為 $O(n)$，其中 `n` 為 `nums.length`。
- 初始計算相鄰逆序對：一次 `for` 迴圈，時間為 $O(n)$。
- 主迴圈每次合併使 `aliveCount` 減 1，因此最多執行 $(n - 1)$ 次。
- 每次主迴圈內，需要掃描目前存活的相鄰對以找最小和：若當次存活元素為 $k$，掃描成本為 $O(k)$。
- 因此總掃描成本為：$\sum_{k=2}^{n} O(k) = O\left(\sum_{k=2}^{n} k\right) = O(n^2)$。
- 其餘逆序對更新與鏈結更新皆為常數時間 $O(1)$（每次合併僅處理固定數量的鄰居關係）。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `nextIndex` 與 `previousIndex` 各為長度 `n` 的 `Int32Array`：總計 $O(n)$。
- 其他變數皆為常數額外空間 $O(1)$。
- 注意本演算法在原陣列 `nums` 上就地寫入合併結果，不額外建立與 `n` 同階的新數列。
- 總空間複雜度為 $O(n)$。

> $O(n)$
