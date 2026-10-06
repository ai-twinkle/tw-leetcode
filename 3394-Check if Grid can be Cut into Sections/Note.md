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

本題要求判斷能否在格線上做出兩道平行切割（全為水平或全為垂直），使得切出的三個區段各自至少包含一個矩形，且沒有任何矩形被切線穿過。

在思考解法時，可掌握以下核心觀察：

- **兩個軸向彼此獨立**：
  水平切割只與各矩形在縱向的起訖範圍有關，垂直切割只與橫向的起訖範圍有關。兩者的判斷邏輯完全相同，只是取用的座標欄位不同，因此可共用同一套流程，分別套用一次即可。

- **切割問題等價於區間分群問題**：
  將每個矩形投影到該軸上，就成為一條線段。若存在一個位置，使得所有線段都完整落在它的左側或右側，則該位置就是一道合法切線。因此問題轉化為：這些線段能否被切成三個互不重疊的群集。

- **只需偵測「間隙」的數量**：
  將線段依起點排序後，由左往右掃描並維護「目前已見過的最大終點」。當下一條線段的起點不早於這個最大終點時，代表前面所有線段都已結束，此處即出現一道間隙。只要累積到兩道間隙，就必然形成三個群集。

- **排序是主要成本，且鍵值範圍可被利用**：
  由於座標為非負整數，當其值域不大時可用計數排序取得線性時間；但格線邊長可達極大值，若無差別地開出與值域等長的計數陣列將造成空間災難，因此需依實際最大鍵值切換策略。

依據以上特性，可以採用以下策略：

- **對兩個軸向各執行一次相同的判斷流程**，任一成立即可回傳成立。
- **先依該軸的起點排序，再以單趟掃描搭配最大終點追蹤來累計間隙數量**，一旦達到兩道即可提前結束。
- **排序採用自訂的計數排序**：鍵值範圍較小時使用陣列版計數排序；鍵值範圍過大時改以雜湊表統計頻率並對出現過的鍵排序，避免配置超大陣列。

此策略讓判斷本身維持線性掃描，並將排序成本控制在可接受的範圍內。

## 解題步驟

### Step 1：分別檢查兩個軸向的切割可能性

主函數本身只負責分派：先以橫向座標欄位檢查垂直切割，再以縱向座標欄位檢查水平切割，任一成立即代表答案為真。

```typescript
/**
 * 檢查這些矩形能否沿著 x 軸或 y 軸被切成三個群集。
 * @param n {number} - 未使用的參數。
 * @param rectangles {number[][]} - 要檢查的矩形。
 * @returns {boolean} - 這些矩形能否被切成三個群集。
 */
function checkValidCuts(n: number, rectangles: number[][]): boolean {
  // 檢查垂直（x 軸）與水平（y 軸）兩種切法。
  return checkAxis(rectangles, 0, 2) || checkAxis(rectangles, 1, 3);
}
```

### Step 2：建立單軸檢查函數並依起點排序

單軸檢查函數接收該軸的起點與終點欄位索引。為避免破壞呼叫端的資料，先做一次淺層複製，再依該軸的起點座標排序，使後續得以由左往右單趟掃描。

```typescript
/**
 * 檢查這些矩形能否沿著指定軸被分成三個群集。
 * @param rectangles {number[][]} - 矩形陣列。
 * @param startIndex {number} - 所選軸上起點座標的索引。
 * @param endIndex {number} - 所選軸上終點座標的索引。
 * @returns {boolean} - 若能被切成三個群集則為 true。
 */
function checkAxis(rectangles: number[][], startIndex: number, endIndex: number): boolean {
  // 做一次淺層複製，以免動到原始陣列。
  const rects = rectangles.slice();
  // 使用計數排序，依所選軸上的起點座標排序矩形。
  countingSortRectangles(rects, startIndex);

  // ...
}
```

### Step 3：初始化間隙計數與目前最大終點

以 `gaps` 累計已偵測到的間隙數量，並以 `maxEnd` 記錄掃描過程中所見過的最遠終點；後者初始化為排序後第一個矩形的終點。

```typescript
function checkAxis(rectangles: number[][], startIndex: number, endIndex: number): boolean {
  // Step 2：複製並依指定軸的起點排序

  let gaps = 0;
  let maxEnd = rects[0][endIndex];

  // ...
}
```

### Step 4：單趟掃描偵測間隙並得出結論

由第二個矩形開始往後掃描：若當前矩形的起點不早於目前的最大終點，代表前面的群集已完全結束，於此處形成一道間隙；累積到兩道間隙即可切出三個群集並提前回傳成立。每一輪結束後都要更新最大終點，使其涵蓋已掃描過的所有矩形。掃描結束仍未湊足兩道間隙，則此軸向不可行。

```typescript
function checkAxis(rectangles: number[][], startIndex: number, endIndex: number): boolean {
  // Step 2：複製並依指定軸的起點排序

  // Step 3：初始化間隙計數與目前最大終點

  // 單趟掃描計算間隙：
  for (let i = 1; i < rects.length; i++) {
    // 若當前矩形的起點不早於目前的 maxEnd，
    // 代表我們在兩個群集之間找到了一道間隙。
    if (rects[i][startIndex] >= maxEnd) {
      gaps++;
      if (gaps >= 2) {
        return true; // 兩道間隙即可切出三個群集。
      }
    }
    maxEnd = Math.max(maxEnd, rects[i][endIndex]);
  }
  return false;
}
```

