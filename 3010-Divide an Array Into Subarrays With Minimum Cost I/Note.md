# 3010. Divide an Array Into Subarrays With Minimum Cost I

You are given an array of integers `nums` of length `n`.

The cost of an array is the value of its first element. 
For example, the cost of `[1,2,3]` is `1` while the cost of `[3,4,1]` is `3`.

You need to divide `nums` into `3` disjoint contiguous subarrays.

Return the minimum possible sum of the cost of these subarrays.

**Constraints:**

- `3 <= n <= 50`
- `1 <= nums[i] <= 50`

## 基礎思路

本題要把陣列切成 **3 段互不重疊且連續**的子陣列，並使三段的「成本總和」最小。每段的成本只取決於該段的**第一個元素**，因此切割的位置只會影響「第二段起點」與「第三段起點」各自選到哪個元素作為成本。

關鍵觀察如下：

* **第一段成本固定**：因為第一段一定從陣列第 0 個元素開始，所以第一段成本必為 `nums[0]`，無論怎麼切都不變。
* **問題化簡為挑兩個起點**：只要選定第二段起點與第三段起點，就決定了第二段與第三段成本；而切割必須保證三段皆非空，因此起點索引有順序與界線限制。
* **目標變成最小化兩個起點值的和**：在合法的第三段起點掃描過程中，只要同時維護「目前為止可作為第二段起點的最小值」，就能在一次掃描內算出最小的「第二段成本 + 第三段成本」。
* **單次線性掃描即可完成**：因為每個第三段起點只需要用當下維護的最小第二段起點來更新答案，然後再更新最小值供後續使用。

## 解題步驟

### Step 1：初始化固定成本與狀態

先取陣列長度與第一段固定成本；再初始化「第二段起點最小值」以及「第二、三段成本和的最小值」。

```typescript
// 基本常數：陣列長度與第一段必然成本
const length = nums.length;
const firstCost = nums[0];

// 用於最小化第二段與第三段成本總和的狀態
let minimumSecondStart = nums[1];
let minimumSecondThirdSum = minimumSecondStart + nums[2];
```

### Step 2：建立單次掃描的最外層迴圈（枚舉第三段起點）

第三段起點必須至少在索引 2（保證前兩段非空），並一路掃到結尾。

```typescript
// 單次掃描：枚舉合法的第三段起點，同時維護最佳第二段起點
for (let thirdStartIndex = 2; thirdStartIndex < length; thirdStartIndex++) {
  // ...
}
```

### Step 3：用目前最佳第二段起點，嘗試更新最小「第二+第三」成本和

對每個 `thirdStartIndex`，用已維護的 `minimumSecondStart` 與當前第三段起點值組成候選和，並更新全域最小值。

```typescript
for (let thirdStartIndex = 2; thirdStartIndex < length; thirdStartIndex++) {
  // Step 2：建立單次掃描的最外層迴圈（枚舉第三段起點）

  const candidateSum = minimumSecondStart + nums[thirdStartIndex];
  if (candidateSum < minimumSecondThirdSum) {
    minimumSecondThirdSum = candidateSum;
  }

  // ...
}
```

### Step 4：更新「第二段起點最小值」，供後續第三段起點使用

掃描往右走時，新的位置也可能成為更小的第二段起點成本，因此需要隨時更新。

```typescript
for (let thirdStartIndex = 2; thirdStartIndex < length; thirdStartIndex++) {
  // Step 2：建立單次掃描的最外層迴圈（枚舉第三段起點）

  // Step 3：用目前最佳第二段起點更新最小「第二+第三」成本和

  if (nums[thirdStartIndex] < minimumSecondStart) {
    minimumSecondStart = nums[thirdStartIndex];
  }
}
```

### Step 5：合併固定第一段成本並回傳答案

第一段成本固定，因此最後把它加上已求得的最小「第二+第三」成本和即可。

```typescript
// 合併固定第一段成本與最佳剩餘成本
return firstCost + minimumSecondThirdSum;
```

## 時間複雜度

- 最外層 `for` 迴圈從 `thirdStartIndex = 2` 走到 `length - 1`，迭代次數為 `n - 2`；
- 每次迭代只做常數次運算（加法、比較、指派），無巢狀迴圈。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數（`length`, `firstCost`, `minimumSecondStart`, `minimumSecondThirdSum`, 以及迴圈索引），不隨 `n` 增長。
- 總空間複雜度為 $O(1)$。

> $O(1)$
