# 1488. Avoid Flood in The City

Your country has an infinite number of lakes. 
Initially, all the lakes are empty, but when it rains over the $n^{th}$ lake, the $n^{th}$ lake becomes full of water. 
If it rains over a lake that is full of water, there will be a flood. 
Your goal is to avoid floods in any lake.

Given an integer array rains where:

- `rains[i] > 0` means there will be rains over the `rains[i]` lake.
- `rains[i] == 0` means there are no rains this day and you can choose one lake this day and dry it.

Return an array `ans` where:

- `ans.length == rains.length`
- `ans[i] == -1` if `rains[i] > 0`.
- `ans[i]` is the lake you choose to dry in the ith day if `rains[i] == 0`. 

If there are multiple valid answers return any of them. 
If it is impossible to avoid flood return an empty array.

Notice that if you chose to dry a full lake, it becomes empty, but if you chose to dry an empty lake, nothing changes.

**Constraints:**

- `1 <= rains.length <= 10^5`
- `0 <= rains[i] <= 10^9`

## 基礎思路

本題要求我們安排每日「乾燥操作」，以避免湖泊淹水。
每個湖泊初始為空，一旦下雨就會注滿水，若再次下雨但未乾燥，便會造成洪水。

題目提供一個整數陣列 `rains`，每個元素代表：

- `rains[i] > 0`：表示當天對第 `rains[i]` 個湖泊下雨，會使該湖泊變滿；
- `rains[i] == 0`：表示該天可以選擇乾燥任一湖泊（甚至乾燥空湖也合法但無效）。

我們需回傳一個同長度的陣列 `ans`，其中：

- 若 `rains[i] > 0`，則 `ans[i] = -1`；
- 若 `rains[i] == 0`，則 `ans[i]` 是當天選擇乾燥的湖泊編號。

在思考解法時，我們需要注意以下幾點：

- **湖泊滿水追蹤**：若某湖已滿且又再次下雨，除非中間有選擇乾燥，否則一定會洪水；
- **乾燥天的使用時機**：乾燥時必須選在下雨前，並且必須乾燥「即將再次下雨」的湖泊；
- **乾燥天選擇限制**：每個乾燥天只能用一次，且應儘量保留給需要用的湖；
- **若無法避免洪水**：直接回傳空陣列。

為了解決這個問題，我們可以採取以下策略：

- **記錄最近一次下雨的湖泊對應天數**：以快速判斷湖是否已滿；
- **維護一個乾燥日列表**：儲存所有可乾燥的天數，並在需要時分配給指定湖泊；
- **使用指標窗口控制乾燥日使用順序**：避免重複使用已分配的乾燥日，並確保分配順序合法；
- **搜尋最早可用乾燥日**：對每個再次下雨的湖泊，尋找之前分配的乾燥日是否能在今日之前使用。

## 解題步驟

### Step 1：初始化狀態追蹤與結果結構

建立輸出陣列，並初始化乾燥日清單、湖泊最後下雨日對應表，以及控制乾燥日使用進度的指標。

```typescript
// 建立結果陣列，預填為 1（代表乾燥任意湖泊）
const result: number[] = new Array(rains.length).fill(1);

// 儲存所有可以乾燥的日子（rains[i] == 0）
const availableZeroDayIndices: number[] = [];

// 紀錄每個湖最後一次下雨的位置，用於判斷是否需要乾燥
const lastRainDayByLake = new Map<number, number>();

// 控制哪些乾燥日已經被使用，避免重複使用
let usedZeroDayPrefixLength = 0;
```

### Step 2：遍歷每一天，處理下雨與乾燥邏輯

針對每一天依照 `rains[i]` 的狀態進行分支：

- 若當天是乾燥日，加入可用清單；
- 若是下雨日，標記為 `-1`，並依據該湖是否已滿判斷是否需要搜尋乾燥日；
- 若該湖已滿，需從可用乾燥日中找到一個落在上次下雨與今天之間的乾燥日，若找不到則代表洪水無法避免。

```typescript
for (let currentDay = 0; currentDay < rains.length; currentDay++) {
  const lakeId = rains[currentDay];

  // 若為乾燥日，紀錄起來供未來下雨日選擇使用
  if (lakeId === 0) {
    availableZeroDayIndices.push(currentDay);
    continue;
  }

  // 標記下雨日為 -1
  result[currentDay] = -1;

  // 檢查此湖是否曾下過雨（若是，表示目前已滿）
  const previousRainDay = lastRainDayByLake.get(lakeId);
  if (previousRainDay !== undefined) {
    // 嘗試從 availableZeroDayIndices 中找出一個尚未使用，且發生在 currentDay 之前的乾燥日
    let searchIndex = usedZeroDayPrefixLength;
    const totalZeroDays = availableZeroDayIndices.length;

    // 略過早於或等於上次下雨的乾燥日（無效）
    while (
      searchIndex < totalZeroDays &&
      availableZeroDayIndices[searchIndex] <= previousRainDay
    ) {
      searchIndex++;
    }

    // 若找不到可用乾燥日，表示無法避免洪水，直接返回空陣列
    if (
      searchIndex === totalZeroDays ||
      availableZeroDayIndices[searchIndex] >= currentDay
    ) {
      return [];
    }

    // 將這一天分配為乾燥 lakeId，避免洪水
    const chosenZeroDayIndex = availableZeroDayIndices[searchIndex];
    result[chosenZeroDayIndex] = lakeId;

    // 為保持效率，將已使用的乾燥日移到使用視窗最前方，並推進視窗邊界
    if (searchIndex !== usedZeroDayPrefixLength) {
      const temp = availableZeroDayIndices[usedZeroDayPrefixLength];
      availableZeroDayIndices[usedZeroDayPrefixLength] = chosenZeroDayIndex;
      availableZeroDayIndices[searchIndex] = temp;
    }
    usedZeroDayPrefixLength++;
  }

  // 更新該湖最後下雨的日期
  lastRainDayByLake.set(lakeId, currentDay);
}
```

### Step 3：回傳最終排程結果

若成功避免所有洪水，回傳填好內容的 `result` 陣列。

```typescript
// 若整個流程未發生洪水，返回結果陣列
return result;
```

## 時間複雜度

- 遍歷所有天數為 $O(n)$；
- 每次搜尋乾燥日最多掃過所有乾燥日，最壞為 $O(n)$；
- 實務上乾燥日數量遠小於總天數，且每次只用一次，因此總體為線性時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用 `Map` 儲存湖泊最後一次下雨日，最多 $O(n)$；
- 使用陣列儲存乾燥日與結果，最多 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
