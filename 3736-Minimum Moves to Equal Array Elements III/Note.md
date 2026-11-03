# 3736. Minimum Moves to Equal Array Elements III

You are given an integer array `nums`.

In one move, you may increase the value of any single element `nums[i]` by 1.

Return the minimum total number of moves required so that all elements in `nums` become equal.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題允許每次將任一元素加一，要求以最少的操作次數使所有元素相等。
由於操作只能「增加」而不能「減少」，因此最終的共同值不可能低於陣列中的任何元素。

在思考解法時，可掌握以下核心觀察：

- **最終值至少為陣列最大值**：
  操作只能使數值變大，最大的元素無法被降低，因此所有元素最終必須至少達到最大值。

- **最終值恰為最大值時操作數最少**：
  若選擇高於最大值的目標，每個元素都需額外多增加相同的量，總操作數只會變多，因此最佳目標即為最大值本身。

- **總操作數等於每個元素與最大值的差距總和**：
  每個元素所需的操作次數為「最大值減去自身」，將其加總即為答案，而此總和可化簡為「最大值乘以元素個數，再減去所有元素之和」。

依據以上特性，可以採用以下策略：

- **以單次線性掃描同時求出最大值與總和**。
- **以「最大值 × 元素個數 − 總和」直接計算所需的最少操作次數**。

此策略僅需一次遍歷即可得到答案，簡潔且高效。

## 解題步驟

### Step 1：初始化長度、最大值與總和

先取得陣列長度，並準備記錄最大值與總和的累積變數，供後續單次掃描使用。

```typescript
const length = nums.length;
let maximum = 0;
let sum = 0;
```

### Step 2：單次遍歷同時求出最大值與總和

逐一走訪每個元素，將其累加至總和，並在遇到更大的值時更新最大值，使兩項資訊在同一次掃描中完成。

```typescript
// 在單次遍歷中同時求出最大值與總和
for (let index = 0; index < length; index++) {
  const value = nums[index];
  sum += value;
  if (value > maximum) {
    maximum = value;
  }
}
```

### Step 3：計算並回傳最少操作次數

將每個元素提升至最大值所需的總差距，即為 `maximum * length - sum`，直接回傳此結果。

```typescript
// 將每個元素提升至最大值：總差距 = maximum * length - sum
return maximum * length - sum;
```

## 時間複雜度

- 單次遍歷整個陣列，每個元素處理一次；
- 最終計算為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
