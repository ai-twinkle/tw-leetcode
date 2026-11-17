# 2911. Minimum Changes to Make K Semi-palindromes

Given a string `s` and an integer `k`, 
partition `s` into `k` substrings such that the letter changes needed to make each substring a semi-palindrome are minimized.

Return the minimum number of letter changes required.

A semi-palindrome is a special type of string that can be divided into palindromes based on a repeating pattern. 
To check if a string is a semi-palindrome:

1. Choose a positive divisor `d` of the string's length. 
  `d` can range from `1` up to, but not including, the string's length. 
  For a string of length `1`, it does not have a valid divisor as per this definition, 
  since the only divisor is its length, which is not allowed.
2. For a given divisor `d`, divide the string into groups where each group contains characters from the string 
   that follow a repeating pattern of length `d`. 
   Specifically, the first group consists of characters at positions `1`, `1 + d`, `1 + 2d`, and so on; 
   the second group includes characters at positions `2`, `2 + d`, `2 + 2d`, etc.
3. The string is considered a semi-palindrome if each of these groups forms a palindrome.

Consider the string `"abcabc"`:

- The length of `"abcabc"` is `6`. 
  Valid divisors are `1`, `2`, and `3`.
- For `d = 1`: The entire string `"abcabc"` forms one group. 
  Not a palindrome.
- For `d = 2`:
  - Group 1 (positions `1, 3, 5`): `"acb"`
  - Group 2 (positions `2, 4, 6`): `"bac"`
  - Neither group forms a palindrome.
- For `d = 3`:
  - Group 1 (positions `1, 4`): `"aa"`
  - Group 2 (positions `2, 5`): `"bb"`
  - Group 3 (positions `3, 6`): `"cc"`
  - All groups form palindromes. 
    Therefore, `"abcabc"` is a semi-palindrome.

**Constraints:**

- `2 <= s.length <= 200`
- `1 <= k <= s.length / 2`
- `s` contains only lowercase English letters.

## 基礎思路

本題要求將字串切成恰好 `k` 段，並讓每一段都修改成「半回文」，求所需的最少字母修改次數。由於字串長度最大為 200，可分割方式的數量極為龐大，需要以動態規劃系統化地處理。

在思考解法時，可掌握以下核心觀察：

- **長度為 1 的子字串永遠不可能是半回文**：
  依定義，長度為 1 的字串沒有合法除數，因此每一段至少需要 2 個字元。這也限制了單一段落的最大長度：其餘每段至少保留 2 個字元，最長段落的長度上限即可由此推得。

- **固定除數後，半回文等價於「區塊對稱」**：
  以除數 `d` 將子字串視為若干個長度為 `d` 的區塊，各分組皆為回文，等價於第一個區塊與最後一個區塊逐字對應相等，第二個區塊與倒數第二個區塊逐字對應相等，依此類推。
  每一組不相等的對應位置只需修改一次。

- **區塊對稱具有由外而內的遞推結構**：
  對同一個除數，某子字串的修改成本等於「最外層一對區塊的不匹配數」加上「去掉頭尾各一個區塊後的內部子字串成本」。
  內部只剩零個或一個區塊時，內部不再有任何限制。

- **兩位置間的不匹配數可用前綴和快速查詢**：
  比較的兩個字元之間距離固定，因此可針對每一種距離預先建立不匹配數的前綴累計表，讓任意一段的比較成本都能以常數時間取得。

- **分段問題可逐層遞推**：
  「前綴切成若干段的最小成本」只依賴「較短前綴切成少一段的最小成本」加上最後一段的成本，因此可以按段數逐層計算。由於成本皆非負，可再利用前綴最小值作為下界，提早終止不可能更優的候選。

依據以上特性，可以採用以下策略：

- **預先建立各種距離下的不匹配前綴累計表**，提供常數時間的區間比較。
- **對每個除數由短到長遞推子字串成本**，重複利用內部結果，並在所有除數中取最小值，得到每個子字串成為半回文的最小成本。
- **將成本表轉置為依結尾排列**，讓分段動態規劃能連續掃描起點。
- **以段數為層進行動態規劃**，並以前綴最小值作為剪枝下界，提早結束無望的搜尋。

此策略將子字串成本的計算與分段決策拆開處理，兩者都能在合理時間內完成。

## 解題步驟

### Step 1：初始化長度相關參數

先取得字串長度，並設定扁平化二維表的列寬。由於每一段至少需要 2 個字元，單一段落的長度上限為總長扣掉其餘 `k - 1` 段的最低需求。依此決定所需表格的大小。

