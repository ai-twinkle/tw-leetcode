# 3635. Earliest Finish Time for Land and Water Rides II

You are given two categories of theme park attractions: land rides and water rides.

- Land rides
  - `landStartTime[i]` – the earliest time the $i^{th}$ land ride can be boarded.
  - `landDuration[i]` – how long the $i^{th}$ land ride lasts.
- Water rides
  - `waterStartTime[j]` – the earliest time the $j^{th}$ water ride can be boarded.
  - `waterDuration[j]` – how long the $j^{th}$ water ride lasts.

A tourist must experience exactly one ride from each category, in either order.

- A ride may be started at its opening time or any later moment.
- If a ride is started at time `t`, it finishes at time `t + duration`.
- Immediately after finishing one ride the tourist may board the other (if it is already open) or wait until it opens.

Return the earliest possible time at which the tourist can finish both rides.

**Constraints:**

- `1 <= n, m <= 5 * 10^4`
- `landStartTime.length == landDuration.length == n`
- `waterStartTime.length == waterDuration.length == m`
- `1 <= landStartTime[i], landDuration[i], waterStartTime[j], waterDuration[j] <= 10^5`

## 基礎思路

本題要求從陸地與水上兩類設施中各選擇一項依任意順序體驗，並回傳兩者皆完成的最早時刻。若以暴力方式列舉所有 `n × m` 組合，會帶來過大的時間開銷；因此必須找出可在線性時間內處理的觀察點。

在思考解法時，可掌握以下核心觀察：

- **體驗順序僅有兩種**：
  「先陸後水」或「先水後陸」，最終答案必為兩種順序最佳解中的較小者。

- **「先陸後水」順序的最佳前置唯一**：
  若選定某個水上設施，要使整體完成時間最小化，等同於希望「陸地結束時刻」盡量早。
  因此無論搭哪個水上設施，最佳的陸地選擇皆為「最小陸地結束時間」者，只需預先掃描一次即可取得。

- **「先水後陸」順序具對稱性**：
  以相同方式可知，無論搭哪個陸地設施，最佳的水上選擇皆為「最小水上結束時間」者。

- **完成時刻由較晚事件決定**：
  在某一順序下實際上船時刻為「前一設施結束時間」與「此設施開放時刻」的較大者，再加上該設施所需時間即為完成時刻。

依據以上特性，可以採用以下策略：

- **第一遍掃描陸地設施**：求出最小陸地結束時間，作為「先陸後水」順序的最佳前置時刻。
- **單次掃描水上設施**：同時維護最小水上結束時間（供「先水後陸」使用），並計算「先陸後水」的候選完成時間。
- **第二遍掃描陸地設施**：以快取下來的最小水上結束時間評估「先水後陸」的候選完成時間。
- **取所有候選中的最小值作為答案**。

此策略只需三次線性掃描，過程中皆為常數時間運算，整體效率極佳。

## 解題步驟

### Step 1：第一遍掃描陸地設施以求出最小陸地結束時間

依照「先陸後水」順序的觀察，必先取得所有陸地設施中最早能完成的結束時刻，作為後續搭乘水上設施前的最佳前置時刻。此處以第一個陸地設施作為初始值，後續迴圈從索引 1 開始比對更新。

```typescript
const landCount = landStartTime.length;
const waterCount = waterStartTime.length;

// 掃描陸地設施：最小陸地結束時間是「先陸後水」順序中唯一相關的值
let minimumLandFinish = landStartTime[0] + landDuration[0];
for (let landIndex = 1; landIndex < landCount; landIndex++) {
  const finishMoment = landStartTime[landIndex] + landDuration[landIndex];
  if (finishMoment < minimumLandFinish) {
    minimumLandFinish = finishMoment;
  }
}
```

### Step 2：以第一個水上設施手動初始化最小水上結束時間與最佳答案

為了讓後續水上掃描迴圈可直接從索引 1 開始而省去額外的初始化判斷，先以第一個水上設施作為基準解：同時設定其結束時刻為最小水上結束時間，並依照「先陸後水」順序計算最初的候選完成時間。

```typescript
// 單次掃描水上設施：結合「最小水上結束時間」與「最佳先陸後水候選」
const firstWaterOpen = waterStartTime[0];
let minimumWaterFinish = firstWaterOpen + waterDuration[0];
const firstBoardWater = minimumLandFinish > firstWaterOpen ? minimumLandFinish : firstWaterOpen;
let bestFinish = firstBoardWater + waterDuration[0];
```

### Step 3：掃描其餘水上設施並持續更新最小水上結束時間

從索引 1 起逐一檢視水上設施，先計算其開放時刻與結束時刻；若此設施能更早完成，則更新 `minimumWaterFinish`，供後續「先水後陸」順序的陸地掃描使用。

```typescript
for (let waterIndex = 1; waterIndex < waterCount; waterIndex++) {
  const waterOpen = waterStartTime[waterIndex];
  const waterFinish = waterOpen + waterDuration[waterIndex];
  // 緩存最小水上結束時間，供第二遍陸地掃描使用
  if (waterFinish < minimumWaterFinish) {
    minimumWaterFinish = waterFinish;
  }

  // ...
}
```

### Step 4：於同一迴圈中評估「先陸後水」的候選完成時間

仍在同一輪水上設施迴圈中，使用 Step 1 求得的 `minimumLandFinish` 與當前水上設施開放時刻取較大者作為實際上船時刻，再加上該水上設施所需時間即得候選完成時刻；若優於目前最佳解，則更新 `bestFinish`。

```typescript
for (let waterIndex = 1; waterIndex < waterCount; waterIndex++) {
  // Step 3：更新最小水上結束時間

  // 在較晚發生者之後上船：取最小陸地結束時間與此設施開放時間的較大者
  const boardMoment = minimumLandFinish > waterOpen ? minimumLandFinish : waterOpen;
  const candidate = boardMoment + waterDuration[waterIndex];
  if (candidate < bestFinish) {
    bestFinish = candidate;
  }
}
```

### Step 5：第二遍掃描陸地設施以評估「先水後陸」的候選完成時間

對稱地以 Step 3 中快取下來的 `minimumWaterFinish` 與每個陸地設施的開放時刻取較大者作為實際上船時刻，再加上該陸地設施所需時間即得候選完成時刻；若優於目前最佳解，則更新 `bestFinish`。

```typescript
// 第二遍掃描陸地設施：以快取的最小水上結束時間評估「先水後陸」候選
for (let landIndex = 0; landIndex < landCount; landIndex++) {
  const landOpen = landStartTime[landIndex];
  const boardMoment = minimumWaterFinish > landOpen ? minimumWaterFinish : landOpen;
  const candidate = boardMoment + landDuration[landIndex];
  if (candidate < bestFinish) {
    bestFinish = candidate;
  }
}
```

### Step 6：回傳兩種順序中的最早完成時間

歷經兩種順序所有候選的比較後，`bestFinish` 即為最終答案。

```typescript
return bestFinish;
```

## 時間複雜度

- 第一遍掃描陸地設施需 $O(n)$；
- 單次掃描水上設施需 $O(m)$；
- 第二遍掃描陸地設施再需 $O(n)$；
- 所有運算皆為常數時間。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 僅使用固定數量的純量變數來追蹤最小結束時間與最佳答案；
- 未配置任何額外的陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
