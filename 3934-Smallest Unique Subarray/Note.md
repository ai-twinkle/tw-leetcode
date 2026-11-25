# 3934. Smallest Unique Subarray

You are given an integer array `nums`.

Find the minimum length of a subarray that is not identical to any other subarray in `nums`.

Return an integer denoting the minimum possible length of such a subarray.

Two subarrays are considered identical if they have the same length and the same elements in corresponding positions.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要求找出陣列中「恰好只出現一次」的子陣列的最小長度。
陣列長度最大可達 `10^5`，若對每個長度都逐一比較所有子陣列，成本過高，因此需要結合單調性與雜湊技巧。

在思考解法時，可掌握以下核心觀察：

- **長度為 1 的情況可直接判定**：
  只要有任何數值在整個陣列中只出現一次，該元素本身就是唯一子陣列，答案即為 1。

- **唯一性對長度具有單調性**：
  若某個長度的子陣列只出現一次，將它往任一方向延伸一格後，新子陣列的任何出現位置都必然包含原子陣列的一次出現，因此也只會出現一次。
  這代表「是否存在該長度的唯一子陣列」隨長度單調成立，可用二分搜尋找出最小長度。

- **整個陣列本身必定唯一**：
  長度等於陣列長度的子陣列只有一個，因此答案必定存在，可作為二分搜尋的上界。

- **子陣列比較可用滾動雜湊加速**：
  直接逐元素比較子陣列代價過高。透過前綴雜湊，可在常數時間內取得任意區間的雜湊值。同時採用兩組模數與底數的雙重雜湊，可大幅降低碰撞機率。

- **雜湊表可跨輪重複使用**：
  二分搜尋會進行多輪檢查。若每輪都清空雜湊表將造成額外開銷，可改以「世代標記」區分本輪與舊資料，免去清空成本。

依據以上特性，可以採用以下策略：

- **先以計數快速判斷答案是否為 1**。
- **建立雙重前綴雜湊**，使任意子陣列的雜湊值可在常數時間取得。
- **針對指定長度，以開放定址雜湊表統計各子陣列的出現次數**，判斷是否存在只出現一次者。
- **利用唯一性的單調性，以二分搜尋找出最小合法長度**。

此策略將每輪檢查壓縮為線性期望時間，再乘上二分搜尋的對數輪數，能有效處理大規模輸入。

## 解題步驟

### Step 1：定義雜湊所需的全域常數

先定義數值上限、兩組模數與底數，以及模數平方。模數平方用於在減法時補正為非負值，並確保運算在雙精度浮點數下仍能精確表示。

```typescript
const MAX_LENGTH = 100001;
const MODULUS_FIRST = 67108859;
const MODULUS_SECOND = 67108837;
const BASE_FIRST = 100003;
const BASE_SECOND = 131071;
// p^2 + p 仍小於 2^53，因此在雙精度浮點數下，一次減法加一次取模即可精確計算
const MODULUS_FIRST_SQUARE = MODULUS_FIRST * MODULUS_FIRST;
const MODULUS_SECOND_SQUARE = MODULUS_SECOND * MODULUS_SECOND;
```

### Step 2：預先計算兩組底數的冪次

滾動雜湊在取出區間雜湊時，需要底數的各次冪。這些冪次只與長度有關，因此在全域預先計算一次，供所有呼叫共用。

```typescript
// 兩組底數的冪次，只計算一次並由所有呼叫共用
const powerFirst = new Float64Array(MAX_LENGTH + 1);
const powerSecond = new Float64Array(MAX_LENGTH + 1);
powerFirst[0] = 1;
powerSecond[0] = 1;
for (let index = 1; index <= MAX_LENGTH; index++) {
  powerFirst[index] = (powerFirst[index - 1] * BASE_FIRST) % MODULUS_FIRST;
  powerSecond[index] = (powerSecond[index - 1] * BASE_SECOND) % MODULUS_SECOND;
}
```

### Step 3：快速判斷長度為 1 的唯一子陣列

進入主函數後，先統計每個數值的出現次數。只要有任何數值只出現一次，該元素即為唯一子陣列，直接回傳 1。

```typescript
const length = nums.length;

// 長度為 1：任何只出現一次的值本身即為唯一子陣列
const valueCount = new Uint32Array(MAX_LENGTH);
for (let index = 0; index < length; index++) {
  valueCount[nums[index]]++;
}
for (let index = 0; index < length; index++) {
  if (valueCount[nums[index]] === 1) {
    return 1;
  }
}
```

### Step 4：建立雙重前綴雜湊

分別以兩組模數與底數計算前綴雜湊。之後任意區間的雜湊值都能由兩個前綴值與對應冪次在常數時間內求得。

```typescript
// 兩組模數下的前綴雜湊
const prefixFirst = new Float64Array(length + 1);
const prefixSecond = new Float64Array(length + 1);
for (let index = 0; index < length; index++) {
  const value = nums[index];
  prefixFirst[index + 1] = (prefixFirst[index] * BASE_FIRST + value) % MODULUS_FIRST;
  prefixSecond[index + 1] = (prefixSecond[index] * BASE_SECOND + value) % MODULUS_SECOND;
}
```

### Step 5：配置可跨輪重複使用的開放定址雜湊表

雜湊表容量取不小於兩倍陣列長度的 2 的冪次，以便用位元遮罩取代取模。每個槽位記錄兩組雜湊鍵、出現次數與世代標記。另外記錄本輪使用過的槽位，方便最後只掃描有效槽位。世代標記讓每輪無須清空整張表。

