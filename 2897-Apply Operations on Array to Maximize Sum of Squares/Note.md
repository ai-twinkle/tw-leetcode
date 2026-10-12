# 2897. Apply Operations on Array to Maximize Sum of Squares

You are given a 0-indexed integer array `nums` and a positive integer `k`.

You can do the following operation on the array any number of times:

- Choose any two distinct indices `i` and `j` 
  and simultaneously update the values of `nums[i]` to `(nums[i] AND nums[j])` 
  and `nums[j]` to (`nums[i]` OR `nums[j]`). 
  Here, OR denotes the bitwise OR operation, and AND denotes the bitwise AND operation.

You have to choose `k` elements from the final array and calculate the sum of their squares.

Return the maximum sum of squares you can achieve.

Since the answer can be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= k <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題允許任意次對兩個元素同時進行 AND 與 OR 的交換操作，最後從陣列中挑出 `k` 個元素，使其平方和最大，並對 `10^9 + 7` 取模。
陣列長度可達 `10^5`，因此不能模擬操作，必須從操作的本質找出結構性的答案。

在思考解法時，可掌握以下核心觀察：

- **操作只會搬移位元，不會產生或消滅位元**：
  對兩數同時取 AND 與 OR 時，每個位元位置上的 1 的總數不變：兩者皆為 1 時維持不變，只有一方為 1 時則把該 1 移到另一個元素上。因此每個位元位置的出現次數是不變量。

- **出現次數完全決定可達狀態**：
  在各位元出現次數固定的前提下，可以把位元任意集中到特定元素上。問題因此轉化為：如何分配各位元的 1，使挑出的 `k` 個元素平方和最大。

- **平方函數具凸性，應盡量集中位元**：
  把位元集中在同一個數上，平方和會比分散更大。所以最佳策略是貪婪地讓每次挑出的元素都包含目前所有尚未用完的位元。

- **貪婪結果只在少數門檻處改變**：
  第 `t` 次挑出的值，等於出現次數大於 `t` 的所有位元所組成的遮罩。這個遮罩只在某些位元被用完時才改變，最多改變 30 次，因此可以把相同的挑選合併成一次乘法。

- **大量計數可平行化**：
  統計每個位元位置的出現次數是主要成本。可把多個位元的計數打包進同一個整數的不同分道中，一次查表與加法就同時累計多個位元位置，並在分道溢位前定期清算。

- **取模平方需避免精度遺失**：
  接近 `2^30` 的數平方後超出浮點數能精確表示的範圍，需把乘數拆成高低兩半分段計算再取模。

依據以上特性，可以採用以下策略：

- **以分道打包的方式統計每個位元位置的出現次數**，並分批清算以避免分道溢位。
- **將有出現的位元位置依出現次數由小到大排序**，同時建立包含所有出現位元的初始遮罩。
- **依出現次數門檻分組進行貪婪挑選**：每組內的挑選值相同，可一次乘上次數累加；每過一個門檻，就把用完的位元自遮罩中移除。
- **以安全的分段取模平方計算每個挑選值的平方**，確保結果精確。

此策略的計算成本主要落在一次線性掃描，其餘步驟只與位元寬度有關，高效且穩定。

## 解題步驟

### Step 1：定義模數與位元寬度常數

先定義答案所需的模數，以及題目數值範圍下會用到的最大位元寬度 30。

```typescript
const MAXIMUM_SUM_MODULO = 1000000007;
const MAXIMUM_SUM_BIT_WIDTH = 30;
```

### Step 2：建立半位元組分道查表

建立一張長度 16 的查表，把一個半位元組（4 個位元）的每個位元分別放到 32 位元整數中四個獨立的 8 位元分道。之後一次查表加一次加法，就能同時累計四個位元位置的出現次數。

```typescript
/**
 * 將一個半位元組的四個位元打包進同一個 32 位元字組中四個獨立的 8 位元分道，
 * 使單次查表與一次加法即可同時累計四個位元位置。
 */
const MAXIMUM_SUM_NIBBLE_LANE_TABLE: Int32Array = new Int32Array(16);

for (let nibble = 0; nibble < 16; nibble += 1) {
  MAXIMUM_SUM_NIBBLE_LANE_TABLE[nibble] =
    (nibble & 1) |
    (((nibble >> 1) & 1) << 8) |
    (((nibble >> 2) & 1) << 16) |
    (((nibble >> 3) & 1) << 24);
}
```

### Step 3：實作不失精度的取模平方輔助函數

挑選值最大接近 `2^30`，直接平方會超出浮點數能精確表示的整數範圍。因此把乘數拆成高、低兩個 16 位元部分：高半部先乘再取模，接著左移 16 位，再加上低半部的乘積，最後取模。每一步的中間值都不會超出精確範圍。

