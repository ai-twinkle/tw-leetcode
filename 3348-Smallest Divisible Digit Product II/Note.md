# 3348. Smallest Divisible Digit Product II

You are given a string `num` which represents a positive integer, and an integer `t`.

A number is called zero-free if none of its digits are 0.

Return a string representing the smallest zero-free number greater than or equal to `num` 
such that the product of its digits is divisible by `t`. 
If no such number exists, return `"-1"`.

**Constraints:**

- `2 <= num.length <= 2 * 10^5`
- `num` consists only of digits in the range `['0', '9']`.
- `num` does not contain leading zeros.
- `1 <= t <= 10^14`

## 基礎思路

本題要求在給定字串 `num` 所代表的正整數之上，找出最小的「無零數字」，並使其各位數字乘積能被 `t` 整除；若不存在，則回傳 `"-1"`。由於 `num` 長度可達 `2 * 10^5`，我們無法暴力枚舉，必須從數論與貪心兩個角度切入。

在思考解法時，可掌握以下核心觀察：

- **數字乘積的質因數僅限於 2、3、5、7**：
  任何一位數字（1 到 9）的質因數分解只會包含 2、3、5、7 這四個質數。因此若 `t` 除去這四個質數後仍不為 1，代表無論如何都無法由數字乘積整除，直接回傳 `"-1"`。

- **問題可化約為「湊足質因數指數」**：
  將 `t` 拆解成 2、3、5、7 各自的指數需求後，整個問題便轉化為：如何用最少或恰當數量的數字，湊出這些質數指數。

- **最少數字數量可貪心計算**：
  由於 9 一次提供兩個 3、8 一次提供三個 2、6 可同時吸收一個 2 與一個 3，因此可用貪心策略推導出「湊足特定指數所需的最少位數」。5 與 7 只能由自身提供。

- **同長度優先，並盡量保留前綴**：
  為求結果最小，應優先嘗試與 `num` 相同長度的答案。透過保留最長的無零合法前綴、於某一位往上加大、並在後綴自由補位的策略，即可得到同長度下的最小解。

- **後綴填補以「先補 1、再堆重數字於尾端」為原則**：
  在自由填補的後綴中，為使字典序最小，應先以 `1` 填滿多餘位置，再把提供質因數的必要數字集中放到最尾端。

依據以上特性，可以採用以下策略：

- **先剝離 `t` 的質因數，若含其他質數則直接判定無解**。
- **設計輔助函數計算最少位數，並建構最小的「緊湊尾段」**。
- **依序處理三種情況**：原數已合法、同長度下改動一位後補足、以及必須增長位數的最終情況。

此策略能在近似線性的時間內完成，兼顧正確性與效率。

## 解題步驟

### Step 1：預先建立各數字的質因數指數查表與常數

我們先建立四張查表，分別記錄數字 0 到 9 各自貢獻的 2、3、5、7 指數，以便後續 O(1) 查詢；並定義字元 `'0'` 的編碼常數。

```typescript
/** 質數 2 由各數字（索引 0-9）貢獻的指數。 */
const DIGIT_TWO_EXPONENT = new Int8Array([0, 0, 1, 0, 2, 0, 1, 0, 3, 0]);
/** 質數 3 由各數字（索引 0-9）貢獻的指數。 */
const DIGIT_THREE_EXPONENT = new Int8Array([0, 0, 0, 1, 0, 0, 1, 0, 0, 2]);
/** 質數 5 由各數字（索引 0-9）貢獻的指數。 */
const DIGIT_FIVE_EXPONENT = new Int8Array([0, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
/** 質數 7 由各數字（索引 0-9）貢獻的指數。 */
const DIGIT_SEVEN_EXPONENT = new Int8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);

const ZERO_CHARACTER_CODE = 48;
```

### Step 2：實作輔助函數以計算湊足指數所需的最少數字數量

此函數依貪心規則推算最少位數：9 一次提供兩個 3，故 3 的指數為奇數時會剩一個單獨的 3；而該單獨的 3 可升級為 6，順便免費吸收一個 2；8 一次提供三個 2；5 與 7 則只能由自身提供。

