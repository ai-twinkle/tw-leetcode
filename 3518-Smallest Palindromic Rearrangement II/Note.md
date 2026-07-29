# 3518. Smallest Palindromic Rearrangement II

You are given a palindromic string `s` and an integer `k`.

Return the k-th lexicographically smallest palindromic permutation of `s`. 
If there are fewer than `k` distinct palindromic permutations, return an empty string.

Note: Different rearrangements that yield the same palindromic string are considered identical and are counted once.

**Constraints:**

- `1 <= s.length <= 10^4`
- `s` consists of lowercase English letters.
- `s` is guaranteed to be palindromic.
- `1 <= k <= 10^6`

## 基礎思路

本題要求在一個回文字串 `s` 的所有相異回文排列中，找出字典序第 `k` 小的那一個；若相異回文排列數量不足 `k`，則回傳空字串。

由於回文字串完全由其前半部（連同奇數長度時的中心字元）決定，因此問題可化簡為：在「前半部字母的多重集合」上，尋找字典序第 `k` 小的排列。

在思考解法時，可掌握以下核心觀察：

- **回文由半邊決定**：
  由於整體為回文，只要確定前半部的排列，後半部即為鏡像；奇數長度時中心字元固定不變。因此只需針對前半部的字母計數進行處理。

- **相異排列數為多重集合排列數**：
  前半部字母可能重複，故其相異排列數應以多重排列（multinomial）計算，而非單純階乘。

- **無需列舉即可定位第 k 小**：
  可利用「以某字母開頭的排列數」逐位決定每個位置該放哪個字母，藉由累減 `k` 的方式，直接構造出第 `k` 小的排列，避免枚舉。

- **避免對整個半邊做龐大計算**：
  前半部長度最大可達 5000，若直接計算整體排列數會產生極大的數值。由於 `k` 上限僅為 `10^6`，故只需從字典序最大端逐步「長出」一段自由後綴，直到其排列數足以涵蓋 `k`，前面的部分則固定為排序後的選擇即可。

依據以上特性，可以採用以下策略：

- **統計前半部各字母的出現次數**，作為多重集合。
- **由字典序最大的字母往回累積後綴長度與其排列數**，直到排列數達到 `k`，確定「切割點」，並將切割點之前的字元固定為排序結果。
- **在自由後綴上以多重排列計數逐位決定字元**，透過累減 `k` 找出第 `k` 小的排列。
- **最後鏡像前半部並補上中心字元**，還原出完整回文並回傳。

## 解題步驟

### Step 1：定義常數與共用解碼器

先定義字母集合大小與小寫字母 `a` 的 ASCII 起始碼，作為字母與索引互相轉換的基準；並建立一個共用的解碼器，供最後將位元組緩衝區一次性轉為字串使用。

```typescript
const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 97;

/** 共用解碼器，使 ASCII 位元組緩衝區能一次性轉為字串。 */
const asciiDecoder = new TextDecoder();
```

### Step 2：計算長度並統計前半部字母次數

先取得字串長度與其半長，接著僅針對前半部逐字累計各字母出現次數，作為後續多重集合排列的基礎。

```typescript
const length = s.length;
const halfLength = length >> 1;

const letterCounts = new Int32Array(ALPHABET_SIZE);
for (let index = 0; index < halfLength; index++) {
  letterCounts[s.charCodeAt(index) - LOWERCASE_A_CODE] += 1;
}
```

### Step 3：由最大字母往回長出後綴，直到排列數涵蓋 k

從字典序最大的字母開始，逐一將字母加入後綴並更新其多重排列數。每加入一個字母，排列數會多出一個位置的因子，並除去該重複字母帶來的重複計數。一旦後綴排列數達到 `k`，即記錄切割字母與其取用數量並停止。

```typescript
// 由排序後半邊往後長出一段後綴，直到其排列數達到 k
let suffixLength = 0;
let suffixWays = 1;
let cutLetter = ALPHABET_SIZE;
let cutTaken = 0;
let hasEnough = k <= 1;

for (let letter = ALPHABET_SIZE - 1; letter >= 0 && !hasEnough; letter--) {
  const available = letterCounts[letter];
  for (let taken = 1; taken <= available; taken++) {
    suffixLength += 1;
    // 多重排列增加一個位置，同時除去該重複字母的重複因子
    suffixWays = (suffixWays * suffixLength) / taken;
    if (suffixWays >= k) {
      cutLetter = letter;
      cutTaken = taken;
      hasEnough = true;
      break;
    }
  }
}
```

### Step 4：若後綴排列數仍不足 k，回傳空字串

若走訪完所有字母後排列數仍無法涵蓋 `k`，代表相異回文排列不足 `k` 個，直接回傳空字串。