```typescript
// 開放定址雜湊表；以世代標記避免在每輪之間清空
let capacity = 1;
while (capacity < length * 2) {
  capacity <<= 1;
}
const mask = capacity - 1;
const keyFirst = new Int32Array(capacity);
const keySecond = new Int32Array(capacity);
const slotCount = new Uint8Array(capacity);
const slotStamp = new Int32Array(capacity);
const usedSlots = new Int32Array(length);
let generation = 0;
```

### Step 6：初始化本輪檢查並計算每個視窗的雙重雜湊

在檢查函數中，先遞增世代標記讓舊資料自動失效，並取出該寬度對應的冪次。接著以固定寬度的視窗滑過整個陣列，對每個視窗以前綴差計算兩組雜湊值。加上模數平方可確保結果在取模前為非負。

```typescript
/**
 * 檢查是否存在某個指定寬度的子陣列恰好只出現一次。
 * @param width 欲測試的子陣列長度。
 * @returns 若存在此寬度的唯一子陣列則回傳 true。
 */
const hasUniqueOfWidth = (width: number): boolean => {
  generation++;
  const multiplierFirst = powerFirst[width];
  const multiplierSecond = powerSecond[width];
  let usedCount = 0;

  for (let start = 0, end = width; end <= length; start++, end++) {
    const hashFirst = (prefixFirst[end] + MODULUS_FIRST_SQUARE - prefixFirst[start] * multiplierFirst) % MODULUS_FIRST;
    const hashSecond = (prefixSecond[end] + MODULUS_SECOND_SQUARE - prefixSecond[start] * multiplierSecond) % MODULUS_SECOND;

    // ...
  }

  // ...
};
```

### Step 7：將視窗雜湊寫入雜湊表並更新出現次數

將兩組雜湊值混合成槽位索引，再以線性探測處理碰撞，探測時有三種情況：

- **遇到非本輪世代的槽位**：視為空槽，寫入新鍵、次數設為 1，並記錄此槽位。
- **遇到相同的鍵**：代表該子陣列重複出現，將次數標為 2。只需區分「一次」與「多次」，因此不必繼續累加。
- **兩者皆非**：前進到下一個槽位繼續探測。

```typescript
/**
 * 檢查是否存在某個指定寬度的子陣列恰好只出現一次。
 * @param width 欲測試的子陣列長度。
 * @returns 若存在此寬度的唯一子陣列則回傳 true。
 */
const hasUniqueOfWidth = (width: number): boolean => {
  // Step 6：遞增世代標記並取得對應冪次

  for (let start = 0, end = width; end <= length; start++, end++) {
    // Step 6：計算目前視窗的雙重雜湊值

    // 將兩個雜湊值混合為槽位索引，再以線性探測處理碰撞
    let slot = (Math.imul(hashFirst, 0x9e3779b1) ^ hashSecond) & mask;
    while (true) {
      if (slotStamp[slot] !== generation) {
        slotStamp[slot] = generation;
        keyFirst[slot] = hashFirst;
        keySecond[slot] = hashSecond;
        slotCount[slot] = 1;
        usedSlots[usedCount++] = slot;
        break;
      }
      if (keyFirst[slot] === hashFirst && keySecond[slot] === hashSecond) {
        slotCount[slot] = 2;
        break;
      }
      slot = (slot + 1) & mask;
    }
  }

  // ...
};
```

### Step 8：掃描本輪使用的槽位判斷是否存在唯一子陣列

所有視窗處理完畢後，只需檢查本輪實際使用過的槽位。若任一槽位的次數仍為 1，代表該寬度存在唯一子陣列，回傳 true；否則回傳 false。

```typescript
/**
 * 檢查是否存在某個指定寬度的子陣列恰好只出現一次。
 * @param width 欲測試的子陣列長度。
 * @returns 若存在此寬度的唯一子陣列則回傳 true。
 */
const hasUniqueOfWidth = (width: number): boolean => {
  // Step 6：遞增世代標記並取得對應冪次

  for (let start = 0, end = width; end <= length; start++, end++) {
    // Step 6：計算目前視窗的雙重雜湊值

    // Step 7：寫入雜湊表並更新出現次數
  }

  for (let index = 0; index < usedCount; index++) {
    if (slotCount[usedSlots[index]] === 1) {
      return true;
    }
  }
  return false;
};
```

### Step 9：以二分搜尋找出最小的唯一子陣列長度

長度 1 已在前面排除，因此下界從 2 開始。整個陣列必定唯一，故上界為陣列長度。由於唯一性對長度單調成立，處理方式如下：

- 若中點寬度存在唯一子陣列，將上界收縮至中點。
- 否則將下界移到中點之後。
- 收斂時的下界即為答案。

```typescript
// 唯一性對寬度具有單調性，因此可二分搜尋最小的合法寬度
let low = 2;
let high = length;
while (low < high) {
  const middle = (low + high) >>> 1;
  if (hasUniqueOfWidth(middle)) {
    high = middle;
  } else {
    low = middle + 1;
  }
}
return low;
```

## 時間複雜度

- 全域冪次預計算為一次性的 $O(V)$，其中 $V$ 為數值上限；
- 長度為 1 的計數檢查需 $O(n + V)$，其中 $V$ 來自計數陣列的配置；
- 建立雙重前綴雜湊需 $O(n)$；
- 二分搜尋共進行 $O(\log n)$ 輪，每輪以雜湊表處理 $O(n)$ 個視窗，期望為 $O(n)$；
- 總時間複雜度為 $O(n \log n + V)$。

> $O(n \log n + V)$

## 空間複雜度

- 計數陣列與冪次陣列為 $O(V)$；
- 前綴雜湊陣列、雜湊表各欄位與已使用槽位陣列皆為 $O(n)$；
- 總空間複雜度為 $O(n + V)$。

> $O(n + V)$
