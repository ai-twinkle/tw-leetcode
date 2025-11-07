# 2528. Maximize the Minimum Powered City

You are given a 0-indexed integer array `stations` of length `n`, where `stations[i]` represents the number of power stations in the $i^{th}$ city.

Each power station can provide power to every city in a fixed range. 
In other words, if the range is denoted by `r`, then a power station at city `i` can provide power to all cities `j` 
such that `|i - j| <= r` and `0 <= i, j <= n - 1`.

- Note that `|x|` denotes absolute value. For example, `|7 - 5| = 2` and `|3 - 10| = 7`.

The power of a city is the total number of power stations it is being provided power from.

The government has sanctioned building `k` more power stations, each of which can be built in any city, 
and have the same range as the pre-existing ones.

Given the two integers `r` and `k`, return the maximum possible minimum power of a city, 
if the additional power stations are built optimally.

Note that you can build the `k` power stations in multiple cities.

**Constraints:**

- `n == stations.length`
- `1 <= n <= 10^5`
- `0 <= stations[i] <= 10^5`
- `0 <= r <= n - 1`
- `0 <= k <= 10^9`

## 基礎思路

本題要在既有電廠分布與固定供電半徑 `r` 下，允許再建置 `k` 座電站（可分散到任意城市），使得**所有城市的「供電量」的最小值盡可能大**。其中，一座城市的「供電量」定義為：其自身以及距離不超過 `r` 的城市內所有電站數量總和。

在思考解法時，我們需要特別注意幾個重點：

* **區間加總模型**：每座電站對距離 `r` 內的一段連續城市都「等量貢獻 1」，因此城市供電量可視為「原陣列在半徑 `r` 的滑動視窗和」。
* **目標是最大化最小值（Maximize the minimum）**：這是典型可用**二分答案**的情境；給定一個門檻 `T`，只要能檢驗「是否可用 ≤ `k` 新電站，讓每城供電量都 ≥ `T`」，即可用二分逼近最大可行 `T`。
* **可行性檢查（Greedy + 差分）**：由左到右掃描，當某城市供電不足 `T`，便在「能最往右、仍能覆蓋當前城市」的位置等效地補上所需數量（不超用 `k`）。用**差分陣列**維護「新增電站的區間效應」，可將一次可行性檢查壓到線性時間。
* **上下界設計**：`T` 的下界可取當前最小供電量的下整；上界可取「用完 `k` 座後的理論均攤上限」，做為二分的起點。

綜合以上，整體策略是： 先以**滑動視窗**預算每城既有供電，再以**二分答案**搭配 **線性可行性檢查（差分貪心）** 求解。

## 解題步驟

### Step 1：預先以滑動視窗求出每座城市的「現有供電量」

先針對每個城市計算「自身 ±`r` 範圍」的電站總數，形成 `currentPower`。這樣後續檢查門檻時就不用重複計算。

```typescript
// 取得城市數量
const cityCount = stations.length;

if (cityCount === 0) {
  return 0;
}

// Step 1: 以滑動視窗預先計算每個城市的現有供電量
const currentPower = new Float64Array(cityCount); // 每個城市的現有供電量

// 視窗初始化：針對城市 0，視窗為 [0, rightLimit]
let rightLimit = r;
if (rightLimit > cityCount - 1) {
  rightLimit = cityCount - 1;
}

let windowSum = 0;
for (let index = 0; index <= rightLimit; index++) {
  windowSum += stations[index];
}
currentPower[0] = windowSum; // 城市 0 的基底視窗總和

// 平移視窗：對城市 i，視窗為 [i - r, i + r]（邊界內收）
for (let city = 1; city < cityCount; city++) {
  const leftOutIndex = city - r - 1;
  if (leftOutIndex >= 0) {
    windowSum -= stations[leftOutIndex];
  }
  const rightInIndex = city + r;
  if (rightInIndex < cityCount) {
    windowSum += stations[rightInIndex];
  }
  currentPower[city] = windowSum;
}
```

### Step 2：估算二分邊界（下界取現況最小，上界取均攤上限）

為二分答案建立保守且緊的上下界：
- 下界 = 目前各城供電量最小值的下整；
- 上界 = 將 `k` 座新電站「理想均攤」後的平均上限。

