# 3234. Count the Number of Substrings With Dominant Ones

You are given a binary string `s`.

Return the number of substrings with dominant ones.

A string has dominant ones if the number of ones in the string is greater than or equal to the square of the number of zeros in the string.

**Constraints:**

- `1 <= s.length <= 4 * 10^4`
- `s` consists only of characters `'0'` and `'1'`.

## 基礎思路

本題給定一個只包含 `'0'` 與 `'1'` 的字串 `s`，要計算有多少子字串滿足：`#ones ≥ (#zeros)^2`

若直接枚舉所有子字串，對每一段計算 0 和 1 的個數，時間會是 $O(n^2)$，在 $n \le 4 \times 10^4$ 時會超時。

觀察這個條件：

- 若子字串中 **0 的數量很多**，則右側的平方會非常大，要有大量的 1 才能滿足，很難成立；
- 若子字串中 **0 的數量很少**，例如 0、1、2……，就有機會在合理長度內達成 `#ones ≥ (#zeros)^2`。

因此可以把子字串分為「以某個右端點為結尾，且 0 的數量為 k」的類別來討論。
對某個固定的右端點來說：

- 令子字串中 0 的個數為 `k`，1 的個數為 `ones`，長度為 `len`
  則有 `len = ones + k`，條件變成：`ones ≥ k^2`。
- 對固定 `k`，只要知道「在這個右端點、且剛好有 k 個 0 的所有子字串，其 1 的個數分布」，就能用簡單的不等式算出有幾個符合條件。

但若為每個右端點、每個可能的 `k` 全面掃左端點，仍然會爆掉。因此需要進一步優化：

- **限制 k 的上界**：
  子字串長度最多為 `n`，若 `k > sqrt(n)`，就有 `k^2 > n`，而 `ones ≤ n`，幾乎不可能滿足（只考慮有限的小 k 即可）。
  因此只需枚舉 `k` 到 `⌊√n⌋`。
- **利用「0 位置」分段**：
  對每個右端點，我們希望快速找到「包含第 k 個 0 的所有左端點區間」。
  可預先建一個前綴輔助陣列，記錄每個位置向左最近的一個「切割點」（與 `0` 有關），讓我們能以「跳躍」方式往回走，一次跳到前一個「區段開頭」，等價於把「0 的個數」從 1、2、3…逐步增加，而不必一格格往左掃。

整體策略：

- 預處理一個前綴陣列，讓我們可以從任意右端點開始，往左「按 0 的個數分段跳躍」；
- 對每個右端點，針對 `k = 1 ~ ⌊√n⌋` 這些可能的 0 數量，直接算出能滿足 `#ones ≥ k^2` 的左端點個數；
- 全部加總即為答案。

如此每個右端點只會處理到 $O(\sqrt{n})$ 個「0 次數」，總時間約為 $O(n\sqrt{n})$。

## 解題步驟

### Step 1：前置變數與前綴「切割點」陣列

建立字串長度、字元常數，並準備一個長度為 `stringLength + 1` 的陣列，用來存每個位置「向左最近的切割點」。另外在開頭放一個哨兵值 `-1`。

```typescript
const stringLength = s.length;
const characterCodeZero = 48; // '0'.charCodeAt(0)
const prefixPreviousIndex = new Int32Array(stringLength + 1);

// 字串之前的位置使用哨兵值標記
prefixPreviousIndex[0] = -1;
```

### Step 2：建立 prefixPreviousIndex（最近切割點）

我們維護一個 `previousIndex`，代表「目前為止最近的一個切割位置」。
對每個 `index`，若前一個字元是 `'0'`，就把 `previousIndex` 更新為 `index`（代表下一段從這裡開始），並記錄到 `prefixPreviousIndex[index + 1]`。

```typescript
// 構建優化後的 "pre" 陣列：
// prefixPreviousIndex[i + 1] = 在 i 之前或等於 i 的最近切割位置
// （可能是 0，或是最近一次滿足 s[index - 1] === '0' 的位置）
let previousIndex = 0;

for (let index = 0; index < stringLength; index++) {
  if (index > 0) {
    // 若前一個字元為 '0'，則更新切割位置
    if (s.charCodeAt(index - 1) === characterCodeZero) {
      previousIndex = index;
    }
  }

  prefixPreviousIndex[index + 1] = previousIndex;
}
```