```typescript
if (!hasEnough) {
  return "";
}
```

### Step 5：固定切割點之前的字元為排序結果

配置輸出緩衝區。切割字母之前的所有字母皆被強制放置於最前端，依字母順序寫入輸出。

```typescript
const output = new Uint8Array(length);
let writeIndex = 0;

// 自由後綴之前的每個字元皆固定為排序後的選擇
for (let letter = 0; letter < cutLetter; letter++) {
  const repeat = letterCounts[letter];
  for (let copy = 0; copy < repeat; copy++) {
    output[writeIndex] = LOWERCASE_A_CODE + letter;
    writeIndex += 1;
  }
}
```

### Step 6：拆分切割字母並建立自由後綴的字母集合

切割字母會被拆成兩部分：一部分固定寫入輸出，其餘則納入自由後綴。大於切割字母的所有字母則全數納入自由後綴，作為後續逐位決定的候選集合。

```typescript
const freeCounts = new Int32Array(ALPHABET_SIZE);
if (cutLetter < ALPHABET_SIZE) {
  // 切割字母被拆分：一部分固定，其餘納入自由後綴
  const forcedCopies = letterCounts[cutLetter] - cutTaken;
  for (let copy = 0; copy < forcedCopies; copy++) {
    output[writeIndex] = LOWERCASE_A_CODE + cutLetter;
    writeIndex += 1;
  }

  freeCounts[cutLetter] = cutTaken;
  for (let letter = cutLetter + 1; letter < ALPHABET_SIZE; letter++) {
    freeCounts[letter] = letterCounts[letter];
  }
}
```

### Step 7：於自由後綴上以計數方式逐位決定字元

初始化剩餘位置數、剩餘排列數與目前名次。以 `while` 逐位處理：對每個位置，從最小可用字母開始，計算「以該字母開頭的排列數」；若名次落在此範圍內，則選定該字母並更新狀態，否則從名次中扣除該範圍後嘗試下一個字母。當名次降為 1 時，剩餘部分即為排序結果，可停止走訪。

```typescript
let remainingSlots = suffixLength;
let remainingWays = suffixWays;
let rank = k;
let lowestLetter = cutLetter;

// 名次為 1 時，剩餘部分即為排序後的餘量，走訪可就此停止
while (rank > 1 && remainingSlots > 0) {
  for (let letter = lowestLetter; letter < ALPHABET_SIZE; letter++) {
    const available = freeCounts[letter];
    if (available === 0) {
      continue;
    }

    // 以此字母開頭之區塊的排列數，採精確整數運算
    const waysWithLetter = (remainingWays * available) / remainingSlots;
    if (rank <= waysWithLetter) {
      output[writeIndex] = LOWERCASE_A_CODE + letter;
      writeIndex += 1;
      freeCounts[letter] = available - 1;
      remainingWays = waysWithLetter;
      remainingSlots -= 1;
      break;
    }

    rank -= waysWithLetter;
  }

  while (lowestLetter < ALPHABET_SIZE && freeCounts[lowestLetter] === 0) {
    lowestLetter += 1;
  }
}
```

### Step 8：將自由後綴的剩餘字母依序寫出

當走訪停止後，自由後綴中尚未寫出的字母即為排序後的餘量，依字母順序逐一補入輸出。

```typescript
for (let letter = lowestLetter; letter < ALPHABET_SIZE; letter++) {
  const repeat = freeCounts[letter];
  for (let copy = 0; copy < repeat; copy++) {
    output[writeIndex] = LOWERCASE_A_CODE + letter;
    writeIndex += 1;
  }
}
```

### Step 9：鏡像前半部並補上中心字元後回傳

由於 `s` 為回文，只需將已建立的前半部鏡像至後半部即可；若長度為奇數，則將中心字元維持為原字串的中心字元。最後將位元組緩衝區解碼為字串回傳。

```typescript
// s 為回文，故鏡像前半部並保留原中心字元即可
for (let index = 0; index < halfLength; index++) {
  output[length - 1 - index] = output[index];
}

if ((length & 1) === 1) {
  output[halfLength] = s.charCodeAt(halfLength);
}

return asciiDecoder.decode(output);
}
```

## 時間複雜度

- 統計前半部字母次數需 $O(n)$；
- 長出後綴與逐位決定字元的走訪，其總步數受限於後綴長度與 `k` 的規模，均為常數級字母集合（26）上的有限累積，實務上受 $O(\log k)$ 級的後綴長度與字母集合大小影響；
- 建立輸出、鏡像與解碼皆為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 字母計數與自由後綴計數皆為固定大小（26）的陣列；
- 輸出緩衝區需 $O(n)$ 空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
