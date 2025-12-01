# 2141. Maximum Running Time of N Computers

You have `n` computers. 
You are given the integer `n` and a 0-indexed integer array `batteries` where the $i^{th}$ battery can run a computer for` batteries[i]` minutes. 
You are interested in running all `n` computers simultaneously using the given `batteries`.

Initially, you can insert at most one battery into each computer. 
After that and at any integer time moment, you can remove a battery from a computer and insert another battery any number of times. 
The inserted battery can be a totally new battery or a battery from another computer. 
You may assume that the removing and inserting processes take no time.

Note that the batteries cannot be recharged.

Return the maximum number of minutes you can run all the `n` computers simultaneously.

**Constraints:**

- `1 <= n <= batteries.length <= 10^5`
- `1 <= batteries[i] <= 10^9`

## 基礎思路

本題要求同時運行 `n` 台電腦，並允許在任意整數時間點自由交換電池，但電池不可充電。每個電池的容量固定，因此所有電池的總可用時間是固定資源。我們的目標是找出所有電腦能同時運行的最長分鐘數。

可掌握以下幾項核心觀察：

* **交換電池不耗時，因此可視為所有電池時間可自由分配。**
  每個電池都能將自身的時間拆分成任意段並分配給不同電腦，只要總貢獻不超出其容量。

* **所有電腦需同時運作，代表每台電腦必須得到相同的最終可用時間。**
  若每台需運作 `T` 分鐘，總需求必須至少為 `n × T`。

* **每顆電池能貢獻的時間上限為 `min(battery[i], T)`。**
  因為電池不可超時使用，因此電池對目標時間 `T` 的最大貢獻是其容量或 T 中的較小者。

* **可行性判斷可透過檢查所有電池的總貢獻是否 ≥ `n × T`。**
  若總貢獻足夠，代表可以讓所有電腦同時運行 T 分鐘。

* **答案具有單調性，因此可使用二分搜尋。**
  若某個時間 `T` 可以達成，則所有比 T 更小的時間也一定可以達成；反之亦然。

基於上述特性，可採用：

* 先計算所有電池總時數的上限作為右界。
* 使用二分搜尋找出最大可行運作時間。
* 用可行性檢查函式來判定某個分鐘數是否可讓所有電腦同時持續運行。

此策略能在大規模輸入下依然維持高效運算。

## 解題步驟

### Step 1：初始化電腦數量、電池數量並建立 typed array

先計算電腦與電池數量，並建立 typed array 以取得更緊密的記憶體佈局與更快的隨機存取效率。

```typescript
const computerCount = n;
const batteryCount = batteries.length;

// 將電池內容放入 typed array 以獲得更佳記憶體配置
const batteryTimes = new Float64Array(batteryCount);
```

### Step 2：複製電池資料並累加全部電池總時數

在複製過程中順便計算所有電池容量之總和，以便後續推算二分搜尋的右界。

```typescript
// 複製電池內容同時計算總電池時數
let totalBatteryTime = 0;
for (let index = 0; index < batteryCount; index++) {
  const batteryTime = batteries[index];
  batteryTimes[index] = batteryTime;
  totalBatteryTime += batteryTime;
}
```

### Step 3：處理僅有一台電腦的特例

若只有一台電腦，因為交換無成本，可直接將所有電池時間全部使用，因此答案即為總電池時間。

```typescript
// 特例：若只有一台電腦，可直接使用全部電池時數
if (computerCount === 1) {
  return totalBatteryTime;
}
```

### Step 4：設定二分搜尋的左右界

左界代表最低可行時間（0），右界為所有電池總時間平均分給每台電腦的最大可能值。

```typescript
// 在最理想分配情況下的最大可能時間
let leftTime = 0;
let rightTime = Math.floor(totalBatteryTime / computerCount);
```

### Step 5：定義可行性檢查函式

此函式用於判定是否能讓所有電腦同時運行指定分鐘數：
每顆電池貢獻 `min(batteryTime, targetMinutes)`，總貢獻需至少達到 `n × targetMinutes`。

```typescript
/**
 * 檢查是否能讓所有電腦同時運行 targetMinutes 分鐘
 *
 * @param {number} targetMinutes - 目標運行時間
 * @return {boolean} - 是否可行
 */
function canPowerAllComputers(targetMinutes: number): boolean {
  const requiredTotalTime = targetMinutes * computerCount;
  let accumulatedTime = 0;

  // 若目標為 0 則永遠可行
  if (targetMinutes === 0) {
    return true;
  }

  // 累計所有電池可貢獻的時間，並在足夠時提前返回
  for (let index = 0; index < batteryCount; index++) {
    const batteryTime = batteryTimes[index];

    // 單顆電池最多貢獻 targetMinutes
    if (batteryTime >= targetMinutes) {
      accumulatedTime += targetMinutes;
    } else {
      accumulatedTime += batteryTime;
    }

    // 若已累積足夠時間則可行
    if (accumulatedTime >= requiredTotalTime) {
      return true;
    }
  }

  return false;
}
```

### Step 6：使用二分搜尋找出最大可行運行時間

透過二分搜尋逐步縮小可行時間的範圍，使用上中位數避免死循環，並按可行性結果調整左右界。

```typescript
// 二分搜尋最大可行運行時間
while (leftTime < rightTime) {
  // 使用上中位數以避免陷入無窮迴圈
  const middleTime = Math.floor((leftTime + rightTime + 1) / 2);

  if (canPowerAllComputers(middleTime)) {
    // 若可行，嘗試更長的時間
    leftTime = middleTime;
  } else {
    // 若不可行，壓低右界
    rightTime = middleTime - 1;
  }
}
```

### Step 7：回傳最大同時運行時間

當二分搜尋結束後，左界即為最大可行時間。

```typescript
return leftTime;
```

## 時間複雜度

- 建立 typed array 與複製電池資料需要處理 `batteries.length` 次。
- 可行性檢查每次需遍歷全部電池，共會在二分搜尋中執行 `O(log(totalBatteryTime))` 次。
- 總時間複雜度為 $O(m \log M)$，其中
  `m = batteries.length`，
  `M = totalBatteryTime / n`。

> $O(m \log M)$

## 空間複雜度

- 使用一個長度為 `m` 的 typed array 存放電池資料。
- 其餘僅使用固定數量變數。
- 總空間複雜度為 $O(m)$。

> $O(m)$
