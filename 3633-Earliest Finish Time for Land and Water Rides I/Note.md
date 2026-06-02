# 3633. Earliest Finish Time for Land and Water Rides I

You are given two categories of theme park attractions: 
land rides and water .

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

- `1 <= n, m <= 100`
- `landStartTime.length == landDuration.length == n`
- `waterStartTime.length == waterDuration.length == m`
- `1 <= landStartTime[i], landDuration[i], waterStartTime[j], waterDuration[j] <= 1000`

## 基礎思路

本題要求遊客在陸上與水上兩個類別中各體驗恰好一項設施，並可自由選擇兩者的先後順序，目標為求得最早能完成兩項設施的時間點。由於兩項設施分屬不同類別，故只存在兩種可能的執行順序：先陸後水、或先水後陸。

在思考解法時，可掌握以下核心觀察：

- **第二項設施的實際搭乘時刻為兩個因素的最大值**：
  完成第一項設施後才能前往第二項，但仍需等待第二項開放，因此搭乘第二項的時刻為「第一項結束時刻」與「第二項開放時刻」中較晚者。

- **第一項設施應採貪心策略，選擇「最早結束」者**：
  由於第二項設施的搭乘時刻為 max(第一項結束時刻, 第二項開放時刻)，且 max 對其兩個參數皆單調遞增；故第一項結束越早，第二項的搭乘時刻必然不會更晚。也就是說，當執行順序固定後，第一項設施可直接挑選結束時刻最小者，無需枚舉。

- **第二項設施必須逐一枚舉**：
  不同的第二項設施擁有不同的開放時刻與持續時間，難以套用單一貪心策略，需窮舉所有可能組合以找出最早完成時刻。

依據以上特性，可以採用以下策略：

- **預先計算兩個類別各自的最早結束時刻**，作為兩種順序下的第一項候選。
- **對兩種順序各掃描一輪第二項候選**，計算對應的完成時刻並紀錄最小值。
- **最終回傳兩種順序中較佳者**，即為全域最佳解。

此策略以線性時間完成所有計算，無需任何額外資料結構。

## 解題步驟

### Step 1：取得陸上與水上設施的數量

先讀取兩個類別各自的設施總數，作為後續迴圈邊界。

```typescript
const landCount = landStartTime.length;
const waterCount = waterStartTime.length;
```

### Step 2：找出所有陸上設施中最早的結束時刻

依照貪心觀察，「先陸後水」順序下第一項應挑選結束時刻最早者。
從首項初始化後，逐一比較剩餘設施，記錄最小結束時刻。

```typescript
// 所有陸上設施中最早能結束的時刻——當採用「先陸後水」順序時即為最佳第一項，
// 因為較晚結束的第一項只會延後（絕不會提前）第二項的搭乘時刻。
let earliestLandFinish = landStartTime[0] + landDuration[0];
for (let i = 1; i < landCount; i++) {
  const finish = landStartTime[i] + landDuration[i];
  if (finish < earliestLandFinish) {
    earliestLandFinish = finish;
  }
}
```

### Step 3：找出所有水上設施中最早的結束時刻

對稱地處理水上類別，作為「先水後陸」順序下第一項的最佳候選。

```typescript
// 所有水上設施中最早能結束的時刻——對稱推理。
let earliestWaterFinish = waterStartTime[0] + waterDuration[0];
for (let j = 1; j < waterCount; j++) {
  const finish = waterStartTime[j] + waterDuration[j];
  if (finish < earliestWaterFinish) {
    earliestWaterFinish = finish;
  }
}
```

### Step 4：評估「先陸後水」順序下的最佳完成時刻

固定第一項為最早結束的陸上設施後，枚舉所有水上設施作為第二項。
搭乘水上設施的時刻為「陸上最早結束」與「水上開放時刻」中較晚者，再加上水上設施持續時間即為完成時刻；持續更新最小值。

```typescript
// 選項 A：先陸後水——掃描所有水上設施，尋找最佳銜接組合。
let bestLandThenWater = Infinity;
for (let j = 0; j < waterCount; j++) {
  const waterOpen = waterStartTime[j];
  // 內聯 max——避免在熱迴圈中呼叫 Math.max 的額外開銷。
  const board = earliestLandFinish > waterOpen ? earliestLandFinish : waterOpen;
  const finish = board + waterDuration[j];
  if (finish < bestLandThenWater) {
    bestLandThenWater = finish;
  }
}
```

### Step 5：評估「先水後陸」順序下的最佳完成時刻

採用對稱邏輯：固定第一項為最早結束的水上設施，枚舉所有陸上設施作為第二項，逐一計算完成時刻並記錄最小值。

```typescript
// 選項 B：先水後陸——掃描所有陸上設施，尋找最佳銜接組合。
let bestWaterThenLand = Infinity;
for (let i = 0; i < landCount; i++) {
  const landOpen = landStartTime[i];
  const board = earliestWaterFinish > landOpen ? earliestWaterFinish : landOpen;
  const finish = board + landDuration[i];
  if (finish < bestWaterThenLand) {
    bestWaterThenLand = finish;
  }
}
```

### Step 6：回傳兩種順序中較佳者

全域最佳解即為兩種順序所得結果中的較小值。

```typescript
// 全域最佳解為兩種順序中較佳者。
return bestLandThenWater < bestWaterThenLand ? bestLandThenWater : bestWaterThenLand;
```

## 時間複雜度

- 計算陸上最早結束時刻需掃描所有陸上設施一次，耗時 $O(n)$；
- 計算水上最早結束時刻需掃描所有水上設施一次，耗時 $O(m)$；
- 「先陸後水」順序的評估需再掃描所有水上設施一次，耗時 $O(m)$；
- 「先水後陸」順序的評估需再掃描所有陸上設施一次，耗時 $O(n)$；
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 僅使用固定數量的純量變數儲存最早結束時刻與最佳完成時刻；
- 無任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
