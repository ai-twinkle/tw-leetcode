# 3731. Find Missing Elements

You are given an integer array `nums` consisting of unique integers.

Originally, `nums` contained every integer within a certain range. 
However, some integers might have gone missing from the array.

The smallest and largest integers of the original range are still present in `nums`.

Return a sorted list of all the missing integers in this range. 
If no integers are missing, return an empty list.

**Constraints:**

- `2 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題要求找出一個原本連續、但中間可能遺漏若干整數的陣列中所有缺失的值。
由於原始範圍的最小值與最大值必定仍存在於陣列中，因此只需在此範圍內找出所有未出現的整數即可。

在思考解法時，可掌握以下核心觀察：

- **數值範圍固定且有限**：
  所有數值皆落在 `1..100` 的區間內，因此可以使用固定容量的位元集合來標記每個數值是否出現，而不需依賴額外的動態容器。

- **端點即為範圍邊界**：
  由於最小值與最大值皆保證存在，只需在單次掃描時同時記錄兩端點，即可界定需要檢查的完整區間。

- **缺失數量可預先計算**：
  範圍寬度扣除實際存在的數值個數，正好等於缺失整數的總數，可用來預先配置結果容器的精確大小。

- **缺失位元可直接跳躍尋找**：
  以位元運算逐字（word）處理標記集合，並利用「取最低位設定位元」的技巧，可直接由一個缺失位置跳到下一個，避免逐一掃描整個範圍。

依據以上特性，可以採用以下策略：

- **以位元集合標記所有出現的數值，並在單次掃描中同步取得範圍端點**。
- **利用範圍寬度與陣列長度的差計算缺失數量，若無缺失則提早結束**。
- **逐字檢視位元集合，並修剪掉兩端邊界外的多餘位元，再透過位元跳躍逐一還原缺失值**。

此策略能在固定範圍內以純位元運算高效地完成，無需額外配置緩衝空間。

## 解題步驟

### Step 1：初始化位元集合與範圍端點

以四個 32 位元的整數作為位元集合，用以覆蓋 `1..128` 的數值範圍，並將其保存在暫存變數中而非配置緩衝區；同時準備追蹤最小值與最大值的變數。

```typescript
const length = nums.length;

// 覆蓋數值 1..128 的存在位元集合，直接存於暫存變數中而非配置緩衝區
let presenceWord0 = 0;
let presenceWord1 = 0;
let presenceWord2 = 0;
let presenceWord3 = 0;
let minimumValue = 101;
let maximumValue = 0;
```

### Step 2：單次掃描標記數值並同步更新端點

透過一次遍歷，逐一取出每個數值，先更新最小值與最大值，再計算其對應的位元位置與遮罩。

```typescript
// 單次掃描：同時標記每個數值並追蹤範圍的兩端點
for (let index = 0; index < length; index++) {
  const value = nums[index];

  if (value < minimumValue) {
    minimumValue = value;
  }

  if (value > maximumValue) {
    maximumValue = value;
  }

  const bitIndex = value - 1;
  const bitMask = 1 << (bitIndex & 31);

  // ...
}
```

### Step 3：依位元位置將數值標記到對應的字組中

根據位元索引落在哪個 32 位元區段，將其標記至對應的位元集合變數上。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：取值、更新端點並計算位元位置與遮罩

  if (bitIndex < 32) {
    presenceWord0 |= bitMask;
  } else if (bitIndex < 64) {
    presenceWord1 |= bitMask;
  } else if (bitIndex < 96) {
    presenceWord2 |= bitMask;
  } else {
    presenceWord3 |= bitMask;
  }
}
```

### Step 4：計算缺失數量並在無缺失時提早回傳

範圍寬度扣除實際存在的數值個數即為缺失數量；若此值不大於 0，代表沒有任何缺失，可直接回傳空陣列。

```typescript
// 範圍寬度扣除已存入的數值數量，恰好等於答案的大小
const missingCount = maximumValue - minimumValue + 1 - length;

if (missingCount <= 0) {
  return [];
}
```

### Step 5：以精確容量配置結果並計算範圍對應的字組界線

依缺失數量配置精確大小的結果陣列，避免容器擴容；同時計算範圍端點對應的位元索引與所在字組索引。

```typescript
// 精確容量，因此結果陣列永不需要擴容或重建其底層儲存
const missingValues: number[] = new Array(missingCount);
const startBitIndex = minimumValue - 1;
const endBitIndex = maximumValue - 1;
const startWordIndex = startBitIndex >>> 5;
const endWordIndex = endBitIndex >>> 5;
let writeIndex = 0;
```

### Step 6：逐字取出位元集合並計算缺失位元

從起始字組走訪到結束字組，先依索引取出對應的位元集合變數，再取其反相以得到「該字組中缺失的位元」。

```typescript
for (let wordIndex = startWordIndex; wordIndex <= endWordIndex; wordIndex++) {
  let presenceWord = 0;

  if (wordIndex === 0) {
    presenceWord = presenceWord0;
  } else if (wordIndex === 1) {
    presenceWord = presenceWord1;
  } else if (wordIndex === 2) {
    presenceWord = presenceWord2;
  } else {
    presenceWord = presenceWord3;
  }

  // 此字組中缺失的數值，尚未修剪掉兩端範圍邊界
  let missingWord = ~presenceWord;

  // ...
}
```

### Step 7：修剪範圍邊界外的多餘缺失位元

在首字組中，將起始邊界之前的位元清除；在末字組中，將結束邊界之後的位元清除。須留意在 JavaScript 中位移 32 位會產生回繞，因此當結束偏移為 31 時整字組無須遮罩。

```typescript
for (let wordIndex = startWordIndex; wordIndex <= endWordIndex; wordIndex++) {
  // Step 6：取出位元集合並計算缺失位元

  if (wordIndex === startWordIndex) {
    missingWord &= -1 << (startBitIndex & 31);
  }

  if (wordIndex === endWordIndex) {
    const endOffset = endBitIndex & 31;

    // 在 JavaScript 中位移 32 位會回繞，因此整個字組無須任何遮罩
    if (endOffset !== 31) {
      missingWord &= (1 << (endOffset + 1)) - 1;
    }
  }

  // ...
}
```

### Step 8：以位元跳躍逐一還原缺失數值

計算此字組對應的基底數值後，反覆取出最低位設定位元，將其還原為實際數值並寫入結果，再清除該位元，直到此字組的缺失位元全部處理完畢。

```typescript
for (let wordIndex = startWordIndex; wordIndex <= endWordIndex; wordIndex++) {
  // Step 6：取出位元集合並計算缺失位元

  // Step 7：修剪範圍邊界外的多餘缺失位元

  const wordBaseValue = (wordIndex << 5) + 1;

  // 直接由一個缺失位元跳到下一個，而非掃描整個範圍
  while (missingWord !== 0) {
    const lowestSetBit = missingWord & -missingWord;

    missingValues[writeIndex] = wordBaseValue + 31 - Math.clz32(lowestSetBit);
    writeIndex++;
    missingWord ^= lowestSetBit;
  }
}
```

### Step 9：回傳所有缺失的數值

所有字組處理完畢後，`missingValues` 已依序填入所有缺失整數，直接回傳即可。

```typescript
return missingValues;
```

## 時間複雜度

- 單次掃描標記數值並取得端點，耗費 $O(n)$；
- 位元集合的字組數量固定，逐字掃描與位元跳躍的總次數受限於範圍寬度，至多為常數量級；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 位元集合僅使用固定數量的暫存變數；
- 結果陣列大小取決於缺失數量，最多為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
