# 904. Fruit Into Baskets

You are visiting a farm that has a single row of fruit trees arranged from left to right. 
The trees are represented by an integer array `fruits` where `fruits[i]` is the type of fruit the $i^{th}$ tree produces.

You want to collect as much fruit as possible. However, the owner has some strict rules that you must follow:

- You only have two baskets, and each basket can only hold a single type of fruit. 
  There is no limit on the amount of fruit each basket can hold.
- Starting from any tree of your choice, you must pick exactly one fruit from every tree (including the start tree) 
  while moving to the right. The picked fruits must fit in one of your baskets.
- Once you reach a tree with fruit that cannot fit in your baskets, you must stop.

Given the integer array `fruits`, return the maximum number of fruits you can pick.

**Constraints:**

- `1 <= fruits.length <= 10^5`
- `0 <= fruits[i] < fruits.length`

## 基礎思路

本題的核心是利用**滑動窗口（Sliding Window）** 的方式來解決問題。

我們可以透過以下步驟來達成目標：

- 使用兩個籃子，各自只能裝一種水果，因此我們最多只能選兩種類型的水果。
- 我們希望找到最長的連續區間，其中最多僅包含兩種不同的水果類型。
- 可以透過一個窗口來代表我們目前能夠採集的水果範圍，並記錄這個窗口的最大長度。
- 每次遇到第三種水果時，需調整窗口，只保留前面連續同種類型的水果與當前水果作為新起點。
- 透過這樣的方式，一次遍歷即可找到最長且符合條件的區間。

## 解題步驟

### Step 1：初始化所需的輔助變數

首先初始化紀錄狀態的變數：

```typescript
const n = fruits.length;
let firstBasketFruit = -1;          // 第一個籃子內水果類型
let secondBasketFruit = -1;         // 第二個籃子內水果類型
let lastFruitType = -1;             // 上一次遇到的水果類型
let lastFruitStreakCount = 0;       // 紀錄窗口尾端相同水果的連續數量
let currentWindowFruitCount = 0;    // 當前窗口內水果數量
let maxFruitCount = 0;              // 最終要回傳的最大水果數
```

### Step 2：開始遍歷每一顆水果樹，調整窗口大小

對每個位置上的水果，判斷是否能放入現有的籃子中：

```typescript
for (let index = 0; index < n; index++) {
  const currentFruitType = fruits[index];

  // 若水果屬於已有籃子之一，則窗口擴展一格；
  // 若水果不符合已有籃子類型，則重新設定窗口大小為上一個連續水果數量加上當前水果一個
  if (currentFruitType === firstBasketFruit || currentFruitType === secondBasketFruit) {
    currentWindowFruitCount++;
  } else {
    currentWindowFruitCount = lastFruitStreakCount + 1;
  }

  // ...
}
```

### Step 3：更新籃子狀態與連續水果資訊

更新窗口尾端的連續水果數量，並重新安排籃子的內容：

```typescript
for (let index = 0; index < n; index++) {
  // Step 2：開始遍歷每一顆水果樹，調整窗口大小

  // 判斷當前水果是否與上一個水果類型相同
  if (currentFruitType === lastFruitType) {
    lastFruitStreakCount++;
  } else {
    // 如果不同，則更新尾端連續水果數量為1，並更新籃子內的水果種類
    lastFruitStreakCount = 1;
    lastFruitType = currentFruitType;

    // 將籃子內水果的類型更新
    firstBasketFruit = secondBasketFruit;
    secondBasketFruit = currentFruitType;
  }

  // ...
}
```

### Step 4：更新已知的最大窗口長度

每次遍歷時，若當前窗口大於歷史最大值，則更新：

```typescript
for (let index = 0; index < n; index++) {
  // Step 2：開始遍歷每一顆水果樹，調整窗口大小
  
  // Step 3：更新籃子狀態與連續水果資訊
  
  // 檢查當前窗口長度是否超越已知的最大值
  if (currentWindowFruitCount > maxFruitCount) {
    maxFruitCount = currentWindowFruitCount;
  }
}
```

### Step 5：返回最終的答案

完成遍歷後回傳最大可採摘水果數：

```typescript
return maxFruitCount;
```

## 時間複雜度

- 只需遍歷整個水果陣列一次，每個元素僅需進行常數時間 ($O(1)$) 的操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的輔助變數，未使用額外的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
