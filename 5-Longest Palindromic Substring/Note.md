# 5. Longest Palindromic Substring

Given a string `s`, return the longest palindromic substring in `s`.

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consist of only digits and English letters.

## 基礎思路

本題要找出字串 `s` 的**最長迴文子字串**（必須連續）。
朴素做法若以每個中心往外擴張雖可達到 $O(n^2)$，但本題 `n <= 1000` 雖能過，仍可用更標準且更快的線性解法。

關鍵觀察是：

* **迴文中心分兩類**：奇數長度（中心是一個字元）與偶數長度（中心在兩字元之間）。若要統一處理兩種中心，會讓流程複雜。
* **可用「插入分隔符」統一奇偶中心**：在每個字元之間插入相同分隔符，使所有迴文都變成以「單一中心」對稱的形式，便能用同一套擴張規則。
* **線性時間核心（Manacher 思想）**：掃描每個可能中心時，利用目前已知的「最右延伸迴文」提供鏡射資訊，能跳過大量重複擴張，只在必要時做實際比較，因此整體能達到線性時間。
* **用半徑紀錄迴文大小**：對每個中心記錄可擴張的最大半徑，並在掃描中即時更新全域最佳答案。

因此策略是：先做字串轉換以統一中心，再用線性掃描維護最右邊界與鏡射半徑，最後把最佳半徑對回原字串的起點並取出答案。

## 解題步驟

### Step 1：處理極小長度（直接回傳）

若字串長度小於 2（空字串或單一字元），最長迴文子字串即為原字串本身。

```typescript
const sourceLength = s.length;
if (sourceLength < 2) {
  return s;
}
```

### Step 2：建立轉換後的字元緩衝區（統一奇偶中心）

將原字串轉換為插入分隔符的形式，並加上左右哨兵字元，
使所有迴文都能以「單一中心」進行半徑擴張，避免邊界檢查。

```typescript
// 建立轉換後緩衝：^ # s0 # s1 # ... # s(n-1) # $
const transformedLength = (sourceLength << 1) + 3;
const transformedCodes = new Uint16Array(transformedLength);

transformedCodes[0] = 94; // '^'
transformedCodes[transformedLength - 1] = 36; // '$'

let writeIndex = 1;
transformedCodes[writeIndex++] = 35; // '#'
for (let sourceIndex = 0; sourceIndex < sourceLength; sourceIndex++) {
  transformedCodes[writeIndex++] = s.charCodeAt(sourceIndex);
  transformedCodes[writeIndex++] = 35; // '#'
}
```

### Step 3：初始化半徑表與追蹤變數

準備每個中心位置對應的半徑陣列，
並初始化目前「最右延伸迴文」的中心與邊界，以及全域最佳答案。

```typescript
const radius = new Int32Array(transformedLength);

let currentCenterIndex = 0;
let currentRightBoundary = 0;

let bestCenterIndex = 0;
let bestRadius = 0;
```

### Step 4：主掃描 — 初始化半徑（鏡射優化）並嘗試擴張

以每個位置作為中心進行掃描；
若當前位置落在已知右邊界內，則利用鏡射中心的半徑作為初始值，以避免重複比對，接著再進行必要的實際擴張。

```typescript
for (let index = 1; index < transformedLength - 1; index++) {
  // 若位於目前最右邊界內，可利用鏡射半徑避免重複擴張
  if (index < currentRightBoundary) {
    const mirrorIndex = (currentCenterIndex << 1) - index;
    const maxAllowedRadius = currentRightBoundary - index;
    const mirroredRadius = radius[mirrorIndex];
    radius[index] = mirroredRadius < maxAllowedRadius ? mirroredRadius : maxAllowedRadius;
  }

  // ...
}
```

### Step 5：以中心向左右擴張半徑（實際字元比對）

在初始化半徑後，持續比較中心左右兩側字元；
只要對稱位置字元相同，就持續增加半徑。

```typescript
for (let index = 1; index < transformedLength - 1; index++) {
  // Step 4：主掃描 — 初始化半徑（鏡射優化）

  // 以該中心向左右擴張，只要對稱字元相同就增加半徑
  while (
    transformedCodes[index + radius[index] + 1] ===
    transformedCodes[index - radius[index] - 1]
  ) {
    radius[index]++;
  }

  // ...
}
```

### Step 6：更新最右邊界與全域最佳答案

若當前中心的迴文延伸得比已知最右邊界更遠，
則更新目前活躍中心與右邊界；
同時若半徑超過歷史最佳，則更新最佳答案。

```typescript
for (let index = 1; index < transformedLength - 1; index++) {
  // Step 4：主掃描 — 初始化半徑（鏡射優化）

  // Step 5：以中心向左右擴張半徑

  const expandedRightBoundary = index + radius[index];
  if (expandedRightBoundary > currentRightBoundary) {
    currentCenterIndex = index;
    currentRightBoundary = expandedRightBoundary;
  }

  // 紀錄目前找到的最佳迴文
  if (radius[index] > bestRadius) {
    bestRadius = radius[index];
    bestCenterIndex = index;
  }
}
```

### Step 7：將最佳結果映射回原字串並回傳

將轉換後字串中的最佳中心與半徑，
換算回原字串的起始索引，並取出最長迴文子字串。

```typescript
const bestStartIndex = (bestCenterIndex - bestRadius) >> 1;
return s.substring(bestStartIndex, bestStartIndex + bestRadius);
```

## 時間複雜度

- 轉換字串建立長度為 `2n + 3` 的序列，耗時為 $O(n)$。
- 主掃描迴圈在 Manacher 的鏡射與右邊界機制下，每次擴張總量在整體上被線性攤銷，整體掃描耗時為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 轉換後緩衝區大小為 `2n + 3`，空間為 $O(n)$。
- 半徑陣列大小同為 `2n + 3`，空間為 $O(n)$。
- 其他變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