```typescript
const stringLength = s.length;
const width = stringLength + 1;
const maxLength = stringLength - 2 * (k - 1);
const tableSize = width * (maxLength + 1);
```

### Step 2：將字元編碼預先讀入型別化陣列

將每個字元的編碼一次讀入 `Uint8Array`，之後的比較都直接存取數值陣列，避免重複呼叫字串方法。

```typescript
// 一次性將字元編碼讀入型別化陣列
const codes = new Uint8Array(stringLength);
for (let index = 0; index < stringLength; index++) {
  codes[index] = s.charCodeAt(index);
}
```

### Step 3：建立各種距離下的不匹配前綴累計表

針對每一種距離 `offset`，由左至右累計「位置 `i` 與位置 `i + offset` 字元不相同」的次數。之後任何一段固定距離的比較成本，都能以兩個前綴值相減取得。

```typescript
// diagonal[offset * width + position] = 對所有 i < position，s[i] 與 s[i + offset] 的不匹配次數
const diagonal = new Uint8Array(tableSize);
for (let offset = 1; offset < maxLength; offset++) {
  const row = offset * width;
  const lastPosition = stringLength - offset;
  let running = 0;
  for (let position = 0; position < lastPosition; position++) {
    if (codes[position] !== codes[position + offset]) {
      running++;
    }
    diagonal[row + position + 1] = running;
  }
}
```

### Step 4：建立成本表並設定「除數 × 長度」的列舉迴圈

`costByLength` 記錄每個子字串在所有除數下的最小成本，初始為 255 代表尚未計算。`inner` 則暫存目前除數下的成本，供更長的長度重複使用。

外層列舉除數，內層以除數為步長列舉合法長度。每一輪先算出可用的起點範圍、目前長度所在的列，以及最外層區塊對所對應的距離列。

```typescript
// costByLength[length * width + left] = 使 s[left, left + length) 成為半回文的最少修改次數
const costByLength = new Uint8Array(tableSize).fill(255);
// inner[length * width + left] = 僅針對目前除數的修改次數，供下一個更長的長度重複使用
const inner = new Uint8Array(tableSize);
for (let divisor = 1; divisor * 2 <= maxLength; divisor++) {
  for (let length = divisor * 2; length <= maxLength; length += divisor) {
    const lastLeft = stringLength - length;
    const row = length * width;
    // 最外層區塊對比較 s[left + i] 與 s[left + length - divisor + i]
    const diagonalRow = (length - divisor) * width;

    // ...
  }
}
```

### Step 5：依區塊數遞推目前除數下的成本並更新最小值

最外層區塊對的不匹配數，可由距離表中相差一個除數長度的兩個前綴值相減得到。

- 若子字串至少包含四個區塊，內部仍有需要對稱的區塊，需再加上去掉頭尾各一區塊後的內部成本。
- 若只有兩或三個區塊，內部為空或僅剩中央一個區塊，不再有額外限制，成本即為最外層區塊對的不匹配數。

計算結果寫入 `inner` 供更長的長度使用，並與 `costByLength` 比較取最小值。

```typescript
for (let divisor = 1; divisor * 2 <= maxLength; divisor++) {
  for (let length = divisor * 2; length <= maxLength; length += divisor) {
    // Step 4：計算起點範圍與對應的列

    if (length >= divisor * 4) {
      // 加上已求解的內部 s[left + divisor, right - divisor)
      const innerRow = (length - divisor * 2) * width + divisor;
      for (let left = 0; left <= lastLeft; left++) {
        const changes = diagonal[diagonalRow + left + divisor] - diagonal[diagonalRow + left] + inner[innerRow + left];
        inner[row + left] = changes;
        if (changes < costByLength[row + left]) {
          costByLength[row + left] = changes;
        }
      }
    } else {
      for (let left = 0; left <= lastLeft; left++) {
        const changes = diagonal[diagonalRow + left + divisor] - diagonal[diagonalRow + left];
        inner[row + left] = changes;
        if (changes < costByLength[row + left]) {
          costByLength[row + left] = changes;
        }
      }
    }
  }
}
```

### Step 6：只切成一段時直接回傳整串成本

若 `k` 為 1，答案即為整個字串成為半回文的最小成本，可直接查表回傳。

```typescript
if (k === 1) {
  return costByLength[stringLength * width];
}
```

### Step 7：將成本表轉置為依結尾排列

動態規劃會固定結尾、掃描不同起點。因此將「依長度排列」的成本表轉置為「依結尾排列」，讓同一結尾的所有起點在記憶體中連續。轉置時只處理長度介於 2 與最大段長之間的合法子字串。

