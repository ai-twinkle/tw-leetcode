# 3488. Closest Equal Element Queries

You are given a circular array `nums` and an array queries.

For each query `i`, you have to find the following:

- The minimum distance between the element at index `queries[i]` and any other index `j` in the circular array, where` nums[j] == nums[queries[i]]`. 
  If no such index exists, the answer for that query should be -1.

Return an array `answer` of the same size as `queries`, where `answer[i]` represents the result for query `i`.

**Constraints:**

- `1 <= queries.length <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^6`
- `0 <= queries[i] < nums.length`

## 基礎思路

本題要求在一個環狀陣列中，對每個查詢索引找出距離最近的相同值元素，並回傳其最短環狀距離。若該值在陣列中唯一，則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **環狀距離的本質**：
  環狀陣列中兩點之間的最短距離，等於「順時針距離」與「逆時針距離」兩者取最小值；因此對每個索引，只需分別找出其左方與右方最近的相同值位置即可。

- **前向與後向掃描可各自給出一個方向的最近鄰**：
  對陣列進行一次正向掃描，可為每個位置記錄「最近的左側相同值鄰居索引」；反向掃描則對應右側。兩者合併即可求得最短環狀距離。

- **環繞邏輯可透過雙倍範圍掃描消除**：
  若只掃描 `[0, n)` 會遺漏環狀跨越邊界的鄰居；將掃描範圍延伸至 `[-n, n)` 或 `[0, 2n)`，可使環狀鄰居自然落入線性掃描的覆蓋範圍內。

- **以直接索引陣列取代雜湊表可提升效能**：
  由於數值範圍有界，可預先建立一個與最大值等大的陣列作為位置記錄，以 $O(1)$ 時間存取，避免雜湊碰撞帶來的常數開銷。

依據以上特性，可以採用以下策略：

- **正向掃描範圍從 `-n` 到 `n-1`**，以環狀索引對應原始位置，讓左側環繞鄰居自然落入掃描順序中，為每個位置記錄最近左鄰索引。
- **反向掃描範圍從 `2n-1` 到 `0`**，同樣以環狀索引對應，為每個位置記錄最近右鄰索引。
- **對每個查詢，分別計算左右距離後取最小值**；若兩方向均無其他相同值，則輸出 `-1`。

此策略將整體複雜度控制在線性範圍內，適合處理大規模輸入。

## 解題步驟

### Step 1：找出數值上界以建立直接索引查找表

先掃描整個陣列取得最大值，作為後續直接索引陣列的容量依據，避免使用雜湊表帶來的額外開銷。

```typescript
const length = nums.length;

// 找出最大值以決定位置查找陣列的大小
let maxValue = 0;
for (let i = 0; i < length; i++) {
  if (nums[i] > maxValue) {
    maxValue = nums[i];
  }
}
```

### Step 2：初始化查找表與左右鄰居陣列

建立一個以數值為索引的位置查找表，並初始化儲存每個位置左右最近相同值鄰居索引的陣列，為正向與反向掃描做準備。

```typescript
// 直接索引位置查找，比 Map 更快
const EMPTY_SENTINEL = -1000001;
const positionLookup = new Int32Array(maxValue + 1).fill(EMPTY_SENTINEL);

// 從左側（環狀）找到的最近相同值鄰居索引
const nearestLeft = new Int32Array(length);
// 從右側（環狀）找到的最近相同值鄰居索引
const nearestRight = new Int32Array(length);
```

### Step 3：正向掃描以記錄每個位置的最近左鄰索引

掃描範圍從 `-n` 到 `n-1`，透過環狀索引對應到原始位置；當掃描位置 `i >= 0` 時，查找表中若已有同值的記錄，即為該位置最近的左方相同值鄰居，否則表示左側無其他相同值，以 `-n` 作為哨兵距離。每次掃描後將當前位置寫入查找表，供後續位置參照。

```typescript
// 正向掃描：從 -length 到 length-1 以處理環狀繞回
for (let i = -length; i < length; i++) {
  const circularIndex = (i + length) % length;
  const value = nums[circularIndex];
  if (i >= 0) {
    nearestLeft[i] = positionLookup[value] !== EMPTY_SENTINEL ? positionLookup[value] : -length;
  }
  positionLookup[value] = i;
}
```

### Step 4：重置查找表並進行反向掃描以記錄最近右鄰索引

重置查找表後，從 `2n-1` 往回掃描到 `0`，同樣透過環狀索引對應原始位置；當掃描位置 `i < n` 時，記錄右側最近相同值鄰居索引，若右側無其他相同值則以 `2n` 作為哨兵距離。

```typescript
// 重置查找表以供反向掃描使用
positionLookup.fill(EMPTY_SENTINEL);

// 反向掃描：從 2*length-1 到 0 以處理環狀繞回
for (let i = 2 * length - 1; i >= 0; i--) {
  const circularIndex = i % length;
  const value = nums[circularIndex];
  if (i < length) {
    nearestRight[i] = positionLookup[value] !== EMPTY_SENTINEL ? positionLookup[value] : 2 * length;
  }
  positionLookup[value] = i;
}
```

### Step 5：對每個查詢計算最短環狀距離

對每個查詢索引，分別用左鄰與右鄰索引計算出兩個方向的距離；若左側距離恰好等於 `n`，表示整個陣列中該值唯一，回傳 `-1`；否則取兩方向距離的最小值作為答案。

```typescript
// 對每個查詢計算最短環狀距離
const minimumDistances = new Array<number>(queries.length);
for (let i = 0; i < queries.length; i++) {
  const queryIndex = queries[i];
  const distanceLeft = queryIndex - nearestLeft[queryIndex];
  if (distanceLeft === length) {
    // 不存在其他相同值的元素
    minimumDistances[i] = -1;
  } else {
    const distanceRight = nearestRight[queryIndex] - queryIndex;
    minimumDistances[i] = distanceLeft < distanceRight ? distanceLeft : distanceRight;
  }
}
```

### Step 6：回傳結果陣列

所有查詢處理完畢後，回傳記錄各查詢最短距離的結果陣列。

```typescript
return minimumDistances;
```

## 時間複雜度

- 掃描陣列取最大值需 $O(n)$；
- 正向與反向掃描各需 $O(n)$，合計 $O(n)$；
- 對每個查詢計算距離需 $O(q)$，其中 $q$ 為查詢數量，且 $q \leq n$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 直接索引查找表大小為數值上界，最多 $O(V)$，其中 $V$ 為數值最大值（題目約束為 $10^6$）；
- 左右鄰居陣列各佔 $O(n)$；
- 結果陣列佔 $O(q)$；
- 總空間複雜度為 $O(n + V)$。

> $O(n + V)$
