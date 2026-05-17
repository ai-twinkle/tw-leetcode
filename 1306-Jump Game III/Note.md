# 1306. Jump Game III

Given an array of non-negative integers `arr`, 
you are initially positioned at `start` index of the array. 
When you are at index `i`, you can jump to `i + arr[i]` or `i - arr[i]`, check if you can reach any index with value 0.

Notice that you can not jump outside of the array at any time.

**Constraints:**

- `1 <= arr.length <= 5 * 10^4`
- `0 <= arr[i] < arr.length`
- `0 <= start < arr.length`

## 基礎思路

本題要求判斷從給定起點出發，能否透過不斷向前或向後跳躍，最終抵達某個值為 0 的位置。每一步只能選擇兩個方向，且不可跳出陣列邊界。

在思考解法時，可掌握以下核心觀察：

- **問題本質為圖的可達性問題**：
  每個索引位置是一個節點，從每個節點最多延伸出兩條邊（向前與向後），目標是判斷從起點是否存在一條路徑能抵達值為 0 的節點。

- **需要避免重複造訪同一節點**：
  若不記錄已拜訪的位置，在存在環狀路徑時演算法將陷入無限迴圈。需要一種能有效標記「已拜訪」的機制。

- **可以利用原始陣列本身做為拜訪標記**：
  由於陣列中的值皆為非負整數，可透過將拜訪過的元素取負來標記已造訪，省去額外的布林陣列空間；在演算法結束後再還原即可。

- **深度優先搜尋（DFS）適合此類問題**：
  使用堆疊模擬 DFS，能快速探索路徑並在找到目標時提早終止，無需遍歷整張圖。

依據以上特性，可以採用以下策略：

- **以手動堆疊實作 DFS**，逐步展開可達節點。
- **利用值取負的方式標記已拜訪節點**，同時記錄所有被標記的索引，以便演算法結束後完整還原輸入陣列。
- **在每次展開節點時，先檢查目標節點是否為 0**；若是則立即終止，否則僅將尚未拜訪的節點推入堆疊。

此策略能在不額外配置拜訪陣列的前提下完成搜尋，並確保輸入陣列在函式結束後維持原始狀態。

## 解題步驟

### Step 1：快速處理起點本身即為目標的情況

若起點位置的值已經是 0，則無須進行任何搜尋，直接回傳成功。

```typescript
// 立即處理最簡單的情況
if (arr[start] === 0) {
  return true;
}
```

### Step 2：初始化搜尋所需的堆疊與拜訪記錄結構

建立手動堆疊以取代遞迴，並準備一個陣列用來記錄所有被標記為已拜訪的索引，以便後續還原；接著將起點推入堆疊並將其標記為已拜訪。

```typescript
const arrayLength = arr.length;
// 使用具型別陣列作為手動堆疊以提升效能
const stack = new Int32Array(arrayLength);
let stackTop = 0;
stack[stackTop++] = start;

// 追蹤需要在結束後還原的已拜訪節點
const visitedIndices = new Int32Array(arrayLength);
let visitedCount = 0;

// 透過將起點的值取負來標記為已拜訪
arr[start] = -arr[start];
visitedIndices[visitedCount++] = start;
```

### Step 3：初始化結果旗標並開始 DFS，從堆疊取出當前節點並還原跳躍距離

使用 `result` 儲存最終答案；進入主迴圈後，每次從堆疊頂端取出一個節點，並透過對負值取負的方式還原其原始跳躍距離。

```typescript
let result = false;

while (stackTop > 0) {
  const currentIndex = stack[--stackTop];
  // 從已取負的值中還原原始跳躍距離
  const jumpDistance = -arr[currentIndex];

  // ...
}
```

### Step 4：嘗試向前跳躍並判斷是否抵達目標或加入堆疊

在邊界內嘗試向前跳躍：若目標位置的值為 0，則立即將結果設為成功並中斷；若目標尚未拜訪（值為正），則將其標記並推入堆疊。

```typescript
while (stackTop > 0) {
  // Step 3：取出節點並還原跳躍距離

  // 嘗試向前跳躍
  const forwardIndex = currentIndex + jumpDistance;
  if (forwardIndex < arrayLength) {
    const forwardValue = arr[forwardIndex];
    if (forwardValue === 0) {
      result = true;
      break;
    }
    // 僅在尚未拜訪時推入（正值代表未拜訪）
    if (forwardValue > 0) {
      arr[forwardIndex] = -forwardValue;
      visitedIndices[visitedCount++] = forwardIndex;
      stack[stackTop++] = forwardIndex;
    }
  }

  // ...
}
```

### Step 5：嘗試向後跳躍並判斷是否抵達目標或加入堆疊

在邊界內嘗試向後跳躍：與向前跳躍的邏輯相同，若目標值為 0 則立即成功中斷，否則僅推入尚未拜訪的節點。

```typescript
while (stackTop > 0) {
  // Step 3：取出節點並還原跳躍距離

  // Step 4：嘗試向前跳躍

  // 嘗試向後跳躍
  const backwardIndex = currentIndex - jumpDistance;
  if (backwardIndex >= 0) {
    const backwardValue = arr[backwardIndex];
    if (backwardValue === 0) {
      result = true;
      break;
    }
    if (backwardValue > 0) {
      arr[backwardIndex] = -backwardValue;
      visitedIndices[visitedCount++] = backwardIndex;
      stack[stackTop++] = backwardIndex;
    }
  }
}
```

### Step 6：還原所有被標記的陣列元素並回傳結果

搜尋結束後，遍歷所有記錄過的已拜訪索引，將其值取負以還原原始陣列，最後回傳結果。

```typescript
// 將輸入陣列還原至原始狀態
for (let i = 0; i < visitedCount; i++) {
  const idx = visitedIndices[i];
  arr[idx] = -arr[idx];
}

return result;
```

## 時間複雜度

- 設陣列長度為 $n$，每個索引最多被拜訪一次，拜訪時進行常數次操作；
- 還原階段最多遍歷 $n$ 個已拜訪節點；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 手動堆疊與已拜訪索引紀錄陣列，大小各最多為 $n$；
- 未使用任何遞迴或其他動態資料結構。
- 總空間複雜度為 $O(n)$。

> $O(n)$
