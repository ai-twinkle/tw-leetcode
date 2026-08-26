# 2904. Shortest and Lexicographically Smallest Beautiful String

You are given a binary string `s` and a positive integer `k`.

A substring of `s` is beautiful if the number of 1's in it is exactly `k`.

Let len be the length of the shortest beautiful substring.

Return the lexicographically smallest beautiful substring of string `s` with length equal to `len`. 
If `s` doesn't contain a beautiful substring, return an empty string.

A string `a` is lexicographically larger than a string `b` (of the same length) if in the first position where `a` and `b` differ, 
`a` has a character strictly larger than the corresponding character in `b`.

For example, `"abcd"` is lexicographically larger than `"abcc"` 
because the first position they differ is at the fourth character, and `d` is greater than `c`.

**Constraints:**

- `1 <= s.length <= 100`
- `1 <= k <= s.length`

## 基礎思路

本題要求在一個二進位字串中，找出恰好含有 `k` 個 `1` 的最短子字串；若存在多個等長的最短子字串，則需回傳其中字典序最小者。

在思考解法時，可掌握以下核心觀察：

- **合法子字串的兩端必定為 `1`**：
  若子字串的開頭或結尾為 `0`，將其去除後 `1` 的數量不變、長度卻更短，因此不可能是最短解。這代表所有候選子字串都由某個 `1` 起始、由另一個 `1` 結束，只需關注 `1` 的位置即可。

- **候選子字串的數量受 `1` 的個數限制**：
  將所有 `1` 的位置依序記錄下來後，任何合法子字串都對應到「連續 `k` 個 `1`」的一段區間，因此候選集合可由這些位置滑動枚舉而得，數量遠小於所有子字串。

- **長度存在數學下界**：
  子字串必須容納 `k` 個 `1`，故長度不可能小於 `k`；一旦出現長度恰為 `k` 的候選，它必然是全由 `1` 組成的字串，同時在長度與字典序上都是最優解，可立即結束搜尋。

- **等長時的字典序比較可從第二個字元開始**：
  所有候選皆以 `1` 開頭，故首字元必然相同，比較時可略過並在第一個相異位置決出勝負。

依據以上特性，可以採用以下策略：

- **先掃描一次原字串，記錄所有 `1` 的位置**，並在數量不足時直接判定無解。
- **以滑動的方式枚舉每一段連續 `k` 個 `1` 所構成的候選區間**，同時維護目前的最佳長度與最佳起點。
- **在單一走訪中同時完成長度比較與等長時的字典序比較**，最後才實際切出結果字串，避免不必要的配置。

此策略僅需線性掃描加上有限次的字元比較，即可同時滿足最短與字典序最小兩項條件。

## 解題步驟

### Step 1：掃描字串並記錄所有 `1` 的位置

先取得字串長度，並以一次線性掃描收集所有字元為 `1` 的索引；由於題目限制長度不超過 100，使用 `Uint8Array` 即足以容納所有索引。

```typescript
const length = s.length;

// 每個合法視窗的頭尾都會是 '1'，因此只有 '1' 的位置才重要。
// 由於限制 s.length <= 100，Uint8Array 足以容納所有索引而不溢位。
const onePositions = new Uint8Array(length);
let oneCount = 0;
for (let index = 0; index < length; index++) {
  if (s.charCodeAt(index) === 49) {
    onePositions[oneCount] = index;
    oneCount++;
  }
}
```

### Step 2：處理 `1` 的數量不足的情況

若整個字串中 `1` 的總數少於 `k`，則不可能存在任何合法子字串，直接回傳空字串。

```typescript
if (oneCount < k) {
  return '';
}
```

### Step 3：初始化枚舉範圍與最佳解記錄

計算最後一個可用起始視窗的索引、由視窗起點推得結尾所需的位移量，並將最佳長度初始化為一個不可能達到的上界，使任何合法候選皆能取代它。

```typescript
const lastWindowIndex = oneCount - k;
const offsetToWindowEnd = k - 1;
let bestLength = length + 1;
let bestStart = 0;
```

### Step 4：逐一計算候選視窗的起點與長度，並處理長度下界

以連續 `k` 個 `1` 為一組進行枚舉，由該組的首尾位置推得子字串的實際長度；若長度恰等於 `k`，代表此段全為 `1`，同時達到長度下界與字典序最小值，可立即回傳。

```typescript
// 單次走訪：同時縮小最佳長度並解決等長時的字典序比較。
for (let windowIndex = 0; windowIndex <= lastWindowIndex; windowIndex++) {
  const start = onePositions[windowIndex];
  const windowLength = onePositions[windowIndex + offsetToWindowEnd] - start + 1;

  // 視窗必須包含 k 個 1，因此長度 k 是數學下界，且此時只可能是字串 "111...1"；
  // 之後的視窗不可能在長度或字典序上勝過它。
  if (windowLength === k) {
    return '1'.repeat(k);
  }

  // ...
}
```

### Step 5：依長度決定更新或略過此候選

若當前候選比已知最佳解更短，則直接取代最佳解並進入下一輪；若比最佳解更長，則不可能成為答案，直接略過。剩下的情況即為等長，需再進一步比較。

```typescript
for (let windowIndex = 0; windowIndex <= lastWindowIndex; windowIndex++) {
  // Step 4：計算視窗起點與長度，並處理長度下界的提前回傳

  if (windowLength < bestLength) {
    bestLength = windowLength;
    bestStart = start;
    continue;
  }

  if (windowLength > bestLength) {
    continue;
  }

  // ...
}
```

### Step 6：等長時以字典序決定最佳起點

當長度與最佳解相同時，逐位比較兩者的字元；由於兩者皆以 `1` 開頭，比較可從位移 1 開始，並在第一個相異字元處決定勝負後立即停止。

```typescript
for (let windowIndex = 0; windowIndex <= lastWindowIndex; windowIndex++) {
  // Step 4：計算視窗起點與長度，並處理長度下界的提前回傳

  // Step 5：依長度更新或略過此候選

  // 長度相同且兩個候選皆以 '1' 開頭，故比較從位移 1 開始，
  // 並在第一個相異字元處停止。
  for (let offset = 1; offset < bestLength; offset++) {
    const currentCode = s.charCodeAt(start + offset);
    const bestCode = s.charCodeAt(bestStart + offset);
    if (currentCode !== bestCode) {
      if (currentCode < bestCode) {
        bestStart = start;
      }
      break;
    }
  }
}
```

### Step 7：切出並回傳最終結果

走訪結束後，最佳起點與最佳長度皆已確定，此時才實際切出子字串，使整個過程只進行一次字串配置。

```typescript
// 只在最後進行一次結果字串的配置。
return s.slice(bestStart, bestStart + bestLength);
```

## 時間複雜度

- 掃描原字串以記錄所有 `1` 的位置，需 $O(n)$；
- 候選視窗的數量不超過 `1` 的總數，即 $O(n)$ 個；
- 每個候選在等長時最多進行 $O(n)$ 次字元比較；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 需要一個陣列記錄所有 `1` 的位置，最壞情況為 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 不計輸出結果所佔用的空間；
- 總空間複雜度為 $O(n)$。

> $O(n)$
