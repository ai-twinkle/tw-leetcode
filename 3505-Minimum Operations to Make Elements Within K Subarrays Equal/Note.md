# 3505. Minimum Operations to Make Elements Within K Subarrays Equal

You are given an integer array `nums` and two integers, `x` and `k`. 
You can perform the following operation any number of times (including zero):

Increase or decrease any element of `nums` by 1.
Return the minimum number of operations needed to have at least `k` non-overlapping subarrays of size exactly `x` in `nums`, 
where all elements within each subarray are equal.

**Constraints:**

- `2 <= nums.length <= 10^5`
- `-10^6 <= nums[i] <= 10^6`
- `2 <= x <= nums.length`
- `1 <= k <= 15`
- `2 <= k * x <= nums.length`

## 基礎思路

本題要求透過對元素加一或減一，使陣列中至少出現 `k` 個互不重疊、長度恰為 `x` 且元素全部相等的子陣列，並求最少操作次數。
由於陣列長度可達 `10^5`，必須有效率地計算每個候選子陣列的成本，再從中挑選最佳組合。

在思考解法時，可掌握以下核心觀察：

- **單一子陣列的最小成本由中位數決定**：
  要把一段元素調整成同一個值，總操作數等於各元素與目標值的絕對差總和。此總和在目標值取中位數時最小，因此每個長度為 `x` 的區段都有唯一確定的最小成本。

- **所有長度固定的區段可用滑動視窗連續處理**：
  相鄰區段只差進出各一個元素，若能動態維護區段內的順序資訊，就能快速求得每個區段的中位數與其兩側的數值總和，不必每次重新排序。

- **以排名為座標的樹狀結構支援動態順序統計**：
  先將所有元素依數值排序並賦予唯一排名（數值相同時以位置區分）。
  再以兩棵樹狀陣列分別記錄各排名的出現數量與數值總和，即可在對數時間內插入、刪除元素，並以二進位提升找出中位數及其左側總和。

- **挑選不重疊區段是典型的前綴型動態規劃**：
  每個區段的成本已知後，問題轉為在前綴中選出指定數量、互不重疊的區段，使總成本最小。由於 `k` 很小，可逐層計算「使用若干個區段」的最佳結果，並以滾動陣列節省空間。

依據以上特性，可以採用以下策略：

- **先對元素進行唯一排名**，作為樹狀陣列的座標基礎。
- **以滑動視窗搭配兩棵樹狀陣列**，逐一求出每個長度為 `x` 的區段的中位數與調整成本。
- **以分層的滾動動態規劃**，對每個前綴決定「取用以此結尾的區段」或「略過此位置」，最終得到恰好使用 `k` 個區段的最小總成本。

此策略將成本計算與區段挑選分離，兩者皆能在可接受的時間內完成。

## 解題步驟

### Step 1：取得陣列長度與視窗數量

先取得陣列長度，並計算長度為 `x` 的區段共有多少個起點。

```typescript
const length = nums.length;
const windowCount = length - x + 1;
```

### Step 2：將數值與索引打包並排序

將每個元素的數值平移為非負後乘上 `131072`（大於最大索引的 2 的冪次），再加上其索引，打包成單一浮點數。如此一次型別化排序即可同時依數值排序，並以索引區分相同數值，得到唯一的順序。

```typescript
// 將 (數值, 索引) 打包為單一浮點數，使一次型別化排序即可得到唯一的排名
const packedKeys = new Float64Array(length);
for (let index = 0; index < length; index++) {
  packedKeys[index] = (nums[index] + 1000000) * 131072 + index;
}
packedKeys.sort();
```

### Step 3：建立索引到排名的對照，以及排名到數值的對照

依排序後的順序，以取餘數還原原始索引。接著記錄每個原始位置對應的排名（從 1 開始，配合樹狀陣列），並記錄每個排名對應的實際數值。

```typescript
const rankOfIndex = new Int32Array(length);
const sortedValues = new Float64Array(length);
for (let rank = 0; rank < length; rank++) {
  const originalIndex = packedKeys[rank] % 131072;
  rankOfIndex[originalIndex] = rank + 1;
  sortedValues[rank] = nums[originalIndex];
}
```

### Step 4：初始化樹狀陣列並計算二進位提升的最高步長

建立兩棵以排名為座標的樹狀陣列，分別維護元素數量與數值總和。同時求出不超過陣列長度的最大 2 的冪次，作為之後二進位提升的起始步長。

```typescript
// 以排名為索引的樹狀陣列（Fenwick Tree），分別儲存元素數量與數值總和
const countTree = new Int32Array(length + 1);
const sumTree = new Float64Array(length + 1);
let highestStep = 1;
while (highestStep * 2 <= length) {
  highestStep *= 2;
}
```

### Step 5：設定中位數相關參數與視窗成本容器

計算中位數在視窗中的順位，以及中位數右側的元素個數。接著準備儲存每個視窗成本的陣列，以及目前視窗內的數值總和。

```typescript
const medianOrder = (x + 1) >> 1;
const rightCount = x - medianOrder;
const windowCost = new Float64Array(windowCount);
let windowSum = 0;
```

### Step 6：滑動視窗——加入新進入的元素

逐一掃描每個位置，先將當前元素的數值累加進視窗總和，並在其排名位置上同時更新數量樹與總和樹。

```typescript
for (let index = 0; index < length; index++) {
  // 加入新進入視窗的元素
  const incomingValue = nums[index];
  windowSum += incomingValue;
  for (let position = rankOfIndex[index]; position <= length; position += position & -position) {
    countTree[position]++;
    sumTree[position] += incomingValue;
  }

  // ...
}
```

