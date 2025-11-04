# 1578. Minimum Time to Make Rope Colorful

Alice has `n` balloons arranged on a rope. 
You are given a 0-indexed string `colors` where `colors[i]` is the color of the $i^{th}$ balloon.

Alice wants the rope to be colorful. 
She does not want two consecutive balloons to be of the same color, so she asks Bob for help. 
Bob can remove some balloons from the rope to make it colorful. 
You are given a 0-indexed integer array `neededTime` where `neededTime[i]` is the time (in seconds) that Bob needs to remove the $i^{th}$ balloon from the rope.

Return the minimum time Bob needs to make the rope colorful.

**Constraints:**

- `n == colors.length == neededTime.length`
- `1 <= n <= 10^5`
- `1 <= neededTime[i] <= 10^4`
- `colors` contains only lowercase English letters.

## 基礎思路

本題要求使繩子上的氣球顏色「相鄰不重複」，也就是要移除最少時間成本的氣球，使最終沒有兩顆相鄰氣球顏色相同。給定：

- 字串 `colors` 表示氣球顏色；
- 陣列 `neededTime[i]` 表示移除第 `i` 顆氣球所需的時間。

若出現連續相同顏色的氣球，至少要移除其中的幾顆，使該段區間僅留下**一顆顏色相同的氣球**。目標是最小化所有移除的時間總和。

在思考解法時，我們需注意：

- **相同顏色連續群組的處理**：對每一段相同顏色的連續區間，必須移除除最大時間氣球外的其餘氣球；
- **單次遍歷**：每個氣球僅需一次掃描，累積當前連續區間資訊即可；
- **最佳性原則**：在每段連續相同顏色中，保留「移除時間最大的氣球」，刪除其他者。

因此整體策略為：

- **逐一遍歷氣球**，將連續相同顏色視為一個「群組」；
- 對每個群組計算：

    - 群組內所有氣球移除時間總和；
    - 群組內最大移除時間；
    - 該群組最小移除成本為 `(sum - max)`；
- 將所有群組的最小移除成本加總，即為答案。

此方法僅需一次遍歷，時間與空間皆為線性。

## 解題步驟

### Step 1：處理小規模輸入

若只有一顆氣球或更少，無需移除，直接回傳 `0`。

```typescript
// 若只有一顆氣球，無需移除
if (colors.length <= 1) {
  return 0;
}
```

### Step 2：初始化狀態變數

紀錄當前顏色群組的顏色代碼、累積時間總和、群組內最大時間，並初始化總移除時間。

```typescript
// 以首顆氣球為初始群組狀態
let previousColorCode = colors.charCodeAt(0);
let currentGroupSum = neededTime[0];
let currentGroupMax = neededTime[0];

// 總移除時間累加器
let totalRemovalTime = 0;
```

### Step 3：遍歷氣球，檢查是否連續相同顏色

對每顆氣球進行一次迴圈：

- 若顏色相同，累加群組總時間並更新最大值；
- 若顏色不同，代表前一群組結束，計算群組貢獻並重設群組狀態。

```typescript
// 逐一遍歷每顆氣球，處理相同顏色群組
for (let index = 1; index < colors.length; index++) {
  const currentColorCode = colors.charCodeAt(index);
  const currentTime = neededTime[index];

  if (currentColorCode === previousColorCode) {
    // 同顏色群組：累加時間並更新最大值
    currentGroupSum += currentTime;
    if (currentTime > currentGroupMax) {
      currentGroupMax = currentTime;
    }
  } else {
    // 顏色改變：群組結束，加入最小移除成本 (sum - max)
    totalRemovalTime += (currentGroupSum - currentGroupMax);

    // 開始新群組
    previousColorCode = currentColorCode;
    currentGroupSum = currentTime;
    currentGroupMax = currentTime;
  }
}
```

### Step 4：處理最後一個群組

由於最後一段不會在迴圈中自動結算，需在結尾手動加上。

```typescript
// 處理最後一段相同顏色群組
totalRemovalTime += (currentGroupSum - currentGroupMax);
```

### Step 5：回傳最小總移除時間

```typescript
// 回傳最終總移除時間
return totalRemovalTime;
```

## 時間複雜度

- 單次遍歷整個字串長度 `n`；
- 每次操作僅為常數時間更新（加總、比較、重設群組）。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定變數追蹤狀態（顏色、加總、最大值）；
- 不需額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
