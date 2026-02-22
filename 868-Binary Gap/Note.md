# 868. Binary Gap

Given a positive integer `n`, 
find and return the longest distance between any two adjacent `1`'s in the binary representation of `n`. 
If there are no two adjacent `1`'s, return `0`.

Two `1`'s are adjacent if there are only `0`'s separating them (possibly no `0`'s). 
The distance between two `1`'s is the absolute difference between their bit positions. 
For example, the two `1`'s in `"1001"` have a distance of 3.

**Constraints:**

- `1 <= n <= 10^9`

## 基礎思路

本題要求在正整數的二進位表示中，找出任意兩個相鄰 `1`（中間只允許有 `0`，也可能沒有 `0`）之間的**最大位元距離**；若不存在兩個 `1`，則回傳 `0`。解題核心在於把「相鄰 `1`」視為二進位串中連續出現的 `1` 位置對，並取其中距離最大者。

在思考解法時，可掌握以下核心觀察：

* **距離只由 `1` 的位置決定**：
  任何兩個相鄰 `1` 的距離等於它們的位元位置差，與中間有多少個 `0` 本質上是同一件事。

* **只需追蹤前一個 `1` 的位置**：
  當掃描二進位位元時，每遇到一個 `1`，就能立刻與上一個 `1` 計算距離並更新最大值。

* **一次線性掃描即可完成**：
  以從低位到高位（或反之）依序檢查位元的方式，維持「上一個 `1` 位置」與「目前最大距離」，不需要額外儲存所有 `1` 的位置。

* **不存在兩個 `1` 時答案為 0**：
  若掃描過程中只遇到零次或一次 `1`，代表無法形成任何相鄰 `1` 的距離，結果自然為 `0`。

依據以上特性，可以採用以下策略：

* 逐位掃描整數的二進位表示，遇到 `1` 時與前一個 `1` 的位置做距離更新。
* 全程只保留必要狀態：上一個 `1` 的位置與目前最大距離。
* 掃描結束後回傳最大距離；若從未形成有效距離，則回傳 `0`。

## 解題步驟

### Step 1：建立初始狀態以追蹤答案與上一個 `1` 的位置

需要一個變數記錄目前找到的最大距離，並用另一個狀態記錄「上一個 `1` 出現的位置」，以便後續遇到新的 `1` 時計算距離。

```typescript
let maximumGap = 0;
let previousOneBitIndex = -1;
let currentBitIndex = 0;
```

### Step 2：逐位掃描整數的二進位表示並前進位元位置

透過不斷處理最低位元，逐步將數值向右移動，並同步累加目前正在處理的位元位置索引，直到數值被處理完為止。

```typescript
while (n > 0) {
  const currentBit = n & 1;

  // ...
}
```

### Step 3：遇到 `1` 時更新最大距離並刷新上一個 `1` 的位置

當目前位元為 `1`，若先前已存在另一個 `1`，即可計算兩者位元位置差並更新最大距離；接著把當前位置記為最新的 `1` 位置，供之後使用。

```typescript
while (n > 0) {
  // Step 2：逐位掃描整數的二進位表示並前進位元位置

  if (currentBit === 1) {
    if (previousOneBitIndex !== -1) {
      const gapDistance = currentBitIndex - previousOneBitIndex;

      if (gapDistance > maximumGap) {
        maximumGap = gapDistance;
      }
    }

    previousOneBitIndex = currentBitIndex;
  }

  // ...
}
```

### Step 4：右移數值並推進位元索引以處理下一個位元

每輪處理完當前最低位元後，將數值右移一位以移除已處理位元，同時將位元索引加一，進入下一輪檢查。

```typescript
while (n > 0) {
  // Step 2：逐位掃描整數的二進位表示並前進位元位置

  // Step 3：遇到 `1` 時更新最大距離並刷新上一個 `1` 的位置

  n >>= 1;
  currentBitIndex++;
}
```

### Step 5：回傳最大距離，若不存在有效距離則自然為 0

掃描結束後，最大距離已在過程中被維護完成；若從未形成兩個 `1` 的距離，最大值仍為 0，符合題目要求。

```typescript
return maximumGap;
```

## 時間複雜度

- 每次迴圈處理一個位元，迭代次數等於二進位長度；
- `n <= 10^9` 時位元長度最多約為 30，因此處理成本隨位元數線性成長；
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 只使用固定數量的狀態變數來追蹤位元位置與答案；
- 不需要額外陣列或動態記憶體。
- 總空間複雜度為 $O(1)$。

> $O(1)$
