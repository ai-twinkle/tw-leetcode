# 1840. Maximum Building Height

You want to build `n` new buildings in a city. 
The new buildings will be built in a line and are labeled from `1` to `n`.

However, there are city restrictions on the heights of the new buildings:

- The height of each building must be a non-negative integer.
- The height of the first building must be `0`.
- The height difference between any two adjacent buildings cannot exceed `1`.

Additionally, there are city restrictions on the maximum height of specific buildings. 
These restrictions are given as a 2D integer array `restrictions` where `restrictions[i] = [id_i, maxHeight_i]` indicates 
that building `id_i` must have a height less than or equal to `maxHeight_i`.

It is guaranteed that each building will appear at most once in `restrictions`, and building `1` will not be in `restrictions`.

Return the maximum possible height of the tallest building.

**Constraints:**

- `2 <= n <= 10^9`
- `0 <= restrictions.length <= min(n - 1, 10^5)`
- `2 <= id_i <= n`
- `id_i` is unique.
- `0 <= maxHeight_i <= 10^9`

## 基礎思路

本題要在一條直線上建造 `n` 棟建築，第一棟高度必須為 0，相鄰兩棟的高度差不得超過 1，且部分建築有各自的最大高度上限。目標是讓最高的那棟建築盡可能高。

在思考解法時，可掌握以下核心觀察：

- **真正的關鍵點只有受限制的建築**：
  受限制的建築（以及固定為 0 的第一棟）才是「錨點」，錨點之間的建築高度可自由變化。由於建築數量可能極大（最多十億），而限制數量有限，因此只需針對這些錨點進行運算，毋須逐棟枚舉。

- **高度限制具有傳遞性**：
  由於每往旁邊走一步高度最多只能變化 1，某個錨點的低上限會連帶限制其他錨點所能達到的高度。因此一個錨點的實際可達高度，是其名目上限與「由鄰居一路爬升而來的高度」兩者取較小值。

- **相鄰錨點之間呈山形剖面**：
  在任意兩個錨點之間，高度會先上升再下降，最高點恰落在兩側上升斜坡的交會處。

依據以上特性，可採用以下策略：

- **先將所有錨點依位置由左到右排序**，使後續的鄰居推導能線性進行。
- **進行正向掃描**：每個錨點受其左鄰居高度加上彼此間距而收緊上限。
- **進行反向掃描**：對稱地以右鄰居再次收緊；雙向掃描後每個錨點的高度即為真正可達的最大值。
- **逐對計算相鄰錨點之間的峰值**（取兩端高度與距離之和的一半並向下取整）。
- **單獨處理尾段**：最後一個錨點之後直到第 `n` 棟，高度可不受限制地持續攀升。

取所有候選峰值的最大者，即為答案。

## 解題步驟

### Step 1：配置暫存緩衝區與 ping-pong 指標

基數排序需要一組與輸入等長的暫存陣列與一個 256 桶的計數陣列；同時以指標形式建立來源與目標兩組緩衝區，方便每一輪交替使用。

```typescript
/**
 * 以 LSD 基數排序將成對的鍵/值型別陣列依鍵的遞增順序排序。每個值會持續
 * 跟隨其原始鍵，因此配對保持完整。兩個陣列皆於原地重新排序。
 *
 * @param keys - 用於排序的 32 位元整數鍵（於原地排序）。
 * @param values - 伴隨的值，重新排序以對應排序後的鍵。
 * @param length - 陣列前端有效元素的數量。
 */
function radixSortKeyValue(
  keys: Int32Array,
  values: Int32Array,
  length: number,
): void {
  const temporaryKeys = new Int32Array(length);
  const temporaryValues = new Int32Array(length);
  const bucketCount = new Int32Array(256);

  // 明確的型別標註使 ping-pong 緩衝區不限定緩衝種類，
  // 讓來源/目標的互換能在泛型 Int32Array 函式庫下通過型別檢查。
  let sourceKeys: Int32Array = keys;
  let sourceValues: Int32Array = values;
  let destinationKeys: Int32Array = temporaryKeys;
  let destinationValues: Int32Array = temporaryValues;

  // ...
}
```

### Step 2：逐位元組掃描並統計各桶的鍵數量

外層迴圈每次處理一個位元組，從最低位元組開始；進入每一輪先清空桶計數，再統計目前位元組下每個桶各有多少鍵。

