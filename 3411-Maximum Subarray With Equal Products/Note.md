# 3411. Maximum Subarray With Equal Products

You are given an array of positive integers `nums`.

An array `arr` is called product equivalent if `prod(arr) == lcm(arr) * gcd(arr)`, where:

- `prod(arr)` is the product of all elements of `arr`.
- `gcd(arr)` is the GCD of all elements of `arr`.
- `lcm(arr)` is the LCM of all elements of `arr`.

Return the length of the longest product equivalent subarray of `nums`.

**Constraints:**

- `2 <= nums.length <= 100`
- `1 <= nums[i] <= 10`

## 基礎思路

本題要求找出最長的連續子陣列，使其所有元素的乘積恰好等於最小公倍數與最大公因數的乘積。
直接枚舉所有子陣列並計算乘積、GCD、LCM 雖然可行，但缺乏對問題結構的掌握。我們應先分析此等式成立的本質條件。

在思考解法時，可掌握以下核心觀察：

- **任意兩個數必定滿足條件**：
  對任意兩個正整數，乘積恆等於其最小公倍數與最大公因數之積。因此答案至少為 2。

- **長度三以上時等價於兩兩互質**：
  當子陣列含有三個以上元素時，只要其中任兩數共享某個質因數，乘積就會大於最小公倍數與最大公因數之積。因此條件等價於所有元素兩兩互質。

- **數值範圍極小，質因數有限**：
  所有數值皆介於 1 到 10，涉及的質因數只有 2、3、5、7 四個。每個數的質因數集合可用一個 4 位元的遮罩表示，兩數互質即代表遮罩不相交。

- **兩兩互質具有單調性**：
  若一段區間兩兩互質，其任意子區間也必定兩兩互質。這讓問題適合用滑動視窗求解。

依據以上特性，可以採用以下策略：

- **預先建立每個數值對應的質因數遮罩表**，以位元運算取代實際的因數分解。
- **以滑動視窗維護目前區間內所有質因數的聯集遮罩**。每加入一個新元素時，若與視窗遮罩相交，就從左端持續移除元素直到不相交。
- **每次擴張後更新最長合法視窗長度**，並以 2 作為下限，涵蓋任意兩數必定成立的情況。

此策略讓每個元素至多進出視窗各一次，能以線性時間求得答案。

## 解題步驟

### Step 1：預先建立數值對應的質因數遮罩表

將 0 到 10 每個數值的質因數組成編碼為位元遮罩。第 0 到 3 位分別代表質數 2、3、5、7，之後即可用位元運算判斷兩數是否互質。

```typescript
/**
 * 對應 [0, 10] 中每個數值的質因數位元遮罩。
 * 第 0 位 -> 2，第 1 位 -> 3，第 2 位 -> 5，第 3 位 -> 7。
 */
const PRIME_MASK = new Uint8Array([
  0,  // 0（未使用）
  0,  // 1
  1,  // 2
  2,  // 3
  1,  // 4  = 2^2
  4,  // 5
  3,  // 6  = 2 * 3
  8,  // 7
  1,  // 8  = 2^3
  2,  // 9  = 3^2
  5,  // 10 = 2 * 5
]);
```

### Step 2：初始化滑動視窗的狀態

先記錄陣列長度，再準備視窗狀態：`windowMask` 是視窗內所有質因數的聯集，`leftIndex` 是視窗左界。由於任意兩數必定滿足條件，最佳長度 `bestLength` 以 2 作為初始值。

```typescript
const length = nums.length;
let windowMask = 0;
let leftIndex = 0;
let bestLength = 2;
```

### Step 3：取得新元素的遮罩並收縮視窗直到不相交

以 `rightIndex` 逐一擴張視窗右界，先取得新元素的質因數遮罩。若它與目前視窗遮罩有交集，代表會與視窗中某元素共享質因數，必須從左端持續移除元素。因為視窗內的遮罩彼此不相交，可直接用 XOR 將被移除元素的遮罩從聯集中扣除。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  const currentMask = PRIME_MASK[nums[rightIndex]];

  // 持續收縮視窗，直到新元素與視窗內元素不共享任何質因數
  while ((windowMask & currentMask) !== 0) {
    windowMask ^= PRIME_MASK[nums[leftIndex]];
    leftIndex++;
  }

  // ...
}
```

### Step 4：將新元素的質因數併入視窗遮罩

確認不再相交後，將新元素的遮罩以 OR 併入視窗聯集，此時視窗內所有元素仍兩兩互質。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  // Step 3：取得新元素遮罩並收縮視窗

  windowMask |= currentMask;

  // ...
}
```

### Step 5：更新最長的兩兩互質視窗長度

計算目前視窗的長度，若超過已記錄的最佳長度，就更新答案。

```typescript
for (let rightIndex = 0; rightIndex < length; rightIndex++) {
  // Step 3：取得新元素遮罩並收縮視窗

  // Step 4：併入新元素的質因數遮罩

  // 追蹤最長的兩兩互質視窗
  const windowLength = rightIndex - leftIndex + 1;
  if (windowLength > bestLength) {
    bestLength = windowLength;
  }
}
```

### Step 6：回傳最長長度

走完所有右界後，`bestLength` 即為最長乘積等價子陣列的長度，直接回傳。

```typescript
return bestLength;
```

## 時間複雜度

- 右界掃描整個陣列一次，共 $n$ 次擴張；
- 左界只會向右移動，每個元素至多被移出視窗一次，收縮總次數為 $O(n)$；
- 每次遮罩查表與位元運算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 質因數遮罩表大小固定為 11；
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
