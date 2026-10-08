# 1021. Remove Outermost Parentheses

A valid parentheses string is either empty `""`, `"("` + `A` + `")"`, or `A + B`, 
where `A` and `B` are valid parentheses strings, and `+` represents string concatenation.

- For example, `""`, `"()"`, `"(())()"`, and `"(()(()))"` are all valid parentheses strings.

A valid parentheses string `s` is primitive if it is nonempty, 
and there does not exist a way to split it into `s = A + B`, 
with `A` and `B` nonempty valid parentheses strings.

Given a valid parentheses string `s`, 
consider its primitive decomposition: `s = P_1 + P_2 + ... + P_k`, 
where `P_i` are primitive valid parentheses strings.

Return `s` after removing the outermost parentheses of every primitive string in the primitive decomposition of `s`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is either `'('` or `')'`.
- `s` is a valid parentheses string.

## 基礎思路

本題給定一個合法的括號字串，要求將其依「原生分解」拆成若干個最小不可再分的合法括號段落，並移除每一段最外層的那一對括號後重新組合輸出。

在思考解法時，可掌握以下核心觀察：

- **深度歸零即為一段的終點**：
  從某段的起始位置開始計算括號深度，遇左括號加一、遇右括號減一，當深度首次回到零時，恰好就是該段的結尾；這個性質讓我們能以單次線性掃描切出所有段落，無需任何堆疊結構。

- **每段起點必為左括號**：
  由於輸入保證合法，前一段結束的下一個位置必定是新一段的開頭，且該字元必為左括號，因此掃描時可直接以深度為一起步，省去一次判斷。

- **要移除的恰好是每段的首尾字元**：
  移除最外層括號等同於取出每段的「內部區間」，因此輸出可以用區間切片的方式一次取得，而非逐字元判斷與輸出。

- **以字元分類表取代條件分支**：
  由於輸入僅含兩種字元，可將「深度增量」預先建成以字元碼為索引的查表，讓掃描過程中的分類不需要比較分支。

- **空內部可直接略過**：
  若某段恰為最短的合法段落，其內部為空，對結果毫無貢獻，可省去一次字串串接。

依據以上特性，可以採用以下策略：

- **以外層迴圈逐段推進**，每一輪處理一個原生段落。
- **以深度計數內層掃描找出該段結尾**，並據此得到其內部區間的邊界。
- **以區間切片整段接到結果尾端**，使串接次數與段數同階，而非與字元數同階。
- **處理完一段後，將起點直接跳到下一段開頭**，確保整體掃描為單趟線性。

此策略能在一次線性掃描內完成切段與輸出，同時避免大量的單字元串接開銷。

## 解題步驟

### Step 1：預先建立括號深度增量查表

先在主函數之外建立以字元碼為索引的深度增量表，讓掃描時能以查表取代條件判斷，一次建立後可供所有呼叫重複使用。

```typescript
/**
 * 每個括號字元碼對應的深度增量，預先在函數外計算一次，
 * 使掃描過程不需要任何比較分支來分類字元。
 * 索引 40 代表 '('，索引 41 代表 ')'。
 */
const PARENTHESIS_DEPTH_DELTA = new Int8Array(42);
PARENTHESIS_DEPTH_DELTA[40] = 1;
PARENTHESIS_DEPTH_DELTA[41] = -1;
```

### Step 2：初始化長度、結果容器與段落起點

取得輸入長度，準備累積輸出用的結果字串，並將目前處理段落的起點設為最前端。

```typescript
const length = s.length;
let result = '';
let primitiveStart = 0;
```

### Step 3：逐段推進，並以深度一為起點展開掃描

只要起點尚未越過字串尾端，就代表還有尚未處理的段落。由於每段的起始字元必為左括號，可直接將深度設為一，並從其後一個位置開始往右掃描。

```typescript
while (primitiveStart < length) {
  // s[primitiveStart] 必定是某段的起始左括號，因此深度由一開始。
  let depth = 1;
  let scanIndex = primitiveStart + 1;

  // ...
}
```

### Step 4：掃描至深度歸零以定位該段結尾

持續以查表累加深度，直到深度回到零為止；由於輸入保證合法，深度必定會在越界前歸零。掃描停止時，指標已越過該段的收尾括號，故往回一格即為內部區間的結束位置。

```typescript
while (primitiveStart < length) {
  // Step 3：設定此段的起始深度與掃描位置

  // 前進到收束此段的 ')'；輸入保證合法，
  // 因此深度必定會在越界之前歸零。
  while (depth !== 0) {
    depth += PARENTHESIS_DEPTH_DELTA[s.charCodeAt(scanIndex)];
    scanIndex++;
  }

  const innerEnd = scanIndex - 1;

  // ...
}
```

### Step 5：將該段的內部區間接到結果尾端

若內部區間非空，才以切片取出並串接；對於內部為空的最短段落則完全略過，省去一次無意義的串接。

```typescript
while (primitiveStart < length) {
  // Step 3：設定此段的起始深度與掃描位置

  // Step 4：掃描至深度歸零並取得內部結束位置

  // 若此段為單純的 "()"，其內部為空，直接略過串接。
  if (innerEnd > primitiveStart + 1) {
    result += s.substring(primitiveStart + 1, innerEnd);
  }

  // ...
}
```

### Step 6：將起點移到下一段的開頭

處理完當前段落後，掃描指標所停之處即為下一段的起始位置，直接指派即可進入下一輪，確保整體為單趟線性掃描。

```typescript
while (primitiveStart < length) {
  // Step 3：設定此段的起始深度與掃描位置

  // Step 4：掃描至深度歸零並取得內部結束位置

  // Step 5：串接此段的內部區間

  primitiveStart = scanIndex;
}
```

### Step 7：回傳組合完成的結果

所有段落處理完畢後，結果字串已累積全部內部區間，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 外層迴圈逐段推進，內層掃描從不回頭，每個字元恰好被走訪一次，合計 $O(n)$；
- 深度分類以查表完成，為常數時間；
- 每段僅做一次切片與串接，段數不超過 $O(n)$，最終扁平化總長度亦為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 深度增量表為固定大小，屬常數空間；
- 僅使用固定數量的索引與計數變數；
- 輸出字串與其組合過程中的中間節點最多為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