```typescript
function radixSortKeyValue(...): void {
  // Step 1：配置暫存緩衝區與 ping-pong 指標

  // 一次處理 32 位元鍵的一個位元組，從最低位元組開始
  for (let shift = 0; shift < 32; shift += 8) {
    bucketCount.fill(0);

    // 統計有多少鍵落入這 256 個位元組桶中的每一個
    for (let index = 0; index < length; index++) {
      const bucket = (sourceKeys[index] >>> shift) & 0xff;
      bucketCount[bucket]++;
    }

    // ...
  }
}
```

### Step 3：以前綴和將桶計數轉換為起始偏移

將每個桶的數量改寫為「該桶在輸出中的起始位置」，作法是以獨佔式前綴和累加，使各桶獲得彼此不重疊的連續寫入區段。

```typescript
function radixSortKeyValue(...): void {
  // Step 1：配置暫存緩衝區與 ping-pong 指標

  for (let shift = 0; shift < 32; shift += 8) {
    // Step 2：清零桶計數並統計各桶的鍵數量

    // 透過獨佔式前綴和將計數轉換為起始偏移量
    let runningOffset = 0;
    for (let bucket = 0; bucket < 256; bucket++) {
      const currentCount = bucketCount[bucket];
      bucketCount[bucket] = runningOffset;
      runningOffset += currentCount;
    }

    // ...
  }
}
```

### Step 4：將鍵值配對散佈到排序位置並互換緩衝區

依照剛算出的偏移量，把每個鍵與其伴隨值一起寫入目標緩衝區的正確位置；本輪結束後互換來源與目標，供下一個位元組使用。由於共四個回合（偶數次互換），最終資料剛好回到原陣列，無須額外複製。

```typescript
function radixSortKeyValue(...): void {
  // Step 1：配置暫存緩衝區與 ping-pong 指標

  for (let shift = 0; shift < 32; shift += 8) {
    // Step 2：清零桶計數並統計各桶的鍵數量

    // Step 3：以前綴和將計數轉換為起始偏移量

    // 將每個鍵/值配對散佈到此位元組對應的排序位置
    for (let index = 0; index < length; index++) {
      const bucket = (sourceKeys[index] >>> shift) & 0xff;
      const position = bucketCount[bucket]++;
      destinationKeys[position] = sourceKeys[index];
      destinationValues[position] = sourceValues[index];
    }

    // 為下一個位元組回合互換來源與目標緩衝區
    const swappedKeys = sourceKeys;
    sourceKeys = destinationKeys;
    destinationKeys = swappedKeys;

    const swappedValues = sourceValues;
    sourceValues = destinationValues;
    destinationValues = swappedValues;
  }

  // 四個位元組回合為偶數次互換，因此排序後的資料已
  // 回到原始的 keys/values 陣列中 — 不需要額外複製
}
```

### Step 5：取得限制數量並處理無任何限制的情況

主函數先取得限制數量；若完全沒有高度上限，高度便會從第一棟一路每次加一直到第 `n` 棟，最高即為 `n - 1`，可直接回傳。

```typescript
/**
 * 在相鄰限制與每棟建築高度限制下，計算最高建築的最大可能高度。
 *
 * @param n - 建築數量，標號為 1 到 n。
 * @param restrictions - [建築編號, 最大高度] 的配對。
 * @returns 最高建築可達到的最大高度。
 */
function maxBuilding(n: number, restrictions: number[][]): number {
  const restrictionCount = restrictions.length;

  // 若沒有高度上限，高度會從建築 1 一路每次加一直到建築 n
  if (restrictionCount === 0) {
    return n - 1;
  }

  // ...
}
```

### Step 6：建立錨點陣列、填入限制並依位置排序

預留索引 0 給強制規則「第一棟高度為 0」，其餘位置填入各筆限制的編號與上限；接著呼叫基數排序，使所有錨點依建築位置由左到右排列。

```typescript
function maxBuilding(...): number {
  // Step 5：取得限制數量並處理無任何限制的情況

  // 索引 0 保留給強制規則「建築 1 的高度為 0」
  const pointCount = restrictionCount + 1;
  const buildingIds = new Int32Array(pointCount);
  const maxHeights = new Int32Array(pointCount);

  buildingIds[0] = 1;
  maxHeights[0] = 0;

  for (let index = 0; index < restrictionCount; index++) {
    const restriction = restrictions[index];
    buildingIds[index + 1] = restriction[0];
    maxHeights[index + 1] = restriction[1];
  }

  // 依建築位置由左到右排序受限制的建築
  radixSortKeyValue(buildingIds, maxHeights, pointCount);

  // ...
}
```

