# 2472. Maximum Number of Non-overlapping Palindrome Substrings

You are given a string `s` and a positive integer `k`.

Select a set of non-overlapping substrings from the string `s` that satisfy the following conditions:

- The length of each substring is at least `k`.
- Each substring is a palindrome.

Return the maximum number of substrings in an optimal selection.

A substring is a contiguous sequence of characters within a string.

**Constraints:**

- `1 <= k <= s.length <= 2000`
- `s` consists of lowercase English letters.

## 基礎思路

本題要求在一個字串中挑出盡可能多的互不重疊子字串，且每個子字串都必須是回文、長度至少為指定值。由於字串長度最大可達 2000，若對每個可能區間逐一驗證是否為回文，代價過高，因此需要能快速判斷任意區間是否為回文的前置結構，並搭配有效率的選取策略。

在思考解法時，可掌握以下核心觀察：

- **最短可用長度即為最佳選擇**：
  若某個位置結尾處存在合法回文，選擇「最短的那一個」會讓左側留下最多空間給後續選取，因此以右端點由左至右掃描、遇到可選就立刻選取的貪心策略即為最優。

- **只需檢查兩種長度**：
  任何長度大於門檻的回文，去掉頭尾一組字元後仍為回文，且長度仍不低於門檻，直到長度剛好等於門檻或門檻加一為止。因此對每個右端點而言，只需檢查長度恰為門檻與門檻加一的兩種情況即可，不必窮舉所有長度。

- **奇偶性決定檢查的中心型態**：
  門檻與門檻加一必定一奇一偶，對應到「以字元為中心」與「以字元間隙為中心」的兩種回文，兩者需分別查表。

- **回文半徑可線性預處理**：
  利用已知回文的鏡射性質，可在線性時間內求出每個中心所能延伸的最大回文半徑，之後任何固定長度的回文判斷都只是一次查表比較。

- **極端情況可直接短路**：
  若門檻為一，每個單字元本身就是回文，答案即為字串長度；若門檻大於字串長度，則無任何合法選擇。

依據以上特性，可以採用以下策略：

- **先以線性演算法建出奇數與偶數兩張回文半徑表**。
- **依門檻的奇偶性決定兩種候選長度分別該查哪張表、以及對應的中心位置與所需半徑**。
- **由左至右掃描右端點，先試最短候選長度，失敗再試次短，一旦選中即把可用起點推進到該右端點之後**。

此策略讓每個右端點僅需常數次查表，整體維持線性時間。

## 解題步驟

### Step 1：建立回文半徑輔助函數並初始化奇數長度掃描

先取得字串長度，接著進行奇數長度回文的掃描：維護目前已知最右延伸的回文區間，若當前中心落在該區間內，便以鏡射位置的結果與區間邊界取較小值作為初始半徑，藉此跳過已知必定成立的部分。

```typescript
/**
 * 以 Manacher 演算法填入每個中心所能達到的最大回文半徑。
 * oddRadius[i] 涵蓋 s[i - r + 1 .. i + r - 1]；evenRadius[i] 涵蓋 s[i - r .. i + r - 1]。
 * @param characterCodes - 來源字串的字元碼。
 * @param oddRadius - 奇數長度回文半徑的輸出緩衝區。
 * @param evenRadius - 偶數長度回文半徑的輸出緩衝區。
 */
function buildPalindromicRadii(
  characterCodes: Uint8Array,
  oddRadius: Int32Array,
  evenRadius: Int32Array,
): void {
  const length = characterCodes.length;

  // 奇數長度掃描：若位於已知回文內，則鏡射既有回文的半徑。
  let windowLeft = 0;
  let windowRight = -1;
  for (let center = 0; center < length; center++) {
    let radius: number;
    if (center > windowRight) {
      radius = 1;
    } else {
      const mirrored = oddRadius[windowLeft + windowRight - center];
      const bound = windowRight - center + 1;
      radius = mirrored < bound ? mirrored : bound;
    }

    // ...
  }

  // ...
}
```

### Step 2：奇數長度掃描的向外擴展與最右視窗更新

自初始半徑開始向兩側逐字元比對並擴展，直到越界或字元不相符為止；將結果寫回奇數半徑表後，若此回文的右端超過目前已知的最右位置，便更新最右視窗，供後續中心鏡射使用。

