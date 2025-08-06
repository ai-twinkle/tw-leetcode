# 3479. Fruits Into Baskets III

You are given two arrays of integers, `fruits` and `baskets`, each of length `n`, 
where `fruits[i]` represents the quantity of the $i^{th}$ type of fruit, and `baskets[j]` represents the capacity of the $j^{th}$ basket.

From left to right, place the fruits according to these rules:

- Each fruit type must be placed in the leftmost available basket with a capacity greater than or equal to the quantity of that fruit type.
- Each basket can hold only one type of fruit.
- If a fruit type cannot be placed in any basket, it remains unplaced.

Return the number of fruit types that remain unplaced after all possible allocations are made.

**Constraints:**

- `n == fruits.length == baskets.length`
- `1 <= n <= 10^5`
- `1 <= fruits[i], baskets[i] <= 10^9`

## 基礎思路

本題的核心策略是透過線段樹（Segment Tree）這個資料結構，有效地管理並追蹤每個籃子的剩餘容量。
題目的關鍵要求為每種水果必須優先放置在「最左邊」能夠容納該水果的籃子中，因此我們需要快速地：

- 查詢：當前最左邊且容量足夠的籃子。
- 更新：放入水果後即刻更新該籃子的剩餘容量，並將變動及時反映到後續查詢中。

因此，我們將使用線段樹來實現這些操作，具體步驟如下：

- 建立一個線段樹，其中每個節點代表一個區間內籃子的最大剩餘容量。
- 依序嘗試放置每種水果，透過線段樹高效尋找合適的籃子，若不存在則標記為未放置。
- 及時更新樹結構，保持資訊正確性。

## 解題步驟

### Step 1：初始化線段樹與邊界處理

首先確認水果種類數量，並針對無水果時直接回傳 0 處理：

```typescript
const fruitTypesCount = fruits.length;
if (fruitTypesCount === 0) {
  return 0;
}
```

### Step 2：計算線段樹葉節點數量

接著決定線段樹葉節點的數量，確保為大於等於水果數的最小 2 的冪次，以便樹結構完整：

```typescript
let treeLeafCount = 1;
while (treeLeafCount < fruitTypesCount) {
  treeLeafCount <<= 1;
}
```

### Step 3：建立線段樹並填入籃子容量

建立線段樹陣列，並將所有籃子的容量依序複製到葉節點位置：

```typescript
const totalTreeSize = treeLeafCount << 1;
const segmentTree = new Uint32Array(totalTreeSize);
const leafStartIndex = treeLeafCount;

// 快速將籃子容量填入樹的葉節點
segmentTree.set(baskets, leafStartIndex);
```

### Step 4：構建線段樹內部節點（自底向上）

由下往上依序更新內部節點，每個節點儲存其兩個子節點的最大值，代表該區間最大可用容量：

```typescript
for (let nodeIndex = leafStartIndex - 1; nodeIndex > 0; --nodeIndex) {
  const leftVal = segmentTree[nodeIndex << 1];
  const rightVal = segmentTree[(nodeIndex << 1) + 1];
  segmentTree[nodeIndex] = leftVal > rightVal ? leftVal : rightVal;
}
```

### Step 5：逐一放置水果並及時更新線段樹

依序處理每種水果，利用線段樹快速找到最左邊符合條件的籃子，放置後及時將容量歸零並向上更新最大值：

```typescript
let unplacedFruitCount = 0;
for (let fruitIndex = 0; fruitIndex < fruitTypesCount; ++fruitIndex) {
  const requiredQuantity = fruits[fruitIndex];

  // 若線段樹根節點不足，代表無法放置
  if (segmentTree[1] < requiredQuantity) {
    unplacedFruitCount++;
    continue;
  }

  // 自樹根向下搜尋最左可用的籃子
  let currentNodeIndex = 1;
  while (currentNodeIndex < leafStartIndex) {
    const leftChildIndex = currentNodeIndex << 1;
    currentNodeIndex =
      segmentTree[leftChildIndex] >= requiredQuantity
        ? leftChildIndex
        : leftChildIndex + 1;
  }

  // 標記該籃子已使用（容量設為 0）
  segmentTree[currentNodeIndex] = 0;

  // 向上更新樹上所有相關區間的最大值
  let parentIndex = currentNodeIndex >> 1;
  while (parentIndex > 0) {
    const leftVal = segmentTree[parentIndex << 1];
    const rightVal = segmentTree[(parentIndex << 1) + 1];
    segmentTree[parentIndex] = leftVal > rightVal ? leftVal : rightVal;
    parentIndex >>= 1;
  }
}
```

### Step 6：返回未放置水果的數量

最後回傳未能成功放置的水果種類數：

```typescript
return unplacedFruitCount;
```

## 時間複雜度

- 建立線段樹的過程需遍歷每個節點，耗時 $O(n)$。
- 放置每個水果需進行樹上查詢與更新，單次查詢與更新皆為 $O(\log n)$，共 $n$ 種水果，合計 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 線段樹儲存容量的陣列大小與葉節點相關，最多佔用 $O(2n)$ 空間。
- 其他額外輔助變數僅使用常數空間 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
