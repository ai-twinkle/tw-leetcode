# 2058. Find the Minimum and Maximum Number of Nodes Between Critical Points

A critical point in a linked list is defined as either a local maxima or a local minima.

A node is a local maxima if the current node has a value strictly greater than the previous node and the next node.

A node is a local minima if the current node has a value strictly smaller than the previous node and the next node.

Note that a node can only be a local maxima/minima if there exists both a previous node and a next node.

Given a linked list `head`, return an array of length 2 containing `[minDistance, maxDistance]` 
where `minDistance` is the minimum distance 
between any two distinct critical points and `maxDistance` is the maximum distance between any two distinct critical points. 
If there are fewer than two critical points, return `[-1, -1]`.

**Constraints:**

- The number of nodes in the list is in the range `[2, 10^5]`.
- `1 <= Node.val <= 10^5`

## 基礎思路

本題要求在一條單向鏈結串列中找出所有臨界點（局部極大值或局部極小值），並回傳任意兩個相異臨界點之間的最小距離與最大距離；
若臨界點不足兩個則回傳 `[-1, -1]`。由於節點數量最多可達 $10^5$，必須以單次線性走訪完成，不能反覆回頭掃描。

在思考解法時，可掌握以下核心觀察：

- **臨界點的判定僅依賴局部三個相鄰值**：
  一個節點是否為臨界點，只與它自己、前一個、後一個的數值有關，因此走訪時只要隨時掌握這三者即可即時判定，無須任何額外儲存。

- **極大與極小可用差值方向統一判斷**：
  將當前值分別減去前值與後值，若兩個差值皆不為零且方向一致（同時為正或同時為負），即代表當前值同時大於或同時小於兩側鄰居，正是臨界點的定義，可將兩種情況合併為單一條件。

- **最小距離必定發生在相鄰的兩個臨界點之間**：
  若兩個臨界點之間還夾著另一個臨界點，則其距離必然更大，因此只需在遇到新臨界點時與上一個臨界點比較即可，不必兩兩枚舉。

- **最大距離必定是首尾兩個臨界點之間的跨度**：
  距離隨兩端往外擴張而增大，故只需記錄第一個與最後一個臨界點的位置。

- **頭尾節點永遠不可能是臨界點**：
  因為臨界點必須同時存在前後鄰居，所以節點數少於三個時可直接判定無解。

依據以上特性，可以採用以下策略：

- **以單次走訪推進，並將前一個值保留在區域狀態中**，避免在單向串列中無法回頭的問題，也省去重複解參考的成本。
- **每經過一個具備前後鄰居的節點就即時判定是否為臨界點**，並在判定成立時同步更新首個位置、上一個位置與相鄰最小距離。
- **走訪結束後，以首尾位置是否相同判斷臨界點是否足夠**，足夠則直接回傳累積的最小距離與首尾跨度。

此策略只需一次線性掃描與常數個變數，即可同時求得兩項答案。

## 解題步驟

### Step 1：快速排除節點數不足的情況

臨界點必須同時擁有前後鄰居，因此當串列不足三個節點時，必然不存在任何臨界點，可直接回傳無解。

```typescript
// 臨界點需要前後兩個鄰居，因此少於三個節點的串列會被立即排除
if (head === null || head.next === null || head.next.next === null) {
  return [-1, -1];
}
```

### Step 2：初始化走訪所需的狀態

從第二個節點開始檢查，因此先記下第一個節點的值作為「前一個值」，並將目前節點、目前節點的值與目前位置索引一併備妥。

```typescript
let previousValue = head.val;
let currentNode = head.next;
let currentValue = currentNode.val;
let currentIndex = 1;
```

### Step 3：初始化臨界點的紀錄變數

分別以三個變數記錄第一個臨界點的位置、最後一個臨界點的位置，以及目前已知的最小相鄰距離；最小距離先設為極大值，代表尚未找到任何一對臨界點。

```typescript
let firstCriticalIndex = -1;
let lastCriticalIndex = -1;
let minimumDistance = 0x7fffffff;
```

### Step 4：走訪串列並計算與前後鄰居的差值

只要目前節點仍有後繼節點，就代表它具備前後鄰居，可進行判定。每一輪先取出後繼節點的值，再分別計算目前值與前值、後值的差，作為判定臨界點的依據。

```typescript
// 走訪串列一次，將前一個值保留在暫存變數中，避免向後回溯取值
while (currentNode.next !== null) {
  const nextNode = currentNode.next;
  const nextValue = nextNode.val;

  // 當節點為局部極大或極小時，兩個差值恰好具有相同的嚴格正負號
  const leftDifference = currentValue - previousValue;
  const rightDifference = currentValue - nextValue;

  // ...
}
```

### Step 5：判定臨界點並更新首個位置與最小距離

當兩個差值皆不為零且正負號一致時即為臨界點。若這是第一個臨界點，只需記下位置以固定最大跨度的左端；否則與上一個臨界點的距離即為一組候選，用以更新最小距離。無論何者，最後都要把目前位置設為最新的臨界點位置。

```typescript
while (currentNode.next !== null) {
  // Step 4：取得後繼節點並計算前後差值

  if (leftDifference !== 0 && rightDifference !== 0 && (leftDifference ^ rightDifference) >= 0) {
    if (lastCriticalIndex < 0) {
      // 第一個臨界點僅用於固定最大跨度的左端
      firstCriticalIndex = currentIndex;
    } else {
      // 距離最近的一對必定是兩個相鄰的臨界點
      const neighbourDistance = currentIndex - lastCriticalIndex;

      if (neighbourDistance < minimumDistance) {
        minimumDistance = neighbourDistance;
      }
    }

    lastCriticalIndex = currentIndex;
  }

  // ...
}
```

### Step 6：推進走訪狀態至下一個節點

判定完畢後，將前值、目前值、目前節點與位置索引整體往後移動一格，進入下一輪判定。

```typescript
while (currentNode.next !== null) {
  // Step 4：取得後繼節點並計算前後差值

  // Step 5：判定臨界點並更新紀錄

  previousValue = currentValue;
  currentValue = nextValue;
  currentNode = nextNode;
  currentIndex++;
}
```

### Step 7：檢查臨界點數量是否足夠

若完全沒有臨界點，兩個位置變數皆維持初始值；若只有一個臨界點，兩者也會相同。因此只要首尾位置相等，就代表臨界點不足兩個，回傳無解。

```typescript
// 零個或僅一個臨界點時，兩個索引會維持相等
if (firstCriticalIndex === lastCriticalIndex) {
  return [-1, -1];
}
```

### Step 8：回傳最小距離與最大跨度

臨界點足夠時，最小距離已於走訪過程中累積完成，最大距離則為最後一個與第一個臨界點的位置差，直接組合回傳。

```typescript
return [minimumDistance, lastCriticalIndex - firstCriticalIndex];
```

## 時間複雜度

- 前置的長度檢查與初始化皆為常數時間；
- 主迴圈對每個節點僅走訪一次，且每輪內部只進行常數次比較與賦值；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的數值與節點參考變數，不隨節點數成長；
- 未配置任何額外陣列或遞迴堆疊；
- 總空間複雜度為 $O(1)$。

> $O(1)$
