# 1340. Jump Game V

Given an array of integers `arr` and an integer `d`. 
In one step you can jump from index `i` to index:

- `i + x` where: `i + x < arr.length` and  `0 < x <= d`.
- `i - x` where: `i - x >= 0` and  `0 < x <= d`.

In addition, you can only jump from index `i` to index `j` if `arr[i] > arr[j]` and `arr[i] > arr[k]` 
for all indices `k` between `i` and `j` (More formally `min(i, j) < k < max(i, j)`).

You can choose any index of the array and start jumping. 
Return the maximum number of indices you can visit.

Notice that you can not jump outside of the array at any time.

**Constraints:**

- `1 <= arr.length <= 1000`
- `1 <= arr[i] <= 10^5`
- `1 <= d <= arr.length`

## 基礎思路

本題要求在一維陣列上模擬跳躍規則：從某一索引位置，可以向左或向右跳躍最多 `d` 步，但跳躍時必須滿足「起點高於終點」，並且「起點與終點之間的所有元素都必須嚴格低於起點」。最終要找出從任意起始索引出發，最多能訪問多少個位置。

在思考解法時，可掌握以下核心觀察：

- **跳躍方向具有「高處往低處」的單調性**：
  任意一次合法跳躍都是從較大值跳到較小值，因此若以「值的高低」作為依賴關係，較小值的結果必定先於較大值決定。

- **問題具有最優子結構**：
  從某索引出發能訪問的最大數量，等於該索引本身加上所有可達鄰居中最長鏈的長度，可以用動態規劃進行轉移。

- **跳躍範圍受到中間阻擋限制**：
  向任一方向掃描時，一旦遇到「值大於或等於當前值」的索引，後續位置就被阻擋，無須再往更遠處檢查。

- **依賴順序由值的大小自然決定**：
  若以值由小到大依序處理每個索引，則計算某索引的結果時，其所有可達的較小值鄰居皆已完成計算，無需遞迴。

依據以上特性，可以採用以下策略：

- **將所有索引依其對應的數值由小到大排序**，作為動態規劃的處理順序。
- **對每個索引向左、向右各掃描至多 `d` 步**，途中遇到阻擋立即中止，並蒐集合法鄰居中已計算好的最佳結果。
- **以「鄰居最佳結果 + 1」更新當前索引的可訪問數量**，同時維護全域最大值。

此策略能以由小到大的拓撲順序，將遞迴依賴轉化為線性掃描，安全地完成整個動態規劃過程。

## 解題步驟

### Step 1：建立輸入快取並計算基本參數

先記錄陣列長度，並將輸入複製到型別化陣列以加速後續的密集存取。

```typescript
const arrayLength = arr.length;

// 將輸入複製到型別化陣列以加速重複存取
const values = new Int32Array(arr);
```

### Step 2：將「值與索引」打包成單一數字以便排序

由於排序時需同時保留值與其原始索引，將值放入高位、索引放入低位（陣列長度上限為 1000，故索引可安全使用 10 位元表示），即可透過單一數值排序同時達成。

```typescript
// 將 (值, 索引) 打包成單一數字以便高效排序
// 值佔高位，索引佔低 10 位元（因 arrayLength <= 1000 < 1024）
const packedPairs = new Float64Array(arrayLength);
for (let index = 0; index < arrayLength; index++) {
  packedPairs[index] = values[index] * 1024 + index;
}
```

### Step 3：依值由小到大排序

排序後即可依此順序處理每個索引，確保每次計算時，所有可達的較小值鄰居都已完成更新。

```typescript
// 由小到大排序：先處理較小值，使其依賴先準備好
packedPairs.sort();
```

### Step 4：初始化動態規劃陣列與全域最大值

`dp[i]` 表示從索引 `i` 出發可訪問的最大索引數量（包含自身）；至少能訪問自身一個位置，因此全域最大值預設為 1。

