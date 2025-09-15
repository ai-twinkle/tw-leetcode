# 3394. Check if Grid can be Cut into Sections

You are given an integer `n` representing the dimensions of an `n x n` grid, 
with the origin at the bottom-left corner of the grid. 
You are also given a 2D array of coordinates rectangles, 
where `rectangles[i]` is in the form `[start_x, start_y, end_x, end_y]`, 
representing a rectangle on the grid. Each rectangle is defined as follows:

- `(start_x, start_y)`: The bottom-left corner of the rectangle.
- `(end_x, end_y)`: The top-right corner of the rectangle.

Note that the rectangles do not overlap. 
Your task is to determine if it is possible to make either two horizontal or two vertical cuts on the grid such that:

- Each of the three resulting sections formed by the cuts contains at least one rectangle.
- Every rectangle belongs to exactly one section.

Return `true` if such cuts can be made; otherwise, return `false`.

**Constraints:**

- `3 <= n <= 10^9`
- `3 <= rectangles.length <= 10^5`
- `0 <= rectangles[i][0] < rectangles[i][2] <= n`
- `0 <= rectangles[i][1] < rectangles[i][3] <= n`
- No two rectangles overlap.

## 基礎思路

本題的核心目標是判斷一組矩形是否可以透過水平或垂直切割，劃分為三個獨立的群組，且每個群組至少包含一個矩形。

首先，我們可分別考慮水平與垂直兩個軸的切割情況。
將矩形的邊投影到各軸後，會形成一系列區間。我們的任務是確認是否能在這些區間上找到兩個明顯的「間隙」（gap），使其將區間自然分割為三個部分。

- 若能找到這兩個間隙，則說明這些矩形可以分割為三個獨立的群組；
- 反之，則無法分割。

然而，在真實情境中，矩形數量可能極為龐大，因此排序的效率至關重要。