### Step 7：移除滑出視窗的元素

當視窗已超過 `x` 個元素時，將最早進入的元素自視窗總和中扣除，並在兩棵樹中撤銷其貢獻，使視窗大小維持為 `x`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 6：加入新進入視窗的元素

  // 移除滑出視窗的元素
  if (index >= x) {
    const outgoingValue = nums[index - x];
    windowSum -= outgoingValue;
    for (let position = rankOfIndex[index - x]; position <= length; position += position & -position) {
      countTree[position]--;
      sumTree[position] -= outgoingValue;
    }
  }

  // ...
}
```

### Step 8：以二進位提升定位中位數與其左側總和

當視窗已滿 `x` 個元素時，從最高步長開始，在數量樹上逐步向右推進。只要推進後累積數量仍小於中位數順位，就接受此步並累加對應的數量與總和。結束時所在位置的下一個排名即為中位數，而累積總和即為排名低於中位數的元素總和。

```typescript
for (let index = 0; index < length; index++) {
  // Step 6：加入新進入視窗的元素

  // Step 7：移除滑出視窗的元素

  if (index >= x - 1) {
    // 以二進位提升（Binary Lifting）定位中位數的排名，以及排名在其之下的元素總和
    let position = 0;
    let accumulatedCount = 0;
    let accumulatedSum = 0;
    for (let step = highestStep; step > 0; step >>= 1) {
      const next = position + step;
      if (next <= length && accumulatedCount + countTree[next] < medianOrder) {
        position = next;
        accumulatedCount += countTree[next];
        accumulatedSum += sumTree[next];
      }
    }

    // ...
  }
}
```

### Step 9：計算當前視窗調整為中位數的成本

取得中位數後，左半部（含中位數）共 `medianOrder` 個元素，其總和為累積總和加上中位數；右半部總和則為視窗總和減去左半部總和。左半部提升至中位數的成本，加上右半部降至中位數的成本，即為此視窗的最小調整成本。

```typescript
for (let index = 0; index < length; index++) {
  // Step 6：加入新進入視窗的元素

  // Step 7：移除滑出視窗的元素

  if (index >= x - 1) {
    // Step 8：以二進位提升定位中位數與其左側總和

    const median = sortedValues[position];
    const leftSum = accumulatedSum + median;
    windowCost[index - x + 1] = median * medianOrder - leftSum + (windowSum - leftSum) - median * rightCount;
  }
}
```

### Step 10：初始化滾動動態規劃陣列

準備兩個滾動陣列：一個保存「少用一個區段」時各前綴的最佳成本，一個用於計算當前層。初始狀態代表使用 0 個區段，所有前綴成本皆為 0。

```typescript
// 滾動 DP：previous[i] 表示在前 i 個元素中使用 (used - 1) 個子陣列的最小成本
let previous = new Float64Array(length + 1);
let current = new Float64Array(length + 1);
```

### Step 11：逐層計算並標記不可行的前綴

依序計算使用 1 到 `k` 個區段的結果。對於使用 `used` 個區段的層，前綴長度至少需達 `used * x` 才可能容納這些區段，因此較短的前綴設為無限大，表示不可行。

```typescript
for (let used = 1; used <= k; used++) {
  const firstEnd = used * x;
  for (let end = 0; end < firstEnd; end++) {
    current[end] = Infinity;
  }

  // ...
}
```

### Step 12：對每個可行前綴進行取用或略過的轉移

對每個前綴長度，比較兩種選擇：取用以此位置結尾的區段（上一層在該區段起點前的最佳成本，加上該區段成本），或略過此位置（沿用本層前一個前綴的成本）。取兩者較小值。

```typescript
for (let used = 1; used <= k; used++) {
  // Step 11：標記長度不足的前綴為不可行

  for (let end = firstEnd; end <= length; end++) {
    const takeCost = previous[end - x] + windowCost[end - x];
    const skipCost = current[end - 1];
    current[end] = takeCost < skipCost ? takeCost : skipCost;
  }

  // ...
}
```

### Step 13：交換滾動陣列

本層計算完成後，交換兩個陣列，使本層結果成為下一層的「上一層」，並重複使用另一個陣列的空間。

```typescript
for (let used = 1; used <= k; used++) {
  // Step 11：標記長度不足的前綴為不可行

  // Step 12：進行取用或略過的轉移

  const swap = previous;
  previous = current;
  current = swap;
}
```

### Step 14：回傳使用 k 個區段時整個陣列的最小成本

完成所有層後，`previous` 保存的是使用 `k` 個區段的結果，取整個陣列長度對應的值即為答案。

```typescript
return previous[length];
```

## 時間複雜度

- 打包並排序所有元素需 $O(n \log n)$；
- 建立排名對照需 $O(n)$；
- 滑動視窗中，每個元素各插入、刪除一次，每次樹狀陣列更新為 $O(\log n)$；每個視窗以二進位提升求中位數亦為 $O(\log n)$，合計 $O(n \log n)$；
- 動態規劃共 $k$ 層，每層線性掃描 $O(n)$，合計 $O(k \cdot n)$；
- 總時間複雜度為 $O(n \log n + k \cdot n)$。

> $O(n \log n + k \cdot n)$

## 空間複雜度

- 打包鍵值、排名對照、排序後數值與視窗成本陣列皆為 $O(n)$；
- 兩棵樹狀陣列各為 $O(n)$；
- 兩個滾動動態規劃陣列各為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