### Step 5：建立計數排序函數並評估鍵值範圍

排序函數先掃描一次陣列找出指定鍵的最大值，用以判定值域大小，並設定一個門檻，作為後續選擇排序策略的依據。

```typescript
/**
 * 針對矩形的自訂計數排序。
 * 此函數會依指定鍵索引的數值，就地排序矩形陣列。
 * 當鍵值範圍過大時，會改用基於 Map 的計數排序，以避免走訪一個龐大的計數陣列。
 * @param arr {number[][]} - 要排序的矩形陣列。
 * @param keyIndex {number} - 用來排序的鍵索引。
 */
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // 找出該鍵的最大值，以決定其值域範圍。
  let maxVal = 0;
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][keyIndex];
    if (key > maxVal) {
      maxVal = key;
    }
  }
  // 用來決定是否採用標準陣列版計數排序的門檻。
  const threshold = 100000;

  // ...
}
```

### Step 6：值域不大時，以陣列累積各鍵的前綴計數

當最大鍵值不超過門檻時，直接開出與值域等長的計數陣列，先統計每個鍵的出現次數，再轉換為前綴和，使每個鍵對應到它在排序結果中的結束位置，並預先配置輸出陣列。

```typescript
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // Step 5：掃描最大鍵值並設定門檻

  if (maxVal <= threshold) {
    // 使用以陣列儲存計數的標準計數排序。
    const count = new Array(maxVal + 1).fill(0);
    for (let i = 0; i < arr.length; i++) {
      count[arr[i][keyIndex]]++;
    }
    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
    }
    const output: number[][] = new Array(arr.length);

    // ...
  }

  // ...
}
```

### Step 7：由後往前放置元素並寫回原陣列

依前綴和由後往前放置每個元素，以維持相同鍵之間的穩定性；放置完成後再將輸出陣列整個複製回原陣列，達成就地排序的效果。

```typescript
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // Step 5：掃描最大鍵值並設定門檻

  if (maxVal <= threshold) {
    // Step 6：建立計數陣列與前綴和

    // 將元素放到正確位置，由後往前走訪以維持穩定性。
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      output[count[key] - 1] = arr[i];
      count[key]--;
    }

    // 將排序後的輸出複製回原陣列。
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  }

  // ...
}
```

### Step 8：值域過大時，改以雜湊表統計並建立累積位置

當最大鍵值超過門檻，改用雜湊表只記錄實際出現過的鍵及其頻率，接著取出這些鍵並排序，再依序累加頻率得到每個鍵的累積結束位置，同時預先配置輸出陣列。

```typescript
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // Step 5：掃描最大鍵值並設定門檻

  if (maxVal <= threshold) {
    // Step 6：建立計數陣列與前綴和

    // Step 7：由後往前放置元素並寫回原陣列
  } else {
    // 使用基於 Map 的計數排序，避免在 maxVal 很大時建立龐大的陣列。
    const frequency = new Map<number, number>();
    // 統計每個鍵的出現頻率。
    for (let i = 0; i < arr.length; i++) {
      const key = arr[i][keyIndex];
      frequency.set(key, (frequency.get(key) || 0) + 1);
    }

    // 取出所有鍵並加以排序。
    const keys = Array.from(frequency.keys()).sort((a, b) => a - b);

    // 使用 Map 建立累積頻率。
    const cumulative = new Map<number, number>();
    let total = 0;
    for (const key of keys) {
      total += frequency.get(key)!;
      cumulative.set(key, total);
    }

    // 建立輸出陣列以存放排序後的元素。
    const output: number[][] = new Array(arr.length);

    // ...
  }
}
```

### Step 9：依累積位置由後往前放置並寫回原陣列

與陣列版相同，由後往前依累積位置放置每個元素以維持穩定性，每放置一個就將該鍵的累積位置往前移動；最後把輸出陣列複製回原陣列完成排序。

```typescript
function countingSortRectangles(arr: number[][], keyIndex: number): void {
  // Step 5：掃描最大鍵值並設定門檻

  if (maxVal <= threshold) {
    // Step 6：建立計數陣列與前綴和

    // Step 7：由後往前放置元素並寫回原陣列
  } else {
    // Step 8：以雜湊表統計頻率並建立累積位置

    // 由後往前走訪，將每個元素放到正確位置以維持穩定性。
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][keyIndex];
      const pos = cumulative.get(key)! - 1;
      output[pos] = arr[i];
      cumulative.set(key, pos);
    }

    // 將排序後的輸出複製回原陣列。
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  }
}
```

## 時間複雜度

- 設矩形數量為 $n$，該軸上的最大座標值為 $V$；
- 每個軸向需複製一次陣列並掃描最大鍵值，皆為 $O(n)$；
- 排序在值域不大時為陣列版計數排序，耗時 $O(n + V)$；值域過大時需對出現過的相異鍵排序，耗時 $O(n \log n)$；
- 間隙偵測為單趟線性掃描，耗時 $O(n)$；
- 兩個軸向各執行一次，僅為常數倍；
- 總時間複雜度為 $O(n \log n + V)$。

> $O(n \log n + V)$

## 空間複雜度

- 矩形陣列的淺層複製與排序輸出陣列皆需 $O(n)$；
- 陣列版計數排序需要與值域等長的計數陣列，為 $O(V)$；雜湊表版則只儲存相異鍵，為 $O(n)$；
- 間隙偵測僅使用固定數量的變數；
- 總空間複雜度為 $O(n + V)$。

> $O(n + V)$