### Step 3：預先計算最多需要考慮的 0 個數，並初始化答案

如前所述，只需要考慮 0 的個數 `k` 不超過 `⌊√n⌋` 的子字串即可。

```typescript
// 0 的個數上限約為 sqrt(n)，事先計算此界線
const maxZeroCount = Math.floor(Math.sqrt(stringLength));
let result = 0;
```

### Step 4：枚舉每個右端點，並以「0 的個數」為維度往左跳

對每一個右端點 `rightIndex`（以 1-based 表示右界位置，即子字串右端為 `rightIndex - 1`）：

1. 判斷當前這個字元是否為 `'0'`，作為初始的 `zeroCount`；
2. 使用 `currentPosition` 表示當前考慮的「區段右界」；
3. 在 `while` 迴圈中，每次代表「考慮 0 的個數為 zeroCount」時，對應的左界範圍是 `(previousPosition, currentPosition]`，並計算其中有多少起點可以構成「dominant ones」的子字串；
4. 然後將 `currentPosition` 跳到 `previousPosition`，同時 `zeroCount++`，等於往更左邊找更多 0 的情況。

```typescript
// 依序枚舉每個右端點（邏輯上使用 1-based）
for (let rightIndex = 1; rightIndex <= stringLength; rightIndex++) {
  // 以當前右端點做起點，計算以此為結尾的子字串初始 0 個數
  const isCurrentZero = s.charCodeAt(rightIndex - 1) === characterCodeZero;
  let zeroCount = isCurrentZero ? 1 : 0;

  // 從當前右界開始，利用 prefixPreviousIndex 往左跳區段
  let currentPosition = rightIndex;

  // 只需考慮 0 個數不超過 maxZeroCount 的情況
  while (currentPosition > 0 && zeroCount <= maxZeroCount) {
    const previousPosition = prefixPreviousIndex[currentPosition];

    // 對所有：
    //   left ∈ (previousPosition, currentPosition]
    //   right = rightIndex - 1
    // 的子字串，其 1 的個數為：
    const oneCount = rightIndex - previousPosition - zeroCount;
    const zeroCountSquare = zeroCount * zeroCount;

    // 判斷此 0 個數下，是否有可能形成「dominant ones」子字串
    if (zeroCountSquare <= oneCount) {
      // 可選擇的左端點數量：在 (previousPosition, currentPosition] 之間
      const availableStartCount = currentPosition - previousPosition;

      // 在這些左端點中，最多有多少個能讓 ones ≥ zeroCount^2
      const dominantExtraCount = oneCount - zeroCountSquare + 1;

      // 手動取 min(availableStartCount, dominantExtraCount)，避免在緊迴圈中呼叫 Math.min
      if (availableStartCount < dominantExtraCount) {
        result += availableStartCount;
      } else {
        result += dominantExtraCount;
      }
    }

    // 跳到更左邊的切割位置，並增加 0 的計數
    currentPosition = previousPosition;
    zeroCount += 1;
  }
}
```

### Step 5：回傳統計結果

所有右端點與對應的 0 個數情況處理完後，即可回傳累積結果。

```typescript
return result;
```

## 時間複雜度

- 建立 `prefixPreviousIndex` 陣列：線性掃過字串一次，為 $O(n)$。
- 外層 `rightIndex` 迴圈跑 `n` 次；
- 對每個右端點，內層 while 最多考慮 `zeroCount = 1..⌊√n⌋`，也就是 $O(\sqrt{n})$；
- 迴圈內部所有操作皆為常數時間。
- 總時間複雜度為 $O(n \sqrt{n})$。

> $O(n \sqrt{n})$

## 空間複雜度

- 使用 `prefixPreviousIndex` 陣列儲存每個位置的切割點資訊，大小為 $O(n)$。
- 其他變數皆為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
