# 781. Rabbits in Forest

There is a forest with an unknown number of rabbits. 
We asked n rabbits "How many rabbits have the same color as you?" and collected the answers in an integer array `answers` 
where `answers[i]` is the answer of the $i^{th}$ rabbit.

Given the array `answers`, return the minimum number of rabbits that could be in the forest.

## 基礎思路

題目描述有一個森林裡存在未知數量的兔子。我們詢問了其中部分兔子：「森林中還有多少隻兔子和你同樣顏色？」並將兔子的回答記錄在整數陣列 `responses` 中，其中每隻兔子的回答值為 `response`，代表此兔子所屬顏色群體的兔子總數為 `response + 1`。

為求得森林中最少可能的兔子數量，我們有以下觀察：

- 回答值相同的兔子可被視為同一個顏色群組，且群組大小固定為 `response + 1`。
- 每當出現一個新的回答值，若已有同色群組且尚未填滿，便直接加入該群組；若無空位，則必須建立一個新的群組。
- 利用一個 `Map` 資料結構 (`remainingSlots`) 來追蹤每種回答值所剩餘的群組空位數。每當建立新群組時，累加總兔子數量，並在 `Map` 中記錄新群組的剩餘空位；每填入一隻兔子，則對應的空位數減少一。

透過此方法僅需一次遍歷即可得到結果。

## 解題步驟

### Step 1：初始化資料結構與變數

首先建立以下資料結構與變數：

- 一個 `Map` (`remainingSlots`)，用來儲存每個回答值所對應的群組尚餘空位數。
- 一個整數變數 `totalRabbitsCount` 用於統計最終兔子總數。
- 取得回答陣列的長度 `n`。

```typescript
// 用於記錄每種回答值的群組尚有幾個空位
const remainingSlots = new Map<number, number>();
let totalRabbitsCount = 0;

const n = responses.length;
```

### Step 2：遍歷回答陣列，逐一計算

針對回答陣列中每個回答值 `response`，執行以下步驟：

1. **檢查現有空位：**

   從 `remainingSlots` 查詢當前回答值剩餘空位數。若該回答值尚未存在，預設空位數為 0。

2. **依據空位情況進行分類處理：**

   - **情況一：已有空位（`slotsAvailable > 0`）**  
     將此兔子加入現有群組，並將空位數減少 1。

   - **情況二：無空位（需建立新群組）**  
     建立一個新群組，大小為 `response + 1`，並將兔子總數加上新群組大小。同時將新群組的剩餘空位數（即群組大小減一）記錄到 `remainingSlots` 中。


```typescript
const response = responses[i];
const slotsAvailable = remainingSlots.get(response) ?? 0;

if (slotsAvailable > 0) {
  // 加入現有群組，空位減少一
  remainingSlots.set(response, slotsAvailable - 1);
}
else {
  // 建立新群組，大小為 (response + 1)
  const groupSize = response + 1;
  totalRabbitsCount += groupSize;
  // 新群組尚餘空位數為 groupSize - 1
  remainingSlots.set(response, response);
}
```

### Step 3：返回計算結果

完成遍歷後，即可取得最少兔子數量，回傳最終結果：

```typescript
return totalRabbitsCount;
```

## 時間複雜度

- 需要遍歷一次長度為 `n` 的陣列，每次操作皆為常數時間，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個 `Map` 儲存剩餘空位，最差情況下最多存放 `n` 個鍵值對，因此空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