```typescript
/**
 * 透過將乘數拆分為高、低兩個 16 位元部分，
 * 在不超出 double 精確範圍的前提下，計算小於 2^30 之數值的平方並對 1e9+7 取模。
 *
 * @param baseValue 嚴格小於 2^30 的非負整數。
 * @returns (baseValue * baseValue) mod 1e9+7。
 */
function squareModuloMaximumSum(baseValue: number): number {
  const highHalf = (baseValue / 65536) | 0;
  const lowHalf = baseValue - highHalf * 65536;

  return (
    (((highHalf * baseValue) % MAXIMUM_SUM_MODULO) * 65536 + lowHalf * baseValue) %
    MAXIMUM_SUM_MODULO
  );
}
```

### Step 4：初始化位元計數器與分道累加字組

進入主函數後，先取得陣列長度並建立各位元位置的計數陣列。因為操作只會搬移位元，每個位元位置的出現次數即為決定答案的不變量。

接著準備 8 個分道累加字組，每個負責 4 個位元位置，合計涵蓋 32 個位元。另外準備讀取索引。

```typescript
const length = nums.length;

// 此操作只會搬移已設定的位元，因此每個位元位置的出現次數皆為不變量，
// 並完全決定所有可達到的陣列狀態。
const bitCounts = new Int32Array(32);

let laneWord0 = 0;
let laneWord1 = 0;
let laneWord2 = 0;
let laneWord3 = 0;
let laneWord4 = 0;
let laneWord5 = 0;
let laneWord6 = 0;
let laneWord7 = 0;
let readIndex = 0;
```

### Step 5：分批讀取元素並以查表累加各分道

每個 8 位元分道最多只能容納 255，因此以 255 個元素為一批處理。每批先決定結束位置，再對批內每個元素依序取出 8 個半位元組，查表後加到對應的分道字組中，一次累計 32 個位元位置。

```typescript
while (readIndex < length) {
  // 每個 8 位元分道在溢位前最多只能容納 255，
  // 因此每處理 255 個元素就將累計結果清算進寬計數器一次。
  let chunkEnd = readIndex + 255;

  if (chunkEnd > length) {
    chunkEnd = length;
  }

  for (; readIndex < chunkEnd; readIndex += 1) {
    const element = nums[readIndex];

    laneWord0 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[element & 15];
    laneWord1 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 4) & 15];
    laneWord2 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 8) & 15];
    laneWord3 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 12) & 15];
    laneWord4 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 16) & 15];
    laneWord5 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 20) & 15];
    laneWord6 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 24) & 15];
    laneWord7 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 28) & 15];
  }

  // ...
}
```

### Step 6：將各分道的累計值清算進位元計數器

一批處理完後，從每個分道字組依序取出四個 8 位元分道的值，加到對應位元位置的計數器中。第 `w` 個字組的第 `laneIndex` 個分道對應位元位置 `4w + laneIndex`。

```typescript
while (readIndex < length) {
  // Step 5：決定本批範圍並以查表累加各分道

  for (let laneIndex = 0; laneIndex < 4; laneIndex += 1) {
    const laneShift = laneIndex * 8;

    bitCounts[laneIndex] += (laneWord0 >>> laneShift) & 255;
    bitCounts[laneIndex + 4] += (laneWord1 >>> laneShift) & 255;
    bitCounts[laneIndex + 8] += (laneWord2 >>> laneShift) & 255;
    bitCounts[laneIndex + 12] += (laneWord3 >>> laneShift) & 255;
    bitCounts[laneIndex + 16] += (laneWord4 >>> laneShift) & 255;
    bitCounts[laneIndex + 20] += (laneWord5 >>> laneShift) & 255;
    bitCounts[laneIndex + 24] += (laneWord6 >>> laneShift) & 255;
    bitCounts[laneIndex + 28] += (laneWord7 >>> laneShift) & 255;
  }

  // ...
}
```

### Step 7：重置分道累加字組以進入下一批

清算完成後，把所有分道字組歸零，讓下一批從乾淨狀態開始累加，避免分道溢位。

```typescript
while (readIndex < length) {
  // Step 5：決定本批範圍並以查表累加各分道

  // Step 6：將各分道累計值清算進位元計數器

  laneWord0 = 0;
  laneWord1 = 0;
  laneWord2 = 0;
  laneWord3 = 0;
  laneWord4 = 0;
  laneWord5 = 0;
  laneWord6 = 0;
  laneWord7 = 0;
}
```

### Step 8：篩選有出現的位元位置並建立初始遮罩

準備存放排序後出現次數與位元權重的陣列，並逐一檢視 30 個位元位置。出現次數為 0 的位元不會影響答案，直接略過；有出現的位元則加入「所有出現位元」的遮罩中，這個遮罩就是第一次貪婪挑選的值。

