# 3453. Separate Squares I

You are given a 2D integer array `squares`. 
Each `squares[i] = [x_i, y_i, l_i]` represents the coordinates of the bottom-left point and the side length of a square parallel to the x-axis.

Find the minimum y-coordinate value of a horizontal line such that the total area of the squares above the line equals the total area of the squares below the line.

Answers within `10^-5` of the actual answer will be accepted.

Note: Squares may overlap. Overlapping areas should be counted multiple times.

**Constraints:**

- `1 <= squares.length <= 5 * 10^4`
- `squares[i] = [x_i, y_i, l_i]`
- `squares[i].length == 3`
- `0 <= x_i, y_i <= 10^9`
- `1 <= l_i <= 10^9`
- The total area of all the squares will not exceed `10^12`.

## 基礎思路

本題給定多個與 x 軸平行的正方形 `squares[i] = [x_i, y_i, l_i]`，我們要找一條水平線 `y = Y`，使得所有正方形「線下的總計數面積」等於「線上的總計數面積」。題目特別強調：正方形可能重疊，且重疊區域要被重複計算，因此每個正方形的面積貢獻可以直接相加，不需要做幾何去重或聯集運算。

關鍵觀察是：把 `Y` 從下往上移動時，「線下面積」會隨高度單調不減，並呈現分段線性：

* 對單一正方形而言，當 `Y` 位於其高度區間內時，線下面積會以固定速率線性增加；超出頂邊後不再增加。
* 把所有正方形加總後，線下面積仍是單調不減的分段線性函數。

因此可以使用掃描線（sweep line）的概念來解此題：

* 將每個正方形轉成兩個 y 事件：在底邊高度讓面積增長速率增加，在頂邊高度讓增長速率減少。
* 將所有事件依 y 座標排序後自下而上掃描：

    * 相鄰事件高度之間，增長速率固定，線下面積增量為「速率 × 高度差」。
    * 一旦累積面積跨過總面積的一半，就能在該高度區間內用線性比例精確求出 `Y`。

## 解題步驟

### Step 1：初始化 `sortEventsByYCoordinate` 並處理極端情況

先取得事件數量，若長度小於等於 1 代表已排序完成，直接返回。

```ts
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  const length = yEventArray.length;
  if (length <= 1) {
    return;
  }

  // ...
}
```

### Step 2：建立手動堆疊並推入初始排序區間

使用固定大小陣列作為區間堆疊，避免遞迴造成呼叫堆疊問題，並先把整段區間推入堆疊等待處理。

```ts
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  // Step 1：初始化 `sortEventsByYCoordinate` 並處理極端情況

  // 因為總是把較大的分割推入堆疊，堆疊深度可被限制在 O(log n)
  const leftIndexStack = new Int32Array(64);
  const rightIndexStack = new Int32Array(64);

  let stackSize = 0;
  leftIndexStack[stackSize] = 0;
  rightIndexStack[stackSize] = length - 1;
  stackSize++;

  // ...
}
```

### Step 3：外層 while 迴圈 — 取出待排序區間並處理

每次從堆疊取出一段 `[leftIndex, rightIndex]` 區間，接著在該區間內進行分割與交換，直到此區間排序完成。

```ts
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  // Step 1：初始化 `sortEventsByYCoordinate` 並處理極端情況
  
  // Step 2：建立手動堆疊並推入初始排序區間

  while (stackSize !== 0) {
    stackSize--;
    let leftIndex = leftIndexStack[stackSize];
    let rightIndex = rightIndexStack[stackSize];

    // ...
  }
}
```

### Step 4：內層 while 迴圈 — 選 pivot 並同步交換兩陣列完成 partition

在當前區間內選取 pivot，透過左右指標掃描並交換元素，使資料依 pivot 分割；交換時必須同步交換 `yEventArray` 與 `slopeDeltaArray`，以維持事件與斜率變化量配對一致。

