# 2567. Minimum Score by Changing Two Elements

You are given an integer array `nums`.

- The low score of `nums` is the minimum absolute difference between any two integers.
- The high score of `nums` is the maximum absolute difference between any two integers.
- The score of `nums` is the sum of the high and low scores.

Return the minimum score after changing two elements of `nums`.

**Constraints:**

- `3 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題允許修改陣列中的兩個元素，目標是讓「最小差值」與「最大差值」的總和盡可能小。陣列長度最大可達 $10^5$，若嘗試枚舉所有修改方式，計算量將無法接受，因此需要從分數的結構本身尋找突破口。

在思考解法時，可掌握以下核心觀察：

- **最小差值可以無成本歸零**：
  只要把被修改的元素改成陣列中某個既有的值，就會出現兩個相同的數，最小差值立即變為 `0`。因此，問題的重點只剩下最大差值。

- **最大差值只由極端值決定**：
  最大差值等於整體的最大值減去最小值。把某個元素改成區間內的值，就等同於把它從極值的考量中「移除」。

- **最佳策略必然是移除兩個極端值**：
  移除中間的元素無法縮小範圍，只有移除最小端或最大端的元素才有幫助。由於恰好能移除兩個元素，組合只有三種：
    - 移除兩個最小值；
    - 移除兩個最大值；
    - 最小值與最大值各移除一個。

- **只需要前三小與前三大的值**：
  上述三種情況所需的新極值，最多只涉及排序後兩端各三個元素，因此不必完整排序整個陣列。

依據以上特性，可以採用以下策略：

- **以單次線性掃描同時維護前三小與前三大的值**，避免排序的額外成本。
- **計算三種移除方式各自留下的範圍**。
- **取三者中的最小值作為答案**，此時最小差值已為 `0`，總分即等於該範圍。

此策略只需一次線性掃描與常數次比較，就能直接求出最小總分。

## 解題步驟

### Step 1：初始化長度與六個極值追蹤變數

先取得陣列長度，並準備三個變數記錄目前最小的三個值、三個變數記錄目前最大的三個值。最小值鏈初始化為 `Infinity`，最大值鏈初始化為 `-Infinity`，確保任何輸入值都能順利寫入。

```typescript
const length = nums.length;

let smallest1 = Infinity;
let smallest2 = Infinity;
let smallest3 = Infinity;
let largest1 = -Infinity;
let largest2 = -Infinity;
let largest3 = -Infinity;
```

### Step 2：單次掃描，維護前三小的遞增鏈

逐一讀取每個元素。若目前值小於第三小，代表它應進入前三小的行列：依序與第二小、第一小比較，找出插入位置，並將較大的值往後推移，使三者保持遞增順序。

```typescript
// 單次掃描，同時收集最小的三個值與最大的三個值
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // 維護最小三個值的遞增鏈
  if (value < smallest3) {
    if (value < smallest2) {
      smallest3 = smallest2;
      if (value < smallest1) {
        smallest2 = smallest1;
        smallest1 = value;
      } else {
        smallest2 = value;
      }
    } else {
      smallest3 = value;
    }
  }

  // ...
}
```

### Step 3：在同一次掃描中，維護前三大的遞減鏈

以對稱的方式處理最大端。若目前值大於第三大，就依序與第二大、第一大比較並插入正確位置，使三者保持遞減順序。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：讀取目前值並維護最小三個值的遞增鏈

  // 維護最大三個值的遞減鏈
  if (value > largest3) {
    if (value > largest2) {
      largest3 = largest2;
      if (value > largest1) {
        largest2 = largest1;
        largest1 = value;
      } else {
        largest2 = value;
      }
    } else {
      largest3 = value;
    }
  }
}
```

### Step 4：計算三種移除極值方式所留下的範圍

由於最小差值可藉由製造重複值歸零，總分只取決於範圍。分別計算以下三種情況：

- 移除兩個最小值：範圍為最大值減第三小；
- 移除兩個最大值：範圍為第三大減最小值；
- 兩端各移除一個：範圍為第二大減第二小。

```typescript
// 透過複製既有值使最小差值變為 0；再移除兩個極端值以最小化範圍
const dropTwoSmallest = largest1 - smallest3;
const dropTwoLargest = largest3 - smallest1;
const dropOneEach = largest2 - smallest2;
```

### Step 5：取三者中的最小範圍作為答案並回傳

先比較前兩種情況取較小者，再與第三種情況比較，最終得到的就是最小總分。

```typescript
let best = dropTwoSmallest < dropTwoLargest ? dropTwoSmallest : dropTwoLargest;
if (dropOneEach < best) {
  best = dropOneEach;
}

return best;
```

## 時間複雜度

- 對陣列進行一次線性掃描，每個元素只做常數次比較與賦值；
- 計算三種範圍並取最小值為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數記錄前三小、前三大與候選結果；
- 不需要任何額外陣列或排序空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