```typescript
// dp[i] = 從索引 i 出發可訪問的最大索引數量（包含自身）
const dp = new Int32Array(arrayLength);

let globalMaximum = 1;
```

### Step 5：依排序順序取出當前索引並準備處理

依排序後的順序逐一處理每個索引，從打包的數值中還原出原始索引與其對應的值，並準備一個變數紀錄此索引可達鄰居中的最佳 dp 值。

```typescript
// 依值由小到大的順序處理每個索引
for (let order = 0; order < arrayLength; order++) {
  const currentIndex = packedPairs[order] & 1023;
  const currentValue = values[currentIndex];

  // 紀錄所有可達目的地中最佳的 dp 值
  let bestReachableDp = 0;

  // ...
}
```

### Step 6：向右掃描合法鄰居並更新最佳 dp

從當前索引往右掃描至多 `d` 步，一旦遇到值大於或等於 `currentValue` 的位置即視為阻擋並中止；途中遇到合法鄰居則更新最佳 dp。

```typescript
for (let order = 0; order < arrayLength; order++) {
  // Step 5：取出當前索引、值並初始化 bestReachableDp

  // 向右掃描：當距離超過 d 或遇到值 >= currentValue 的阻擋時停止
  const rightLimit = currentIndex + d < arrayLength ? currentIndex + d : arrayLength - 1;
  for (let neighbor = currentIndex + 1; neighbor <= rightLimit; neighbor++) {
    // 阻擋：arr[neighbor] >= currentValue 表示無法跳過或跳上此位置
    if (values[neighbor] >= currentValue) {
      break;
    }
    if (dp[neighbor] > bestReachableDp) {
      bestReachableDp = dp[neighbor];
    }
  }

  // ...
}
```

### Step 7：向左掃描合法鄰居並更新最佳 dp

以相同的阻擋規則向左掃描至多 `d` 步，蒐集可達鄰居中已完成計算的最佳 dp 值。

```typescript
for (let order = 0; order < arrayLength; order++) {
  // Step 5：取出當前索引、值並初始化 bestReachableDp

  // Step 6：向右掃描合法鄰居

  // 以相同的阻擋規則向左掃描
  const leftLimit = currentIndex - d > 0 ? currentIndex - d : 0;
  for (let neighbor = currentIndex - 1; neighbor >= leftLimit; neighbor--) {
    if (values[neighbor] >= currentValue) {
      break;
    }
    if (dp[neighbor] > bestReachableDp) {
      bestReachableDp = dp[neighbor];
    }
  }

  // ...
}
```

### Step 8：寫回當前索引的 dp 值並更新全域最大值

當前索引本身貢獻 1，再加上可達鄰居中最長的鏈即為其結果；同時與全域最大值比較並更新。

```typescript
for (let order = 0; order < arrayLength; order++) {
  // Step 5：取出當前索引、值並初始化 bestReachableDp

  // Step 6：向右掃描合法鄰居

  // Step 7：向左掃描合法鄰居

  // 當前索引貢獻 1，加上任一可達鄰居中最長的鏈
  const currentDp = bestReachableDp + 1;
  dp[currentIndex] = currentDp;

  if (currentDp > globalMaximum) {
    globalMaximum = currentDp;
  }
}
```

### Step 9：回傳全域最大訪問數量

所有索引處理完畢後，`globalMaximum` 即為任意起點所能達到的最大訪問數量。

```typescript
return globalMaximum;
```

## 時間複雜度

- 打包與初始化階段為 $O(n)$；
- 排序所有索引耗費 $O(n \log n)$；
- 主迴圈處理每個索引時，向左與向右各掃描至多 `d` 步，共 $O(n \times d)$；
- 總時間複雜度為 $O(n \log n + n \times d)$。

> $O(n \log n + n \times d)$

## 空間複雜度

- `values`、`packedPairs`、`dp` 三個型別化陣列各佔 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