```ts
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  // Step 1：初始化 `sortEventsByYCoordinate` 並處理極端情況
  
  // Step 2：建立手動堆疊並推入初始排序區間

  while (stackSize !== 0) {
    // Step 3：外層 while 迴圈 — 取出待排序區間並處理

    while (leftIndex < rightIndex) {
      const pivotValue = yEventArray[(leftIndex + rightIndex) >>> 1];

      let leftPointer = leftIndex;
      let rightPointer = rightIndex;

      while (leftPointer <= rightPointer) {
        while (yEventArray[leftPointer] < pivotValue) {
          leftPointer++;
        }
        while (yEventArray[rightPointer] > pivotValue) {
          rightPointer--;
        }

        if (leftPointer <= rightPointer) {
          const yTemporary = yEventArray[leftPointer];
          yEventArray[leftPointer] = yEventArray[rightPointer];
          yEventArray[rightPointer] = yTemporary;

          const slopeDeltaTemporary = slopeDeltaArray[leftPointer];
          slopeDeltaArray[leftPointer] = slopeDeltaArray[rightPointer];
          slopeDeltaArray[rightPointer] = slopeDeltaTemporary;

          leftPointer++;
          rightPointer--;
        }
      }

      // ...
    }
  }
}
```

### Step 5：比較左右分割大小並控制堆疊深度

計算左右分割的大小，將較大的分割推入堆疊，較小的分割留在當前迴圈立刻處理，以避免堆疊深度過大。

```ts
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  // Step 1：初始化 `sortEventsByYCoordinate` 並處理極端情況
  
  // Step 2：建立手動堆疊並推入初始排序區間

  while (stackSize !== 0) {
    // Step 3：外層 while 迴圈 — 取出待排序區間並處理

    while (leftIndex < rightIndex) {
      // Step 4：內層 while 迴圈 — 選 pivot 並同步交換兩陣列完成 partition

      // 先立即處理較小分割，較大分割推入堆疊
      const leftPartitionSize = rightPointer - leftIndex;
      const rightPartitionSize = rightIndex - leftPointer;

      if (leftPartitionSize < rightPartitionSize) {
        if (leftPointer < rightIndex) {
          leftIndexStack[stackSize] = leftPointer;
          rightIndexStack[stackSize] = rightIndex;
          stackSize++;
        }
        rightIndex = rightPointer;
      } else {
        if (leftIndex < rightPointer) {
          leftIndexStack[stackSize] = leftIndex;
          rightIndexStack[stackSize] = rightPointer;
          stackSize++;
        }
        leftIndex = leftPointer;
      }
    }
  }
}
```

### Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數

每個正方形會產生兩個事件，因此事件總數為 `2 * squareCount`；建立 `yEventArray` 與 `slopeDeltaArray` 存放事件資訊，並初始化總面積與寫入索引。

```ts
function separateSquares(squares: number[][]): number {
  const squareCount = squares.length;
  const totalEventCount = squareCount + squareCount;

  // 每個正方形兩個事件：在 y 開始 (+sideLength)，在 y + sideLength 結束 (-sideLength)
  const yEventArray = new Float64Array(totalEventCount);
  const slopeDeltaArray = new Float64Array(totalEventCount);

  let eventWriteIndex = 0;
  let totalArea = 0;

  // ...
}
```

### Step 7：建立所有事件並累加總面積

逐一處理每個正方形，將其底邊與頂邊轉為事件寫入陣列，同時累加總面積 `sideLength * sideLength`。

```ts
function separateSquares(squares: number[][]): number {
  // Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數

  for (let squareIndex = 0; squareIndex < squareCount; squareIndex++) {
    const square = squares[squareIndex];
    const yStart = square[1];
    const sideLength = square[2];
    const yEnd = yStart + sideLength;

    yEventArray[eventWriteIndex] = yStart;
    slopeDeltaArray[eventWriteIndex] = sideLength;
    eventWriteIndex++;

    yEventArray[eventWriteIndex] = yEnd;
    slopeDeltaArray[eventWriteIndex] = -sideLength;
    eventWriteIndex++;

    totalArea += sideLength * sideLength;
  }

  // ...
}
```

### Step 8：排序事件並設定目標與初始掃描狀態

先排序所有事件，接著將目標設定為總面積的一半，並初始化掃描過程需要的累積面積、當前斜率與起始高度。

```ts
function separateSquares(squares: number[][]): number {
  // Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數
  
  // Step 7：建立所有事件並累加總面積

  sortEventsByYCoordinate(yEventArray, slopeDeltaArray);

  const targetAreaBelow = totalArea * 0.5;

  let accumulatedAreaBelow = 0;
  let currentSlope = 0;
  let currentY = yEventArray[0];

  let eventReadIndex = 0;

  // ...
}
```

### Step 9：外層 while 迴圈 — 掃描相鄰事件高度區間

以事件為分界由下往上掃描，每次取出下一個事件高度 `yAtEvent`，並計算與目前高度 `currentY` 的差 `deltaY` 以取得區間高度。