```typescript
// 依出現次數排序已出現的位元位置；
// 最多僅有 30 筆，插入排序即為最佳選擇。
const sortedBitCounts = new Int32Array(MAXIMUM_SUM_BIT_WIDTH);
const sortedBitWeights = new Int32Array(MAXIMUM_SUM_BIT_WIDTH);
let occupiedBitTotal = 0;
let allOccupiedBitsMask = 0;

for (let bitPosition = 0; bitPosition < MAXIMUM_SUM_BIT_WIDTH; bitPosition += 1) {
  const occurrenceCount = bitCounts[bitPosition];

  if (occurrenceCount === 0) {
    continue;
  }

  allOccupiedBitsMask += 1 << bitPosition;

  // ...
}
```

### Step 9：以插入排序依出現次數由小到大排列位元

對每個有出現的位元，從已排序區段尾端往前找插入位置，把出現次數較大的項目往後挪，再把目前位元的出現次數與權重放進正確位置。完成後得到依出現次數遞增排列的位元序列。

```typescript
for (let bitPosition = 0; bitPosition < MAXIMUM_SUM_BIT_WIDTH; bitPosition += 1) {
  // Step 8：略過未出現的位元並加入初始遮罩

  let insertIndex = occupiedBitTotal;

  while (insertIndex > 0 && sortedBitCounts[insertIndex - 1] > occurrenceCount) {
    sortedBitCounts[insertIndex] = sortedBitCounts[insertIndex - 1];
    sortedBitWeights[insertIndex] = sortedBitWeights[insertIndex - 1];
    insertIndex -= 1;
  }

  sortedBitCounts[insertIndex] = occurrenceCount;
  sortedBitWeights[insertIndex] = 1 << bitPosition;
  occupiedBitTotal += 1;
}
```

### Step 10：初始化貪婪挑選所需的狀態

準備以下狀態：
- 平方和累計值。
- 目前挑選值，初始為所有出現位元的遮罩。
- 剩餘可挑選次數。
- 上一個門檻的出現次數。
- 目前處理到的位元組索引。

```typescript
let sumOfSquaresModulo = 0;
let pickedValue = allOccupiedBitsMask;
let remainingPicks = k;
let previousExhaustCount = 0;
let groupIndex = 0;
```

### Step 11：依出現次數門檻批次累加相同挑選值的平方

第 `t` 次挑選的值，等於出現次數大於 `t` 的位元所組成的遮罩。這個值只在某些位元用完時改變，因此兩個相鄰門檻之間的挑選值都相同。

每一輪計算本組可重複挑選的次數（不超過剩餘挑選數），以一次乘法累加這些挑選的平方，再更新剩餘挑選數與上一個門檻。

```typescript
// 第 t 次貪婪挑選的值，等於出現次數超過 t 的位元所構成的遮罩，
// 其僅在少數相異的出現次數處改變，因此可將相同的挑選合併為一次乘法。
while (groupIndex < occupiedBitTotal && remainingPicks > 0) {
  const exhaustCount = sortedBitCounts[groupIndex];
  let identicalPickCount = exhaustCount - previousExhaustCount;

  if (identicalPickCount > remainingPicks) {
    identicalPickCount = remainingPicks;
  }

  sumOfSquaresModulo =
    (sumOfSquaresModulo + identicalPickCount * squareModuloMaximumSum(pickedValue)) %
    MAXIMUM_SUM_MODULO;
  remainingPicks -= identicalPickCount;
  previousExhaustCount = exhaustCount;

  // ...
}
```

### Step 12：移除在此門檻用完的位元

越過目前門檻後，所有出現次數恰好等於此門檻的位元都已用完，需從挑選值中逐一扣除它們的權重，並推進組索引，讓下一輪以縮小後的遮罩繼續挑選。

```typescript
while (groupIndex < occupiedBitTotal && remainingPicks > 0) {
  // Step 11：計算本組相同挑選次數並批次累加平方

  // 移除所有在此出現次數層級用完的位元位置。
  while (groupIndex < occupiedBitTotal && sortedBitCounts[groupIndex] === exhaustCount) {
    pickedValue -= sortedBitWeights[groupIndex];
    groupIndex += 1;
  }
}
```

### Step 13：回傳最大平方和

所有挑選完成後，累計值即為取模後的最大平方和，直接回傳。

```typescript
return sumOfSquaresModulo;
```

## 時間複雜度

- 分道計數對每個元素做 8 次查表與加法，為 $O(n)$；
- 每 255 個元素清算一次分道，清算總成本為 $O(n / 255)$，不超過 $O(n)$；
- 位元位置最多 30 個，插入排序與貪婪分組皆只與位元寬度有關，為常數時間；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 位元計數陣列、排序用的出現次數與權重陣列、半位元組查表，大小皆固定；
- 其餘只使用固定數量的變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