```typescript
/**
 * 以 Manacher 演算法填入每個中心所能達到的最大回文半徑。
 * oddRadius[i] 涵蓋 s[i - r + 1 .. i + r - 1]；evenRadius[i] 涵蓋 s[i - r .. i + r - 1]。
 * @param characterCodes - 來源字串的字元碼。
 * @param oddRadius - 奇數長度回文半徑的輸出緩衝區。
 * @param evenRadius - 偶數長度回文半徑的輸出緩衝區。
 */
function buildPalindromicRadii(
  characterCodes: Uint8Array,
  oddRadius: Int32Array,
  evenRadius: Int32Array,
): void {
  // Step 1：取得長度並初始化奇數長度掃描的視窗

  for (let center = 0; center < length; center++) {
    // Step 1：依鏡射結果取得初始半徑

    while (
      center + radius < length &&
      center - radius >= 0 &&
      characterCodes[center + radius] === characterCodes[center - radius]
      ) {
      radius++;
    }
    oddRadius[center] = radius;
    radius--;
    if (center + radius > windowRight) {
      windowLeft = center - radius;
      windowRight = center + radius;
    }
  }

  // ...
}
```

### Step 3：重置視窗並初始化偶數長度掃描

偶數長度回文的中心位於兩字元之間，需重新以獨立的視窗狀態掃描一次；同樣地，若中心落於已知回文內，便取鏡射結果與邊界的較小值作為起始半徑。

```typescript
/**
 * 以 Manacher 演算法填入每個中心所能達到的最大回文半徑。
 * oddRadius[i] 涵蓋 s[i - r + 1 .. i + r - 1]；evenRadius[i] 涵蓋 s[i - r .. i + r - 1]。
 * @param characterCodes - 來源字串的字元碼。
 * @param oddRadius - 奇數長度回文半徑的輸出緩衝區。
 * @param evenRadius - 偶數長度回文半徑的輸出緩衝區。
 */
function buildPalindromicRadii(
  characterCodes: Uint8Array,
  oddRadius: Int32Array,
  evenRadius: Int32Array,
): void {
  // Step 1：取得長度並初始化奇數長度掃描的視窗

  // Step 1 ~ Step 2：完成奇數長度回文半徑的計算

  // 偶數長度掃描：中心位於索引 center - 1 與 center 之間。
  windowLeft = 0;
  windowRight = -1;
  for (let center = 0; center < length; center++) {
    let radius: number;
    if (center > windowRight) {
      radius = 0;
    } else {
      const mirrored = evenRadius[windowLeft + windowRight - center + 1];
      const bound = windowRight - center + 1;
      radius = mirrored < bound ? mirrored : bound;
    }

    // ...
  }
}
```

### Step 4：偶數長度掃描的向外擴展與最右視窗更新

以間隙為中心向兩側比對並擴展，將最終半徑寫入偶數半徑表；若其右端突破目前最右位置，則更新視窗左右界，注意左界需因間隙中心而額外偏移一格。

```typescript
/**
 * 以 Manacher 演算法填入每個中心所能達到的最大回文半徑。
 * oddRadius[i] 涵蓋 s[i - r + 1 .. i + r - 1]；evenRadius[i] 涵蓋 s[i - r .. i + r - 1]。
 * @param characterCodes - 來源字串的字元碼。
 * @param oddRadius - 奇數長度回文半徑的輸出緩衝區。
 * @param evenRadius - 偶數長度回文半徑的輸出緩衝區。
 */
function buildPalindromicRadii(
  characterCodes: Uint8Array,
  oddRadius: Int32Array,
  evenRadius: Int32Array,
): void {
  // Step 1 ~ Step 2：完成奇數長度回文半徑的計算

  // Step 3：重置視窗並初始化偶數長度掃描

  for (let center = 0; center < length; center++) {
    // Step 3：依鏡射結果取得初始半徑

    while (
      center + radius < length &&
      center - radius - 1 >= 0 &&
      characterCodes[center + radius] === characterCodes[center - radius - 1]
      ) {
      radius++;
    }
    evenRadius[center] = radius;
    radius--;
    if (center + radius > windowRight) {
      windowLeft = center - radius - 1;
      windowRight = center + radius;
    }
  }
}
```

### Step 5：主流程的邊界情況處理

先取得字串長度；若門檻為一，每個單字元都是合法回文，可直接切滿整個字串；若門檻大於字串長度，則不存在任何合法選擇。

```typescript
const length = s.length;

// 每個單一字元都是回文，因此整個字串都能被切分。
if (k === 1) {
  return length;
}
if (k > length) {
  return 0;
}
```

### Step 6：將字串轉換為字元碼陣列

為了讓後續比對在型別化陣列上進行，先把字串逐字元轉為字元碼存入緊湊的緩衝區。

```typescript
const characterCodes = new Uint8Array(length);
for (let index = 0; index < length; index++) {
  characterCodes[index] = s.charCodeAt(index);
}
```