```ts
function separateSquares(squares: number[][]): number {
  // Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數
  
  // Step 7：建立所有事件並累加總面積
  
  // Step 8：排序事件並設定目標與初始掃描狀態

  while (eventReadIndex < totalEventCount) {
    const yAtEvent = yEventArray[eventReadIndex];
    const deltaY = yAtEvent - currentY;

    // ...
  }

  // ...
}
```

### Step 10：在 while 內計算區間面積並命中目標時線性內插回傳

若存在高度區間（`deltaY !== 0`），則該段的面積增量為 `currentSlope * deltaY`；當累積面積跨過目標時，使用 `remainingAreaNeeded / currentSlope` 進行線性內插求得答案。

```ts
function separateSquares(squares: number[][]): number {
  // Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數
  
  // Step 7：建立所有事件並累加總面積
  
  // Step 8：排序事件並設定目標與初始掃描狀態

  while (eventReadIndex < totalEventCount) {
    // Step 9：外層 while 迴圈 — 掃描相鄰事件高度區間

    const yAtEvent = yEventArray[eventReadIndex];
    const deltaY = yAtEvent - currentY;

    if (deltaY !== 0) {
      // 這段區間新增的面積為線性：斜率 * 高度差
      const intervalArea = currentSlope * deltaY;

      if (currentSlope !== 0 && accumulatedAreaBelow + intervalArea >= targetAreaBelow) {
        const remainingAreaNeeded = targetAreaBelow - accumulatedAreaBelow;
        return currentY + remainingAreaNeeded / currentSlope;
      }

      accumulatedAreaBelow += intervalArea;
      currentY = yAtEvent;

      if (accumulatedAreaBelow >= targetAreaBelow) {
        return currentY;
      }
    }

    // ...
  }

  // ...
}
```

### Step 11：合併同高度事件更新斜率並回傳保底值

把所有相同 `yAtEvent` 的事件斜率變化量合併為 `mergedSlopeDelta`，更新 `currentSlope`，並在掃描結束後回傳保底 `currentY`。

```ts
function separateSquares(squares: number[][]): number {
  // Step 6：初始化 `separateSquares` 的事件陣列與面積累積變數
  
  // Step 7：建立所有事件並累加總面積
  
  // Step 8：排序事件並設定目標與初始掃描狀態

  while (eventReadIndex < totalEventCount) {
    // Step 9：外層 while 迴圈 — 掃描相鄰事件高度區間
    
    // Step 10：在 while 內計算區間面積並命中目標時線性內插回傳

    const yAtEvent = yEventArray[eventReadIndex];
    const deltaY = yAtEvent - currentY;

    if (deltaY !== 0) {
      const intervalArea = currentSlope * deltaY;

      if (currentSlope !== 0 && accumulatedAreaBelow + intervalArea >= targetAreaBelow) {
        const remainingAreaNeeded = targetAreaBelow - accumulatedAreaBelow;
        return currentY + remainingAreaNeeded / currentSlope;
      }

      accumulatedAreaBelow += intervalArea;
      currentY = yAtEvent;

      if (accumulatedAreaBelow >= targetAreaBelow) {
        return currentY;
      }
    }

    // 將相同 y 的所有斜率變化量合併，以降低迴圈開銷
    let mergedSlopeDelta = 0;
    while (eventReadIndex < totalEventCount && yEventArray[eventReadIndex] === yAtEvent) {
      mergedSlopeDelta += slopeDeltaArray[eventReadIndex];
      eventReadIndex++;
    }

    currentSlope += mergedSlopeDelta;
  }

  // 數值邊界情況的保底回傳（理論上有效輸入不會需要）
  return currentY;
}
```

## 時間複雜度

- 設正方形數量為 $n$，事件數量為 $m = 2n$。
- 建立事件與總面積累加：走訪 $n$ 次，為 $O(n)$。
- 事件排序使用快速排序：最壞情況為 $O(m^2)$，也就是 $O(n^2)$。
- 掃描事件：
  - 外層 `while` 搭配合併相同 y 的內層 `while`，指標 `eventReadIndex` 從 0 只會遞增到 $m$，總計為 $O(m)$，也就是 $O(n)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `yEventArray` 與 `slopeDeltaArray` 各長度 $m = 2n$，合計 $O(n)$。
- 快速排序的手動堆疊使用固定大小陣列（`Int32Array(64)`），為 $O(1)$。
- 其餘變數為常數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