```typescript
/**
 * 計算 1..9 中最少需要幾個數字，其乘積才能提供所需的質數指數。
 * @param twoExponent 所需的 2 指數
 * @param threeExponent 所需的 3 指數
 * @param fiveExponent 所需的 5 指數
 * @param sevenExponent 所需的 7 指數
 * @returns 最少數字數量
 */
function minimumDigitCount(
  twoExponent: number,
  threeExponent: number,
  fiveExponent: number,
  sevenExponent: number
): number {
  // 數字 9 提供兩個 3，故奇數指數會剩下一個單獨的 3。
  const threeDigitCount = (threeExponent + 1) >> 1;
  // 該單獨的 3 之槽位可升級為 6，免費吸收一個 2。
  let leftoverTwoExponent = twoExponent - (threeExponent & 1);
  if (leftoverTwoExponent < 0) {
    leftoverTwoExponent = 0;
  }
  // 數字 8 一次提供三個 2。
  const twoDigitCount = ((leftoverTwoExponent + 2) / 3) | 0;
  // 質數 5 與 7 只能由數字 5 與 7 自身提供。
  return fiveExponent + sevenExponent + threeDigitCount + twoDigitCount;
}
```

### Step 3：實作輔助函數以建構最小的「緊湊尾段」

此函數在恰好 `slotCount` 個槽位下，貪心地在每個槽位取「仍能使剩餘需求可行」的最小數字，藉此建出字典序最小、乘積剛好提供所需指數的數字串。首先初始化尾段字串與各質數的剩餘需求。

```typescript
/**
 * 建構恰好 `slotCount` 位、乘積能提供所需指數的字典序最小數字串。
 * `slotCount` 必須等於 minimumDigitCount(...)，
 * 即每個槽位皆為必要，不會出現數字 1。
 * @param twoExponent 所需的 2 指數
 * @param threeExponent 所需的 3 指數
 * @param fiveExponent 所需的 5 指數
 * @param sevenExponent 所需的 7 指數
 * @param slotCount 要輸出的確切數字數量
 * @returns 符合條件的最小數字串
 */
function buildTightTail(
  twoExponent: number,
  threeExponent: number,
  fiveExponent: number,
  sevenExponent: number,
  slotCount: number
): string {
  let tail = "";
  let remainingTwo = twoExponent;
  let remainingThree = threeExponent;
  let remainingFive = fiveExponent;
  let remainingSeven = sevenExponent;

  // ...
}
```

### Step 4：逐槽位貪心選取仍可行的最小數字

對每個槽位，從最小的候選數字 2 開始嘗試，先扣除該候選提供的指數並將負值歸零，若扣除後剩餘需求所需的最少位數嚴格小於「剩餘槽位數」，代表此候選可行，即採用之並更新剩餘需求。

```typescript
/**
 * 建構恰好 `slotCount` 位、乘積能提供所需指數的字典序最小數字串。
 * `slotCount` 必須等於 minimumDigitCount(...)，
 * 即每個槽位皆為必要，不會出現數字 1。
 * @param twoExponent 所需的 2 指數
 * @param threeExponent 所需的 3 指數
 * @param fiveExponent 所需的 5 指數
 * @param sevenExponent 所需的 7 指數
 * @param slotCount 要輸出的確切數字數量
 * @returns 符合條件的最小數字串
 */
function buildTightTail(
  twoExponent: number,
  threeExponent: number,
  fiveExponent: number,
  sevenExponent: number, 
  slotCount: number
): string {
  // Step 3：初始化尾段字串與各質數剩餘需求

  for (let slotsLeft = slotCount; slotsLeft > 0; slotsLeft--) {
    // 貪心地取仍能使剩餘需求可行的最小數字。
    for (let candidate = 2; candidate <= 9; candidate++) {
      let nextTwo = remainingTwo - DIGIT_TWO_EXPONENT[candidate];
      let nextThree = remainingThree - DIGIT_THREE_EXPONENT[candidate];
      let nextFive = remainingFive - DIGIT_FIVE_EXPONENT[candidate];
      let nextSeven = remainingSeven - DIGIT_SEVEN_EXPONENT[candidate];
      if (nextTwo < 0) {
        nextTwo = 0;
      }
      if (nextThree < 0) {
        nextThree = 0;
      }
      if (nextFive < 0) {
        nextFive = 0;
      }
      if (nextSeven < 0) {
        nextSeven = 0;
      }
      if (minimumDigitCount(nextTwo, nextThree, nextFive, nextSeven) < slotsLeft) {
        tail += String.fromCharCode(ZERO_CHARACTER_CODE + candidate);
        remainingTwo = nextTwo;
        remainingThree = nextThree;
        remainingFive = nextFive;
        remainingSeven = nextSeven;
        break;
      }
    }
  }
  return tail;
}
```

### Step 5：剝離 `t` 的質因數並判定是否可能有解

