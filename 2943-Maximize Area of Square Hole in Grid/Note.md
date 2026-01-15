# 2943. Maximize Area of Square Hole in Grid

You are given the two integers, `n` and `m` and two integer arrays, `hBars` and `vBars`. 
The grid has `n + 2` horizontal and `m + 2` vertical bars, creating 1 x 1 unit cells. 
The bars are indexed starting from `1`.

You can remove some of the bars in `hBars` from horizontal bars and some of the bars in `vBars` from vertical bars. 
Note that other bars are fixed and cannot be removed.

Return an integer denoting the maximum area of a square-shaped hole in the grid, after removing some bars (possibly none).

**Constraints:**

- `1 <= n <= 10^9`
- `1 <= m <= 10^9`
- `1 <= hBars.length <= 100`
- `2 <= hBars[i] <= n + 1`
- `1 <= vBars.length <= 100`
- `2 <= vBars[i] <= m + 1`
- All values in `hBars` are distinct.
- All values in `vBars` are distinct.

## 基礎思路

本題描述一個由水平與垂直欄杆構成的網格。
每移除一根欄杆，會使相鄰的兩個單位格合併；若移除的是一段**連續的欄杆**，則可將多個單位格合併成更大的洞。

題目要求找出在「允許移除的欄杆集合」限制下，**能形成的最大正方形洞的面積**。
因此我們需要思考以下關鍵點：

* **洞的高度與寬度是獨立計算的**：
  水平欄杆只影響高度，垂直欄杆只影響寬度。
* **移除連續的欄杆才有合併效果**：
  若可移除欄杆中存在一段長度為 `k` 的連續索引，則可合併出 `k + 1` 個單位格。
* **最大正方形洞的邊長受限於短邊**：
  最終可形成的正方形，其邊長為「最大可合併高度」與「最大可合併寬度」兩者中的較小值。

因此，我們可以透過以下步驟來求解：

1. 分別針對水平與垂直可移除欄杆，找出「最長的連續索引段長度」；
2. 將該長度轉換為可合併的格數（連續長度 + 1）；
3. 取高度與寬度中較小者作為正方形邊長，平方後即為答案。

## 解題步驟

### Step 1：定義輔助函式 `computeMaximumSpan`

此輔助函式負責計算：
給定某一方向「可移除的欄杆索引集合」，最多可以合併出多少個連續的單位格。

* 若沒有任何可移除欄杆，則最多只能保留單一格；
* 否則，將索引排序後，找出最長的連續整數區段。

```typescript
/**
 * 計算移除最長連續欄杆段後，可合併出的最大格數跨度。
 *
 * @param removableBars - 可移除的欄杆索引
 * @returns 移除後可合併出的最大跨度（以格數計）
 */
function computeMaximumSpan(removableBars: number[]): number {
  const length = removableBars.length;
  if (length === 0) {
    return 1;
  }

  const sortedBars = Int32Array.from(removableBars);
  sortedBars.sort();

  let maximumConsecutive = 1;
  let currentConsecutive = 1;

  // ...
}
```

### Step 2：在 `computeMaximumSpan` 中以單次掃描找出最長連續可移除段

線性掃描排序後的欄杆索引：

* 若當前索引與前一個索引差 1，代表連續段延伸；
* 否則，該連續段結束，重新開始計數；
* 在連續段延伸時，同步更新全域最長連續段長度。

```typescript
function computeMaximumSpan(removableBars: number[]): number {
  // Step 1：定義輔助函式 `computeMaximumSpan`

  // 最長連續可移除欄杆段決定最大合併格數跨度
  for (let index = 1; index < length; index++) {
    if (sortedBars[index] === sortedBars[index - 1] + 1) {
      currentConsecutive++;
      if (currentConsecutive > maximumConsecutive) {
        maximumConsecutive = currentConsecutive;
      }
    } else {
      currentConsecutive = 1;
    }
  }

  // ...
}
```

### Step 3：回傳該方向可合併出的最大格數

若最長連續可移除欄杆段長度為 `maximumConsecutive`，
則可合併出的單位格數量為 `maximumConsecutive + 1`。

```typescript
function computeMaximumSpan(removableBars: number[]): number {
  // Step 1：定義輔助函式 `computeMaximumSpan`

  // Step 2：以單次掃描找出最長連續可移除段

  return maximumConsecutive + 1;
}
```

### Step 4：計算最大洞高與最大洞寬

分別將水平與垂直可移除欄杆傳入輔助函式，
取得移除後在兩個方向上可形成的最大合併跨度。

```typescript
const maximumHoleHeight = computeMaximumSpan(hBars);
const maximumHoleWidth = computeMaximumSpan(vBars);
```

### Step 5：決定最大正方形洞邊長並回傳面積

正方形的邊長必須同時受限於高度與寬度，
因此取兩者的較小值作為邊長，平方後即為最大面積。

```typescript
const squareSide = maximumHoleHeight < maximumHoleWidth ? maximumHoleHeight : maximumHoleWidth;
return squareSide * squareSide;
```

## 時間複雜度

- `computeMaximumSpan(hBars)`：排序為 `O(H log H)`，線性掃描為 `O(H)`，其中 `H = hBars.length`。
- `computeMaximumSpan(vBars)`：排序為 `O(V log V)`，線性掃描為 `O(V)`，其中 `V = vBars.length`。
- 其餘操作皆為常數時間。
- 總時間複雜度為 **$O(H \log H + V \log V)$**。

> $O(H \log H + V \log V)$

## 空間複雜度

- 輔助函式中會建立排序用的陣列，大小分別為 `H` 與 `V`；
- 兩次呼叫不會同時持有兩個排序陣列，因此峰值額外空間為 `max(H, V)`；
- 其餘變數皆為常數級。
- 總空間複雜度為 **$O(\max(H, V))$**。

> $O(\max(H, V))$
