# 1298. Maximum Candies You Can Get from Boxes

You have n boxes labeled from `0` to `n - 1`. 
You are given four arrays: `status`, `candies`, `keys`, and containedBoxes where:

- `status[i]` is `1` if the $i^{th}$ box is open and `0` if the $i^{th}$ box is closed,
- `candies[i]` is the number of candies in the $i^{th}$ box,
- `keys[i]` is a list of the labels of the boxes you can open after opening the ith box.
- `containedBoxes[i]` is a list of the boxes you found inside the $i^{th}$ box.

You are given an integer array `initialBoxes` that contains the labels of the boxes you initially have. 
You can take all the candies in any open box and you can use the keys in it to open new boxes and you also can use the boxes you find in it.

Return the maximum number of candies you can get following the rules above.

**Constraints:**

- `n == status.length == candies.length == keys.length == containedBoxes.length`
- `1 <= n <= 1000`
- `status[i]` is either `0` or `1`.
- `1 <= candies[i] <= 1000`
- `0 <= keys[i].length <= n`
- `0 <= keys[i][j] < n`
- All values of `keys[i]` are unique.
- `0 <= containedBoxes[i].length <= n`
- `0 <= containedBoxes[i][j] < n`
- All values of `containedBoxes[i]` are unique.
- Each box is contained in one box at most.
- `0 <= initialBoxes.length <= n`
- `0 <= initialBoxes[i] < n`

## 基礎思路

本題的核心目標是透過動態地打開盒子來獲取最多糖果數量。我們需要系統性地處理以下幾個問題：

1. **盒子的狀態管理**：

    - 每個盒子可能處於開啟或關閉狀態，且可能需要鑰匙才能打開，因此必須即時追蹤我們是否已經發現盒子、取得鑰匙或已經打開盒子。
    - 若某個盒子暫時無法打開（缺少鑰匙），必須先暫時擱置，等取得鑰匙後再回頭處理。

2. **運用佇列動態管理待處理盒子**：

    - 我們透過一個固定大小的佇列來持續追蹤目前可以嘗試打開的盒子。
    - 每個盒子最多只會入隊兩次：初次發現或取得盒子時，以及取得該盒子鑰匙後解鎖時，藉此避免無效重複處理。

3. **即時累計糖果數量**：

    - 打開盒子時立即累計裡面的糖果數量，確保糖果總數在流程中及時更新。
    - 同時從開啟的盒子中取出新鑰匙和新盒子，並即時將新發現的盒子加入佇列進行下一步處理。

演算法反覆執行此流程直到無盒子可處理為止，此時累計的糖果總數即為題目要求的答案。

## 解題步驟

### Step 1：初始化盒子狀態與旗標陣列

為清楚管理盒子的各種狀態，需建立下列旗標陣列：

- `hasKey[i]`：記錄是否擁有盒子 `i` 的鑰匙。
- `visited[i]`：記錄是否已經開啟並處理盒子 `i`。
- `discovered[i]`：記錄是否已經取得盒子 `i`。
- `blocked[i]`：記錄盒子 `i` 是否因缺少鑰匙而暫時無法開啟。

```typescript
const boxCount = status.length;

const hasKey = new Uint8Array(boxCount);     // 已有盒子 i 的鑰匙
const visited = new Uint8Array(boxCount);    // 已經開啟盒子 i
const discovered = new Uint8Array(boxCount); // 已經發現盒子 i
const blocked = new Uint8Array(boxCount);    // 盒子 i 被阻塞等待鑰匙
```

### Step 2：建立佇列並加入初始盒子

建立一個大小為兩倍盒子數量的固定佇列，每個盒子最多入隊兩次（發現與解鎖）。透過 `head` 和 `tail` 管理佇列狀態，將所有初始盒子入隊：

```typescript
const queueCapacity = boxCount * 2;
const queue = new Int32Array(queueCapacity);
let head = 0;
let tail = 0;

// 將初始盒子加入佇列
for (let i = 0; i < initialBoxes.length; ++i) {
  const boxIndex = initialBoxes[i];
  if (discovered[boxIndex] === 0) {
    discovered[boxIndex] = 1;
    queue[tail++] = boxIndex;
  }
}
```

### Step 3：迴圈處理盒子並計算糖果總數

初始化糖果總數變數，開始迴圈處理佇列中的每個盒子：

- 每次從佇列頭取出一個盒子進行處理。
- 若該盒子已經處理過，跳過。
- 若盒子是封閉且尚無鑰匙，暫時阻塞該盒子。
- 若盒子可開啟，則立即累計糖果數。

```typescript
let totalCandies = 0;

while (head < tail) {
  const currentBoxIndex = queue[head++];

  if (visited[currentBoxIndex] === 1) {
    continue;  // 已經開過，不需再處理
  }

  if (status[currentBoxIndex] === 0 && hasKey[currentBoxIndex] === 0) {
    blocked[currentBoxIndex] = 1;  // 暫時無法開啟
    continue;
  }

  visited[currentBoxIndex] = 1;  // 標記已開啟
  totalCandies += candies[currentBoxIndex];  // 累計糖果
  
  // ...
}
```

### Step 4：收集盒內鑰匙並重新處理被阻塞盒子

從開啟的盒子中取出所有鑰匙，並更新已擁有的鑰匙狀態：

- 若取得的鑰匙是之前未取得的，且對應的盒子先前曾被阻塞，將該盒子重新加入佇列，準備再次處理。

```typescript
while (head < tail) {
  // Step 3：迴圈處理盒子並計算糖果總數

  const containedKeys = keys[currentBoxIndex];

  for (let ki = 0; ki < containedKeys.length; ++ki) {
    const targetBox = containedKeys[ki];

    if (hasKey[targetBox] === 0) {
      hasKey[targetBox] = 1;  // 更新鑰匙狀態

      if (blocked[targetBox] === 1) {
        queue[tail++] = targetBox;  // 解鎖被阻塞盒子
      }
    }
  }

  // ...
}
```

### Step 5：處理盒內新發現的盒子

再將盒子中包含的所有新發現盒子加入佇列：

- 若該新盒子之前尚未發現，立即加入佇列。

```typescript
while (head < tail) {
  // Step 3：迴圈處理盒子並計算糖果總數
  
  // Step 4：收集盒內鑰匙並重新處理被阻塞盒子
  
  const innerBoxes = containedBoxes[currentBoxIndex];

  for (let bi = 0; bi < innerBoxes.length; ++bi) {
    const newBox = innerBoxes[bi];

    if (discovered[newBox] === 0) {
      discovered[newBox] = 1;  // 標記為已發現
      queue[tail++] = newBox;  // 加入佇列等待處理
    }
  }
}
```

### Step 6：迴圈結束，返回結果

當佇列完全處理完畢（`head >= tail`）後，即可回傳最終累計的糖果總數：

```typescript
return totalCandies;
```

## 時間複雜度

- 設 $n$ 為盒子數量，$m$ 為所有鑰匙與內含盒子總數，即
  - $m = \sum_i |\,keys[i]\,| + \sum_i |\,containedBoxes[i]\,|.$
- 每個盒子最多會被加入佇列兩次（初次發現、及取得鑰匙後再次加入），所以盒子相關操作為 $O(n)$。
- 處理所有鑰匙與內含盒子的操作合計為 $O(m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 需要四個大小為 $n$ 的旗標陣列 (`hasKey`, `visited`, `discovered`, `blocked`)。
- 佇列最大容量為 $2n$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
