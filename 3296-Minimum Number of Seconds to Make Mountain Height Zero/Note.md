# 3296. Minimum Number of Seconds to Make Mountain Height Zero

You are given an integer `mountainHeight` denoting the height of a mountain.

You are also given an integer array `workerTimes` representing the work time of workers in seconds.

The workers work simultaneously to reduce the height of the mountain. For worker `i`:

- To decrease the mountain's height by `x`, it takes `workerTimes[i] + workerTimes[i] * 2 + ... + workerTimes[i] * x` seconds. 
  For example:
  - To reduce the height of the mountain by 1, it takes `workerTimes[i]` seconds.
  - To reduce the height of the mountain by 2, it takes `workerTimes[i] + workerTimes[i] * 2` seconds, and so on.

Return an integer representing the minimum number of seconds required for the workers to make the height of the mountain 0.

**Constraints:**

- `1 <= mountainHeight <= 10^5`
- `1 <= workerTimes.length <= 10^4`
- `1 <= workerTimes[i] <= 10^6`

## 基礎思路

本題要求求出讓山高度降為 0 所需的最短時間。每位工人降低高度所需的時間，並不是固定的線性成本，而是隨著其處理的層數形成等差累加，因此若直接模擬每位工人每一層的挖掘過程，效率會過低，無法滿足題目限制。

在思考解法時，可掌握以下核心觀察：

* **單一工人的耗時具有等差級數結構**：
  若某位工人要削減若干高度，其總耗時可視為首項固定、公差固定的累加，因此可以將「在給定時間內最多能完成多少高度」轉換成數學不等式來處理。

* **總可削減高度對時間具有單調性**：
  若在某個時間內所有工人合計可以完成目標高度，則在更長的時間內也一定可以完成；反之，若某個時間不足，則更短的時間也不可能完成。

* **題目本質是尋找最小可行值**：
  當可行性隨著答案單調變化時，適合改用二分搜尋來找最小滿足條件的時間，而不是逐一枚舉所有可能秒數。

* **可行性檢查只需統計總貢獻量**：
  對於某個候選時間，只要能快速算出每位工人在這段時間內最多可削減多少高度，將其加總後判斷是否達到目標高度即可。

依據以上特性，可以採用以下策略：

* **先將工人的工作時間排序**，讓較快的工人優先參與計算，並在後續工人不可能有貢獻時提早停止。
* **設計一個檢查函式**，判斷在某個給定時間內，所有工人合計是否能削減至少目標高度。
* **利用數學公式直接反推單一工人的最大可完成高度**，避免逐層模擬。
* **在時間範圍上做二分搜尋**，逐步縮小答案區間，直到找到最小可行時間。

此策略同時結合了單調性判斷、數學推導與二分搜尋，能在題目限制下高效求解。

## 解題步驟

### Step 1：建立工人數量與可排序的工作時間陣列

先取得工人總數，並建立固定長度的整數陣列，作為後續排序與查詢使用。

```typescript
const workerCount = workerTimes.length;
const sortedWorkerTimes = new Uint32Array(workerCount);
```

### Step 2：將輸入資料逐一複製到排序陣列中

由於後續需要對工人的工作時間進行排序，因此先把原始陣列內容逐一搬移到新的陣列中。

```typescript
for (let index = 0; index < workerCount; index++) {
  sortedWorkerTimes[index] = workerTimes[index];
}
```

### Step 3：將工人的工作時間由小到大排序

排序完成後，較快的工人會排在前面，之後在可行性檢查時可以更早判斷哪些工人能產生貢獻。

```typescript
sortedWorkerTimes.sort();
```

### Step 4：宣告可行性檢查函式並初始化累計削減高度

接著定義內部函式，用來判斷在某個候選時間內，所有工人合計是否能削減至少目標高度。
函式一開始先準備累計值，用來記錄目前總共削減了多少高度。

```typescript
/**
 * 檢查所有工人合計是否能在 `timeLimit`
 * 秒內至少削減 `mountainHeight` 的高度。
 *
 * @param timeLimit - 候選總時間。
 * @returns 山是否能在此時間限制內被完全削平。
 */
function canFinishWithin(timeLimit: number): boolean {
  let reducedHeight = 0;

  // ...
}
```

### Step 5：逐一檢查每位工人在目前時間限制下是否能開始工作

在可行性檢查中，依序處理排序後的每位工人。
若某位工人的最基本單位工作時間都已超過目前候選時間，代表他連一層都無法完成；又因為後面的工人只會更慢，因此可以直接停止。

