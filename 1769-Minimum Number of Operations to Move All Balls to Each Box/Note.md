# 1769. Minimum Number of Operations to Move All Balls to Each Box

You have `n` boxes. 
You are given a binary string `boxes` of length `n`, where `boxes[i]` is `'0'` if the $i^{th}$ box is empty, 
and `'1'` if it contains one ball.

In one operation, you can move one ball from a box to an adjacent box. 
Box `i` is adjacent to box `j` if `abs(i - j) == 1`. 
Note that after doing so, there may be more than one ball in some boxes.

Return an array `answer` of size `n`, where `answer[i]` is the minimum number of operations needed to move all the balls to the $i^{th}$ box.
Each `answer[i]` is calculated considering the initial state of the boxes.

**Constraints:**

- `n == boxes.length`
- `1 <= n <= 2000`
- `boxes[i]` is either `'0'` or `'1'`.

## 基礎思路

本題的核心是計算將所有球移動到指定盒子所需的最少操作次數。
根據題意，每次操作只能將球移動到相鄰盒子，因此每個盒子的總移動操作可分解成兩部分：

- 從左邊往右邊依序傳遞的次數。
- 從右邊往左邊依序傳遞的次數。

為了避免重複計算，我們分別從左到右和從右到左，計算並累計每個盒子的操作次數。

## 解題步驟

### Step 1: 初始化紀錄變數

首先初始化後續計算中需要使用的變數：

```typescript
const n = boxes.length;                            // 總共有 n 個盒子
const operations: number[] = new Array(n).fill(0); // 紀錄每個盒子的操作次數

let count = 0; // 紀錄目前位置需要傳遞數量
let steps = 0; // 累積操作次數
```

### Step 2: 計算從左邊傳遞到右邊的操作次數

從左到右遍歷每個盒子，計算將左側的球移動到當前盒子的操作次數：

```typescript
// 順向計算 (從左邊傳遞到右邊)
for (let i = 0; i < n; i++) {
  operations[i] += steps; // 1. 把前一輪迭代的操作次數加到當前位置 (因為第三步已經傳遞到當前位置)
  
  // 2. 如果當前位置有球，需要增加之後需要傳遞的球數
  if (boxes[i] === '1') {
    count++;
  }
  
  // 3. 把球傳遞到下一個位置，累積操作次數
  steps += count;
}
```

完成這一步後，`operations` 紀錄了從左邊往右邊的所有移動操作次數。

### Step 3: 計算從右邊傳遞到左邊的操作次數

重置 `count` 和 `steps` 變數，然後從右到左再次計算：

```typescript
count = 0; // 重置 count 變數
steps = 0; // 重置 steps 變數

// 逆向計算 (從右邊傳遞到左邊)
for (let i = n - 1; i >= 0; i--) {
  // 1. 添加前一輪迭代的操作次數 到 已經計算過的左到右傳遞的操作次數 上
  operations[i] += steps;
  
  // 2. 如果當前位置有球，需要增加之後需要傳遞的球數
  if (boxes[i] === '1') {
    count++;
  }
  
  // 3. 把球傳遞到下一個位置 (向左傳)，累積操作次數
  steps += count;
}
```

### Step 4: 返回結果

執行完後，`operations` 即包含了完整的從兩側向中央累加的最少操作次數。

```typescript
return operations;
```

## 時間複雜度

- 整個程式共進行了兩次完整遍歷，每次為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用了長度為 $n$ 的陣列儲存每個盒子的操作次數，沒有其他動態的額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
