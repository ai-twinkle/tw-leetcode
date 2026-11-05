# 1385. Find the Distance Value Between Two Arrays

Given two integer arrays `arr1` and `arr2`, and the integer `d`, 
return the distance value between the two arrays.

The distance value is defined as the number of elements `arr1[i]` 
such that there is not any element `arr2[j]` where `|arr1[i]-arr2[j]| <= d`.

**Constraints:**

- `1 <= arr1.length, arr2.length <= 500`
- `-1000 <= arr1[i], arr2[j] <= 1000`
- `0 <= d <= 100`

## 基礎思路

本題要求計算 `arr1` 中有多少元素，與 `arr2` 的所有元素距離都嚴格大於 `d`。換言之，只要 `arr2` 中存在任一元素落在某個 `arr1` 元素的 `[x - d, x + d]` 區間內，該元素就不計入答案。

在思考解法時，可掌握以下核心觀察：

- **判斷條件可轉換為區間包含問題**：
  `|x - y| <= d` 等價於 `y` 落在以 `x` 為中心、半徑為 `d` 的閉區間內，因此每個元素的判斷，只需確認另一陣列是否有值落在該區間即可。

- **區間判斷可化簡為單一比較**：
  若將區間平移，使其下界對齊為 0，則條件變為「平移後的值介於 0 與區間寬度之間」。若再將負數視為無號整數，負值會變成極大的數，只需一次「是否不超過區間寬度」的比較即可同時檢查上下界。

- **一旦找到落在區間內的元素即可停止**：
  每個元素只需知道「是否存在」符合條件的對應值，不需計算數量，因此找到第一個即可提前結束掃描。

- **資料規模不大**：
  兩陣列長度皆不超過 500，直接雙層掃描的運算量完全可接受。

依據以上特性，可以採用以下策略：

- **對第一個陣列的每個元素，掃描第二個陣列**，以平移加無號比較的方式判斷是否有值落在距離範圍內。
- **掃描中一旦命中即提前中止**，以減少不必要的比較。
- **若整趟掃描都沒有命中，則該元素計入答案**。

此策略以最精簡的比較次數完成每一次區間判斷，實作簡潔且效率穩定。

## 解題步驟

### Step 1：初始化陣列長度、區間寬度與計數器

先取得兩陣列的長度，並計算距離區間的總寬度 `2d`（以左移一位實作），同時準備用來累計答案的計數器。

```typescript
const arr1Length = arr1.length;
const arr2Length = arr2.length;
const windowWidth = d << 1;
let distanceValue = 0;
```

### Step 2：對每個 `arr1` 元素掃描 `arr2`，尋找落在距離範圍內的值

對 `arr1` 的每個元素，先計算其區間下界 `arr1[i] - d`，再逐一掃描 `arr2`。
將 `arr2[j] - lowerBound` 以無號右移轉為無號整數：若差值為負，會變成極大的數，因此只需一次「是否不超過 `windowWidth`」的比較，就能同時確認上下界。一旦命中便中止掃描，讓 `innerIndex` 停在命中位置。

```typescript
for (let outerIndex = 0; outerIndex < arr1Length; outerIndex++) {
  const lowerBound = arr1[outerIndex] - d;
  let innerIndex = 0;

  // 無號位移會將負的偏移量轉為極大值，因此單次比較即可同時檢查上下界
  for (; innerIndex < arr2Length; innerIndex++) {
    if (((arr2[innerIndex] - lowerBound) >>> 0) <= windowWidth) {
      break;
    }
  }

  // ...
}
```

### Step 3：若掃描完整結束而未中止，則計入答案

若 `innerIndex` 等於 `arr2Length`，表示內層掃描沒有中途跳出，`arr2` 中沒有任何值與當前元素的距離不超過 `d`，因此將計數器加一。

```typescript
for (let outerIndex = 0; outerIndex < arr1Length; outerIndex++) {
  // Step 2：計算區間下界並掃描 arr2

  // 掃描完整結束而未中止，代表 arr2 中沒有任何值在距離 d 以內
  if (innerIndex === arr2Length) {
    distanceValue++;
  }
}
```

### Step 4：回傳最終的距離值

所有 `arr1` 元素處理完畢後，計數器即為所求的距離值，直接回傳。

```typescript
return distanceValue;
```

## 時間複雜度

- 外層迴圈遍歷 `arr1` 的 $n$ 個元素；
- 對每個元素，內層最壞情況需掃描 `arr2` 的全部 $m$ 個元素，每次比較皆為常數時間；
- 總時間複雜度為 $O(n \cdot m)$。

> $O(n \cdot m)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