```typescript
/**
 * 檢查所有工人合計是否能在 `timeLimit`
 * 秒內至少削減 `mountainHeight` 的高度。
 *
 * @param timeLimit - 候選總時間。
 * @returns 山是否能在此時間限制內被完全削平。
 */
function canFinishWithin(timeLimit: number): boolean {
  // Step 4：初始化累計削減高度

  for (let index = 0; index < workerCount; index++) {
    const currentWorkerTime = sortedWorkerTimes[index];

    // 這位工人在目前時間限制內連一個單位都無法完成。
    if (currentWorkerTime > timeLimit) {
      break;
    }

    // ...
  }

  // ...
}
```

### Step 6：用公式計算每位工人在時間限制內最多可完成的高度

對於能開始工作的工人，不必逐層累加模擬，而是直接根據等差級數總和不等式，反推出他在目前時間限制內最多能削減多少高度，並把這個貢獻加入總累計值中。

```typescript
/**
 * 檢查所有工人合計是否能在 `timeLimit`
 * 秒內至少削減 `mountainHeight` 的高度。
 *
 * @param timeLimit - 候選總時間。
 * @returns 山是否能在此時間限制內被完全削平。
 */
function canFinishWithin(timeLimit: number): boolean {
  // Step 4：初始化累計削減高度

  for (let index = 0; index < workerCount; index++) {
    // Step 5：逐一檢查每位工人在目前時間限制下是否能開始工作

    // 解 currentWorkerTime * x * (x + 1) / 2 <= timeLimit。
    const completedHeight = Math.floor(
      (Math.sqrt(1 + (8 * timeLimit) / currentWorkerTime) - 1) * 0.5
    );

    reducedHeight += completedHeight;

    // ...
  }

  // ...
}
```

### Step 7：若累計削減高度已足夠，便提早回傳可行結果

當總削減高度已達到或超過目標高度時，就不需要再檢查剩餘工人，可以立即回傳可行。
若整輪檢查結束仍不足，則代表此時間上限不可行。

```typescript
/**
 * 檢查所有工人合計是否能在 `timeLimit`
 * 秒內至少削減 `mountainHeight` 的高度。
 *
 * @param timeLimit - 候選總時間。
 * @returns 山是否能在此時間限制內被完全削平。
 */
function canFinishWithin(timeLimit: number): boolean {
  // Step 4：初始化累計削減高度

  for (let index = 0; index < workerCount; index++) {
    // Step 5：逐一檢查每位工人在目前時間限制下是否能開始工作

    // Step 6：用公式計算每位工人在時間限制內最多可完成的高度

    // 一旦已經削減足夠高度，就提早停止。
    if (reducedHeight >= mountainHeight) {
      return true;
    }
  }

  return false;
}
```

### Step 8：初始化二分搜尋的左右邊界

可行性檢查函式準備完成後，接著設定答案搜尋範圍。
左邊界從 0 開始；右邊界則取為「最快工人獨自完成全部高度」所需的總時間，這樣一定能保證答案落在區間內。

```typescript
let leftTime = 0;
let rightTime =
  sortedWorkerTimes[0] * mountainHeight * (mountainHeight + 1) * 0.5;
```

### Step 9：透過二分搜尋縮小最短可行時間範圍

接著在答案區間上進行二分搜尋。
每次取中間時間作為候選值，若可行，代表答案可能更小，便收縮右邊界；否則表示時間不足，需把左邊界移到更大的範圍。

```typescript
while (leftTime < rightTime) {
  const middleTime = leftTime + Math.floor((rightTime - leftTime) * 0.5);

  if (canFinishWithin(middleTime)) {
    rightTime = middleTime;
  } else {
    leftTime = middleTime + 1;
  }
}
```

### Step 10：回傳二分搜尋收斂後的最小可行時間

當左右邊界收斂時，該值就是讓所有工人剛好能完成目標的最短時間。

```typescript
return leftTime;
```

## 時間複雜度

- 排序工人工作時間需要 $O(m \log m)$，其中 $m$ 為工人數量。
- 每次可行性檢查最多掃描全部工人一次，成本為 $O(m)$。
- 二分搜尋的範圍上界為最快工人單獨完成所有高度所需時間，因此共進行 $O(\log U)$ 次檢查，其中 $U$ 為答案的搜尋上界。
- 總時間複雜度為 $O(m \log m + m \log U)$。

> $O(m \log m + m \log U)$

## 空間複雜度

- 額外建立了一個長度為工人數量的排序陣列。
- 其餘僅使用常數數量的輔助變數。
- 總空間複雜度為 $O(m)$。

> $O(m)$