在主函數中，先將 `t` 逐一除盡 2、3、5、7 並累計各自指數；若除盡後殘餘值不為 1，代表 `t` 含有其他質數因子，任何數字乘積都無法整除，直接回傳 `"-1"`。

```typescript
// 剝離數字乘積唯一可能包含的質因數。
let residualTarget = t;
let targetTwo = 0;
let targetThree = 0;
let targetFive = 0;
let targetSeven = 0;
while (residualTarget % 2 === 0) {
  residualTarget /= 2;
  targetTwo++;
}
while (residualTarget % 3 === 0) {
  residualTarget /= 3;
  targetThree++;
}
while (residualTarget % 5 === 0) {
  residualTarget /= 5;
  targetFive++;
}
while (residualTarget % 7 === 0) {
  residualTarget /= 7;
  targetSeven++;
}
// 任何其他質因數皆無法由數字 1..9 產生。
if (residualTarget !== 1) {
  return "-1";
}
```

### Step 6：單次掃描定位第一個 0 並累計無零前綴的指數

以一次線性掃描找出 `num` 中第一個 0 的位置；在遇到 0 之前，累加此無零前綴各數字所貢獻的 2、3、5、7 指數，供後續判斷使用。

```typescript
const length = num.length;

// 單次掃描：定位第一個 0，並累計無零前綴的質數指數。
let firstZeroIndex = length;
let runningTwo = 0;
let runningThree = 0;
let runningFive = 0;
let runningSeven = 0;
for (let index = 0; index < length; index++) {
  const digit = num.charCodeAt(index) - ZERO_CHARACTER_CODE;
  if (digit === 0) {
    firstZeroIndex = index;
    break;
  }
  runningTwo += DIGIT_TWO_EXPONENT[digit];
  runningThree += DIGIT_THREE_EXPONENT[digit];
  runningFive += DIGIT_FIVE_EXPONENT[digit];
  runningSeven += DIGIT_SEVEN_EXPONENT[digit];
}
```

### Step 7：情況一，判斷原數是否已直接合法

若 `num` 完全無零，且其前綴累計指數已同時滿足 2、3、5、7 的需求，代表原數本身即為合法答案，可直接回傳。

```typescript
// 情況一：num 本身已符合條件。
if (
  firstZeroIndex === length &&
  runningTwo >= targetTwo &&
  runningThree >= targetThree &&
  runningFive >= targetFive &&
  runningSeven >= targetSeven
) {
  return num;
}
```

### Step 8：決定同長度改動的起始掃描位置

若存在 0，則該 0 本身是前綴仍為無零的最後位置，從此處開始往回嘗試；若無 0，則從最後一位開始，並先扣除最後一位對前綴指數的貢獻，因為它將被改動。

```typescript
// 情況二：保留無零前綴，將某一位往上加大，再自由填補後綴。
let candidateStart: number;
if (firstZeroIndex < length) {
  // 該 0 本身即是前綴仍為無零的最後位置。
  candidateStart = firstZeroIndex;
} else {
  candidateStart = length - 1;
  const lastDigit = num.charCodeAt(candidateStart) - ZERO_CHARACTER_CODE;
  runningTwo -= DIGIT_TWO_EXPONENT[lastDigit];
  runningThree -= DIGIT_THREE_EXPONENT[lastDigit];
  runningFive -= DIGIT_FIVE_EXPONENT[lastDigit];
  runningSeven -= DIGIT_SEVEN_EXPONENT[lastDigit];
}
```

### Step 9：由右往左掃描，計算當前位所需的質數指數缺口

從右往左掃描以保留最長前綴（結果最小）。對每個小於 9 的位置，計算其右側可自由填補的槽位數，並算出各質數尚缺的指數（負值歸零）。

```typescript
// 由右往左掃描可保留最長前綴，得到最小結果。
for (let index = candidateStart; index >= 0; index--) {
  const digit = num.charCodeAt(index) - ZERO_CHARACTER_CODE;
  if (digit < 9) {
    const freeSlots = length - 1 - index;
    let neededTwo = targetTwo - runningTwo;
    let neededThree = targetThree - runningThree;
    let neededFive = targetFive - runningFive;
    let neededSeven = targetSeven - runningSeven;
    if (neededTwo < 0) {
      neededTwo = 0;
    }
    if (neededThree < 0) {
      neededThree = 0;
    }
    if (neededFive < 0) {
      neededFive = 0;
    }
    if (neededSeven < 0) {
      neededSeven = 0;
    }

    // ...
  }

  // ...
}
```