### Step 7：建立奇偶兩張回文半徑表

配置兩張半徑表並交由前述輔助函數一次填滿，之後所有回文判斷都只需查表。

```typescript
const oddRadius = new Int32Array(length);
const evenRadius = new Int32Array(length);
buildPalindromicRadii(characterCodes, oddRadius, evenRadius);
```

### Step 8：初始化貪心選取的狀態

以一個計數器累計已選取的子字串數量，並以一個指標記錄下一個允許的起始位置，確保選取結果彼此不重疊。

```typescript
let selectedCount = 0;
let nextAllowedStart = 0;
```

### Step 9：門檻為奇數時，優先檢查長度恰為門檻的奇回文

當門檻為奇數時，長度為門檻與門檻加一的兩種視窗恰好共用同一個中心索引。先算出所需半徑與中心偏移，接著逐一掃描右端點，優先嘗試較短的奇數長度視窗；若起點未與前次選取重疊且半徑足夠，即選取並將可用起點推進到此右端點之後。

```typescript
if ((k & 1) === 1) {
  // 奇數 k：長度 k 與長度 k + 1 的視窗共用同一個中心索引。
  const requiredRadius = (k + 1) >> 1;
  const centerOffset = (k - 1) >> 1;
  for (let right = k - 1; right < length; right++) {
    const center = right - centerOffset;
    // 優先選擇在此結尾的最短視窗，讓後續位置保留更多空間。
    if (right - k + 1 >= nextAllowedStart && oddRadius[center] >= requiredRadius) {
      selectedCount++;
      nextAllowedStart = right + 1;
      continue;
    }

    // ...
  }
}
```

### Step 10：門檻為奇數時，退而檢查長度為門檻加一的偶回文

若較短的視窗不可用，則改試長度多一的偶數視窗；其起點再往左一格，需同樣確認不與前次選取重疊且半徑足夠，成立時一併計入並更新可用起點。

```typescript
if ((k & 1) === 1) {
  // Step 9：計算所需半徑與中心偏移

  for (let right = k - 1; right < length; right++) {
    // Step 9：優先嘗試長度恰為 k 的奇數視窗

    if (right - k >= nextAllowedStart && evenRadius[center] >= requiredRadius) {
      selectedCount++;
      nextAllowedStart = right + 1;
    }
  }
}
```

### Step 11：門檻為偶數時，優先檢查長度恰為門檻的偶回文

當門檻為偶數時，長度恰為門檻的視窗屬於偶數回文，其所需半徑即為門檻的一半。同樣由左至右掃描右端點，優先嘗試此最短視窗。

```typescript
if ((k & 1) === 1) {
  // Step 9 ~ Step 10：處理門檻為奇數的情況
} else {
  // 偶數 k：長度 k 的視窗為偶數回文，長度 k + 1 的備援則為奇數回文。
  const halfLength = k >> 1;
  for (let right = k - 1; right < length; right++) {
    if (right - k + 1 >= nextAllowedStart && evenRadius[right - halfLength + 1] >= halfLength) {
      selectedCount++;
      nextAllowedStart = right + 1;
      continue;
    }

    // ...
  }
}
```

### Step 12：門檻為偶數時，退而檢查長度為門檻加一的奇回文

若偶數視窗不可用，則改試長度多一的奇數視窗，其中心左移一格且所需半徑多一；條件成立時計入並推進可用起點。

```typescript
if ((k & 1) === 1) {
  // Step 9 ~ Step 10：處理門檻為奇數的情況
} else {
  // Step 11：計算半長度並優先嘗試長度恰為 k 的偶數視窗

  for (let right = k - 1; right < length; right++) {
    // Step 11：優先嘗試長度恰為 k 的偶數視窗

    if (right - k >= nextAllowedStart && oddRadius[right - halfLength] >= halfLength + 1) {
      selectedCount++;
      nextAllowedStart = right + 1;
    }
  }
}
```

### Step 13：回傳最終選取數量

掃描結束後，計數器即為互不重疊且皆符合長度門檻的回文子字串的最大數量。

```typescript
return selectedCount;
```

## 時間複雜度

- 字元碼轉換為一次線性掃描，為 $O(n)$；
- 建立奇偶兩張回文半徑表時，最右視窗的右界僅單調右移，擴展總次數受其攤還限制，為 $O(n)$；
- 貪心掃描每個右端點僅進行常數次查表與比較，為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 字元碼緩衝區佔用 $O(n)$；
- 奇數與偶數兩張半徑表各佔用 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