```typescript
// Step 2: 計算二分的上下界
// 下界：現有各城最小供電量；上界：用完 k 後的理論均攤上限
let minCurrentPower = currentPower[0];
let totalCurrentPower = currentPower[0];
for (let city = 1; city < cityCount; city++) {
  const value = currentPower[city];
  if (value < minCurrentPower) {
    minCurrentPower = value;
  }
  totalCurrentPower += value;
}

const coverageSpan = 2 * r + 1; // 一座新電站最多覆蓋的城市數
let lowBound = Math.floor(minCurrentPower); // 較保守的下界
if (lowBound < 0) {
  lowBound = 0;
}
let highBound = Math.floor((totalCurrentPower + k * coverageSpan) / cityCount); // 均攤上界
```

### Step 3：可行性檢查（差分貪心）——在不超過 `k` 的前提下，是否能讓所有城市都達到目標門檻

核心想法：由左到右，當城市 `i` 供電不足 `target` 時，補上**恰好所需**的電站數，等效地把這些新增電站「放在最右仍能覆蓋 `i` 的位置」，其效應會持續 `coverageSpan` 長度。
用差分陣列排程「何處開始、何處結束」的加成效應，以 O(n) 完成一次檢查。

```typescript
// Step 3: 使用可重用的差分緩衝進行貪心可行性檢查
// extraDiff 長度為 cityCount+1，用來在 endIndex+1 安排「效應結束」標記
const extraDiff = new Float64Array(cityCount + 1);

/**
 * 檢查是否能在最多 k 座新增電站下，使所有城市的供電量皆 ≥ target。
 *
 * 貪心規則：當城市 i 供電不足，就「等效地」在位置 min(cityCount-1, i + r) 放置所需數量，
 * 使其覆蓋到 i，並把剩餘效益往右推。用差分 + 滾動加總維護新增效應。
 *
 * @param target 期望的每城最低供電門檻
 * @returns 若可行回傳 true，否則回傳 false
 */
function canReach(target: number): boolean {
  // 重置差分緩衝（TypedArray 的 fill 速度快）
  extraDiff.fill(0);

  let remainingStations = k;   // 尚可配置的新增電站數
  let rollingExtra = 0;        // 當前索引位置的新增效應累計

  for (let city = 0; city < cityCount; city++) {
    // 套用在此處終止的延遲效應
    rollingExtra += extraDiff[city];

    // 當前城市的可用供電量（現有 + 新增效應）
    const availablePower = currentPower[city] + rollingExtra;

    // 若不足，立刻補到剛好達標
    if (availablePower < target) {
      const requiredAdditions = target - availablePower;

      if (requiredAdditions > remainingStations) {
        return false; // 預算不足，無法達標
      }

      // 立即消耗預算
      remainingStations -= requiredAdditions;

      // 這些新增從此城開始提供效益
      rollingExtra += requiredAdditions;

      // 效益在 coverageSpan 長度後結束（i + 2r），需注意邊界
      let endIndexPlusOne = city + coverageSpan;
      if (endIndexPlusOne > cityCount) {
        endIndexPlusOne = cityCount;
      }
      extraDiff[endIndexPlusOne] -= requiredAdditions; // 安排效益停止
    }
  }

  return true; // 全部城市都達標
}
```

### Step 4：以二分答案找出最大可行的最低供電量

在上述邊界內做二分，每一個候選值僅做一次 `O(n)` 的可行性檢查，最終回傳最大可行值。

```typescript
// Step 4: 二分搜尋，最大化可行的最低供電量
let bestAnswer = lowBound;
while (lowBound <= highBound) {
  const middle = lowBound + ((highBound - lowBound) >> 1); // 無溢位的中點

  // 關鍵：一次 O(n) 的可行性檢查
  if (canReach(middle)) {
    bestAnswer = middle;     // 記錄可行值
    lowBound = middle + 1;   // 嘗試拉高門檻
  } else {
    highBound = middle - 1;  // 降低門檻
  }
}

return bestAnswer;
```

## 時間複雜度

- 預處理滑動視窗：$O(n)$。
- 一次可行性檢查 `canReach`：差分 + 線性掃描為 $O(n)$`。
- 二分答案的次數為 $O(\log U)$，其中 `U` 為答案搜尋空間的上界（不超過理論均攤上限的量級）。
- 總時間複雜度為 $O(n \log U)$。

> $O(n \log U)$

## 空間複雜度

- `currentPower` 與 `extraDiff` 皆為長度 $O(n)$ 的陣列（TypedArray）。
- 其他僅為常數級臨時變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