### Step 7：正向掃描，以左鄰居收緊每個錨點上限

從左到右遍歷，每個錨點最多只能比左鄰居高出「兩者之間的間距」；若由左鄰爬升而來的高度小於原本的上限，便以較緊的值取代。

```typescript
function maxBuilding(...): number {
  // Step 5：取得限制數量並處理無任何限制的情況

  // Step 6：建立錨點陣列、填入限制並依位置排序

  // 正向掃描：一棟建築受其左鄰居的高度加上間距所限制
  for (let index = 1; index < pointCount; index++) {
    const reachableFromLeft =
      maxHeights[index - 1] + (buildingIds[index] - buildingIds[index - 1]);
    if (reachableFromLeft < maxHeights[index]) {
      maxHeights[index] = reachableFromLeft;
    }
  }

  // ...
}
```

### Step 8：反向掃描，以右鄰居對稱收緊上限

從右到左再掃描一次，以右鄰居施加對稱的限制。經過雙向掃描後，每個錨點儲存的就是其在所有限制下真正可達的最大高度。

```typescript
function maxBuilding(...): number {
  // Step 5：取得限制數量並處理無任何限制的情況

  // Step 6：建立錨點陣列、填入限制並依位置排序

  // Step 7：正向掃描以左鄰居收緊每個錨點上限

  // 反向掃描：以右鄰居對稱地收緊上限
  for (let index = pointCount - 2; index >= 0; index--) {
    const reachableFromRight =
      maxHeights[index + 1] + (buildingIds[index + 1] - buildingIds[index]);
    if (reachableFromRight < maxHeights[index]) {
      maxHeights[index] = reachableFromRight;
    }
  }

  // ...
}
```

### Step 9：計算每對相鄰錨點之間的峰值

相鄰兩錨點之間呈山形，最高點落在兩側上升斜坡的交會處，其值為兩端高度與距離之和的一半（向下取整）。逐對計算並持續追蹤目前找到的最大峰值。

```typescript
function maxBuilding(...): number {
  // Step 5：取得限制數量並處理無任何限制的情況

  // Step 6：建立錨點陣列、填入限制並依位置排序

  // Step 7：正向掃描以左鄰居收緊每個錨點上限

  // Step 8：反向掃描以右鄰居對稱收緊上限

  // 在兩個固定點之間，最高點位於兩條上升斜坡交會處：
  // floor((leftHeight + rightHeight + distance) / 2)。
  let tallest = 0;
  for (let index = 1; index < pointCount; index++) {
    const leftHeight = maxHeights[index - 1];
    const rightHeight = maxHeights[index];
    const distance = buildingIds[index] - buildingIds[index - 1];
    const peak = Math.floor((leftHeight + rightHeight + distance) / 2);
    if (peak > tallest) {
      tallest = peak;
    }
  }

  // ...
}
```

### Step 10：計算尾段峰值並回傳最終答案

最後一個錨點之後直到第 `n` 棟之間沒有任何上限，高度可不受限制地持續攀升，因此尾段峰值即為該錨點高度加上其到第 `n` 棟的距離；與先前的最大值比較後回傳結果。

```typescript
function maxBuilding(...): number {
  // Step 5：取得限制數量並處理無任何限制的情況

  // Step 6：建立錨點陣列、填入限制並依位置排序

  // Step 7：正向掃描以左鄰居收緊每個錨點上限

  // Step 8：反向掃描以右鄰居對稱收緊上限

  // Step 9：計算每對相鄰錨點之間的峰值

  // 越過最後一個限制後，高度可自由攀升直到建築 n
  const tailPeak =
    maxHeights[pointCount - 1] + (n - buildingIds[pointCount - 1]);
  if (tailPeak > tallest) {
    tallest = tailPeak;
  }

  return tallest;
}
```

## 時間複雜度

- 設限制數量為 `m`，建立並填入錨點陣列需 $O(m)$。
- 基數排序固定進行 4 個位元組回合，每回合為 $O(m + 256)$，總計仍為 $O(m)$。
- 正向掃描、反向掃描與峰值計算各需一次線性遍歷，皆為 $O(m)$。
- 總時間複雜度為 $O(m)$。

> $O(m)$

## 空間複雜度

- 錨點的鍵與值陣列各需 $O(m)$。
- 基數排序的暫存緩衝區同樣需要 $O(m)$，桶計數陣列為固定的 $O(1)$。
- 總空間複雜度為 $O(m)$。

> $O(m)$