### Step 10：嘗試將當前位加大並確認後綴可行後組出答案

對每個大於當前位的候選數字，扣除其提供的指數後計算剩餘所需的最少位數；若不超過可用的自由槽位，即可構造答案：保留前綴、放入加大後的數字、以 `1` 填滿多餘槽位，再把必要重數字集中於尾端。

```typescript
for (let index = candidateStart; index >= 0; index--) {
  // Step 9：計算當前位的自由槽位數與各質數指數缺口

  if (digit < 9) {
    // Step 9：計算 freeSlots 與 needed* 缺口

    // 由於 t <= 1e14，最多只需 20 位數字，故越靠左的位置
    // 幾乎都在第一個候選即成功，此內層迴圈整體維持 O(1)。
    for (let candidate = digit + 1; candidate <= 9; candidate++) {
      let restTwo = neededTwo - DIGIT_TWO_EXPONENT[candidate];
      let restThree = neededThree - DIGIT_THREE_EXPONENT[candidate];
      let restFive = neededFive - DIGIT_FIVE_EXPONENT[candidate];
      let restSeven = neededSeven - DIGIT_SEVEN_EXPONENT[candidate];
      if (restTwo < 0) {
        restTwo = 0;
      }
      if (restThree < 0) {
        restThree = 0;
      }
      if (restFive < 0) {
        restFive = 0;
      }
      if (restSeven < 0) {
        restSeven = 0;
      }
      const requiredDigits = minimumDigitCount(restTwo, restThree, restFive, restSeven);
      if (requiredDigits <= freeSlots) {
        // 先以 1 填補，再把必要的重數字推到最尾端。
        return (
          num.slice(0, index) +
          String.fromCharCode(ZERO_CHARACTER_CODE + candidate) +
          "1".repeat(freeSlots - requiredDigits) +
          buildTightTail(restTwo, restThree, restFive, restSeven, requiredDigits)
        );
      }
    }
  }

  // ...
}
```

### Step 11：若當前位無法成功，將前綴指數向左滾動一位

若當前位無法組出合法答案，於進入下一輪前將前一位（即將被納入前綴的位置）的指數自 `running*` 中扣除，使前綴累計始終對應「此位之左」的區段。

```typescript
for (let index = candidateStart; index >= 0; index--) {
  // Step 9：計算缺口

  // Step 10：嘗試加大當前位並組出答案

  // 將前綴累計和往左滾動一位。
  if (index > 0) {
    const previousDigit = num.charCodeAt(index - 1) - ZERO_CHARACTER_CODE;
    runningTwo -= DIGIT_TWO_EXPONENT[previousDigit];
    runningThree -= DIGIT_THREE_EXPONENT[previousDigit];
    runningFive -= DIGIT_FIVE_EXPONENT[previousDigit];
    runningSeven -= DIGIT_SEVEN_EXPONENT[previousDigit];
  }
}
```

### Step 12：情況三，同長度皆不可行時增長位數

若同長度下無任何解，則必須增加位數。答案長度至少為原長度加一；若湊足所有指數所需的最少位數更大，則採用之。最後以 `1` 填補多餘位置，並在尾端放上緊湊尾段。

```typescript
// 情況三：同長度皆無解，故至少增長一位。
const totalRequired = minimumDigitCount(targetTwo, targetThree, targetFive, targetSeven);
let answerLength = length + 1;
if (totalRequired > answerLength) {
  answerLength = totalRequired;
}
return (
  "1".repeat(answerLength - totalRequired) +
  buildTightTail(targetTwo, targetThree, targetFive, targetSeven, totalRequired)
);
```

## 時間複雜度

- 剝離 `t` 的質因數僅需 $O(\log t)$；
- 掃描 `num` 定位 0 與累計前綴指數為 $O(n)$；
- 由右往左的主掃描共 $O(n)$ 個位置，每個位置的候選與缺口計算皆為常數；由於 `t <= 10^{14}` 時最多僅需約 20 位數字，靠左位置幾乎立即成功，`buildTightTail` 的建構長度亦受此上限約束，視為常數；
- 綜合上述，主導項為對 `num` 的線性掃描。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 質因數指數查表為固定大小，屬常數空間；
- 累計指數與需求皆使用固定數量的變數；
- 建構的尾段與答案字串長度受質數指數上限約束，於 `t <= 10^{14}` 下為常數位數，額外空間視為常數（不計輸出）。
- 總空間複雜度為 $O(1)$。

> $O(1)$