```typescript
// 轉置為以結尾為主的列，讓動態規劃能連續掃描起點
const costByEnd = new Uint8Array(width * width);
for (let end = 2; end <= stringLength; end++) {
  const row = end * width;
  const lastStart = end - 2;
  const firstStart = end > maxLength ? end - maxLength : 0;
  for (let start = firstStart; start <= lastStart; start++) {
    costByEnd[row + start] = costByLength[(end - start) * width + start];
  }
}
```

### Step 8：初始化滾動陣列並填入單段的基礎狀態

使用兩個滾動陣列，分別保存上一層與目前層的結果，並準備前綴最小值陣列作為剪枝依據。第一層表示前綴只切成一段，其成本即為該前綴整段成為半回文的成本。

```typescript
let previous = new Uint8Array(width).fill(255);
let current = new Uint8Array(width).fill(255);
const prefixMinimum = new Uint8Array(width);

// 單段：整個前綴的成本
for (let end = 2; end <= maxLength; end++) {
  previous[end] = costByLength[end * width];
}
```

### Step 9：逐層推進段數並計算前綴最小值下界

對每個段數，先決定此層有意義的結尾範圍：

- 結尾上限需為之後的段落保留足夠長度。
- 前面已有的段落也需佔用最少長度，因此起點下界隨段數提高。
- 最後一層只需要整個字串的結果。

接著計算上一層結果的前綴最小值。由於最後一段成本非負，此值即為任何候選答案的下界。

```typescript
for (let parts = 2; parts <= k; parts++) {
  const limit = stringLength - 2 * (k - parts);
  const firstStart = (parts - 1) * 2;
  // 最後一層只需要整個字串
  const firstEnd = parts === k ? stringLength : parts * 2;

  // prefixMinimum[start] = 到 start 為止上一層的最小值，作為任何候選答案的下界
  let running = 255;
  for (let start = firstStart; start <= limit - 2; start++) {
    if (previous[start] < running) {
      running = previous[start];
    }
    prefixMinimum[start] = running;
  }

  // ...
}
```

### Step 10：對每個結尾掃描最後一段的起點並剪枝

固定結尾後，從最短的最後一段開始，往左逐一嘗試起點。候選值為上一層在該起點的結果加上最後一段的成本。

一旦某起點的前綴最小值已不小於目前最佳值，代表更左側的所有起點都不可能更優，可立即停止掃描。

```typescript
for (let parts = 2; parts <= k; parts++) {
  // Step 9：決定此層範圍並計算前綴最小值下界

  for (let end = firstEnd; end <= limit; end++) {
    const row = end * width;
    let best = 255;
    // 先掃描較短的最後一段；一旦更早的切分不可能勝過目前最佳值即停止
    for (let start = end - 2; start >= firstStart; start--) {
      if (prefixMinimum[start] >= best) {
        break;
      }
      const candidate = previous[start] + costByEnd[row + start];
      if (candidate < best) {
        best = candidate;
      }
    }
    current[end] = best;
  }

  // ...
}
```

### Step 11：交換滾動陣列進入下一層

本層計算完成後，交換兩個陣列的角色，讓目前層成為下一輪的上一層，避免重新配置記憶體。

```typescript
for (let parts = 2; parts <= k; parts++) {
  // Step 9：決定此層範圍並計算前綴最小值下界

  // Step 10：掃描起點並剪枝取得每個結尾的最佳值

  const swap = previous;
  previous = current;
  current = swap;
}
```

### Step 12：回傳整個字串切成 k 段的最小成本

所有層數處理完畢後，上一層陣列中整個字串結尾的位置，即為切成 `k` 段的最少修改次數。

```typescript
return previous[stringLength];
```

## 時間複雜度

- 建立不匹配前綴累計表需列舉所有距離與位置，為 $O(n^2)$。
- 子字串成本計算中，對每個除數 `d` 約有 $n/d$ 種長度，每種長度掃描 $O(n)$ 個起點，總計 $O\left(n \sum_{d} \frac{n}{d}\right) = O(n^2 \log n)$。
- 成本表轉置需 $O(n^2)$。
- 分段動態規劃共 `k` 層，每層對每個結尾最多掃描 $O(n)$ 個起點，為 $O(k \cdot n^2)$。
- 總時間複雜度為 $O(n^2 (\log n + k))$。

> $O(n^2 (\log n + k))$

## 空間複雜度

- 不匹配前綴累計表、子字串成本表、內部成本表與轉置後的成本表，皆為 $O(n^2)$。
- 滾動陣列與前綴最小值陣列為 $O(n)$。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