在 Michael Rojas 撰寫的[LeetCode 解析](https://leetcode.com/problems/check-if-grid-can-be-cut-into-sections/solutions/6576190/100-72ms-time-o-dn-space-o-n/)中，使用了 `Radix Sort` 來處理此問題，已能有效降低複雜度。但我們發現仍有進一步的優化空間：

我們改採用 `Counting Sort`，其具有更低的常數因子及更直接的計算方式，對於數值範圍不大的情況能夠實現更快速的排序。為解決資料範圍極大的情況（例如最大值極高但元素數量相對較少），我們進一步採取了混合策略：

- 當數值範圍較小時，採用標準的陣列（Array）進行計數排序（Counting Sort）。
- 當數值範圍極大時，則改用雜湊表（Hash Table, Map）進行排序，以避免額外的大量空間浪費。

透過此混合策略，能夠根據資料特性動態選擇最合適的方法，使排序過程在各種極端條件下都能達到最佳效率。

這樣的改進方法不僅優化了原本基於基數排序的解法，更提供了一個彈性的解決方案，有效地因應不同規模與特性的資料集合。

## 解題步驟

### Step 1：分別檢查水平與垂直切割

我們首先定義一個 `checkValidCuts` 函數，依序檢查垂直（x 軸）與水平（y 軸）的切割情況。由於題目中 grid 的大小並不影響矩形之間的相對關係，因此參數 `_n` 並未被實際使用。  
以下程式碼展示了如何分別調用兩個方向的檢查：

```typescript
function checkValidCuts(n: number, rectangles: number[][]): boolean {
  // 分別檢查垂直（x 軸）和水平（y 軸）的切割是否可行
  return checkAxis(rectangles, 0, 2) || checkAxis(rectangles, 1, 3);
}
```

### Step 2：沿指定軸進行排序與區間檢查

在 `checkAxis` 函數中，我們主要做兩件事情：

1. **排序**：  
   將矩形根據指定軸的起始坐標（例如 x 軸時為 `start_x`，y 軸時為 `start_y`）進行排序。  
   為了提升效率，這裡使用了 `countingSortRectangles` 函數。  
   該函數根據數值範圍決定使用標準的陣列計數排序或基於 Map 的計數排序。

2. **統計 gap**：  
   排序完成後，我們用一個線性掃描來統計區間之間的 gap。
    - 初始化 `maxEnd` 為第一個矩形的結束坐標。
    - 從第二個矩形開始，若當前矩形的起始坐標大於等於 `maxEnd`，表示出現一個 gap，此時計數器 `gaps` 加一。
    - 更新 `maxEnd` 為當前所有矩形的最大結束坐標。
    - 如果在遍歷過程中發現 `gaps >= 2`，即可返回 `true`。

```typescript
function checkAxis(rectangles: number[][], startIndex: number, endIndex: number): boolean {
  // 複製一份陣列，避免直接修改原陣列
  const rects = rectangles.slice();
  // 使用 counting sort 根據指定軸的起始坐標排序
  countingSortRectangles(rects, startIndex);

  let gaps = 0;
  let maxEnd = rects[0][endIndex];

  // 單次遍歷統計 gap 數量
  for (let i = 1; i < rects.length; i++) {
    // 當前矩形的起始值大於等於前面區間的最大結束值，代表有 gap
    if (rects[i][startIndex] >= maxEnd) {
      gaps++;
      if (gaps >= 2) {
        return true; // 兩個 gap 則可分成三組
      }
    }
    maxEnd = Math.max(maxEnd, rects[i][endIndex]);
  }
  return false;
}
```

### Step 3：實現混合式 Counting Sort

由於數值範圍有可能非常大，我們在 `countingSortRectangles` 中採用了兩種不同的策略：

- **數值範圍不大**：  
  使用基於陣列的計數排序，直接根據數值建立計數陣列並進行累計。

- **數值範圍極大**：  
  利用 Map 來記錄每個關鍵值的出現頻率，再依據排序後的 key 建立累積頻率，再將矩形按照穩定排序的順序排列回原陣列中。

相關程式碼如下：

```typescript
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // 找出指定 key 的最大值
  let maxVal = 0;
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][keyIndex];
    if (key > maxVal) {
      maxVal = key;
    }
  }
  // 設定一個門檻值，若數值範圍較小則使用陣列-based counting sort
  const threshold = 100000;

  if (maxVal <= threshold) {
    // 使用標準陣列計數排序
    const count = new Array(maxVal + 1).fill(0);
    for (let i = 0; i < arr.length; i++) {
      count[arr[i][keyIndex]]++;
    }
    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
    }
    const output: number[][] = new Array(arr.length);

    // 由後往前迭代，保證排序穩定
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      output[count[key] - 1] = arr[i];
      count[key]--;
    }
    // 將排序結果複製回原陣列
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  } else {
    // 當數值範圍極大時，使用 Map-based counting sort
    const frequency = new Map<number, number>();
    for (let i = 0; i < arr.length; i++) {
      const key = arr[i][keyIndex];
      frequency.set(key, (frequency.get(key) || 0) + 1);
    }
    // 取得所有的 key 並排序
    const keys = Array.from(frequency.keys()).sort((a, b) => a - b);

    const cumulative = new Map<number, number>();
    let total = 0;
    for (const key of keys) {
      total += frequency.get(key)!;
      cumulative.set(key, total);
    }
    const output: number[][] = new Array(arr.length);

    // 由後往前遍歷，保持排序的穩定性
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      const pos = cumulative.get(key)! - 1;
      output[pos] = arr[i];
      cumulative.set(key, pos);
    }
    // 複製排序結果回原陣列
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  }
}
```

## 時間複雜度

- **排序部分**：  
  Counting Sort 在數值範圍合適的情況下可達到線性時間，假設矩形數量為 $m$，則排序複雜度約為 $O(m)$。  
  但需要注意，由於長方體（矩形）數量可能是超級大，若直接使用 Array-based Counting Sort，當數值範圍較大時可能會導致額外的空間和時間開銷。因此，我們採用了混合策略：
    - 當數值範圍較小時，直接利用陣列進行計數排序，保持 $O(m)$ 的效率。
    - 當數值範圍極大時，則改用 Map-based Counting Sort，平均情況下仍可達到 $O(m)$，即使最壞情況下所有鍵都不相同，理論上也屬於線性時間內完成。

- **區間掃描**：  
  掃描所有矩形只需一次 $O(m)$ 的遍歷。

- 總時間複雜度為 $O(m)$ 的常數倍（我們對行和列分別進行排序，但這兩個方向的排序均為 $O(m)$）。

> $O(m)$

## 空間複雜度

- **排序額外空間**：
    - 當使用 Array-based Counting Sort 時，空間複雜度依賴於數值範圍；對於超級大的 m，這可能會帶來較大的空間需求，但可以透過門檻值來控制。
    - 使用 Map-based Counting Sort 時，額外空間主要來自 Map 及輸出陣列，整體為 $O(m)$。

- **其他變數**：  
  其他變數使用的空間均為常數級。

- 總空間複雜度為 $O(m)$。

> $O(m)$
