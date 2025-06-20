# 3443. Maximum Manhattan Distance After K Changes

You are given a string `s` consisting of the characters `'N'`, `'S'`, `'E'`, and `'W'`, 
where `s[i]` indicates movements in an infinite grid:

- `'N'` : Move north by 1 unit.
- `'S'` : Move south by 1 unit.
- `'E'` : Move east by 1 unit.
- `'W'` : Move west by 1 unit.

Initially, you are at the origin `(0, 0)`. 
You can change at most `k` characters to any of the four directions.

Find the maximum Manhattan distance from the origin that can be achieved at any time while performing the movements in order.

The Manhattan Distance between two cells `(x_i, y_i)` and `(x_j, y_j)` is `|x_i - x_j| + |y_i - y_j|`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `0 <= k <= s.length`
- `s` consists of only `'N'`, `'S'`, `'E'`, and `'W'`.

## 基礎思路

本題的核心目標是最大化在執行移動過程中所能達到的曼哈頓距離，考慮我們初始位於原點，每一步根據給定的方向移動，但允許最多變更 $k$ 個方向。
因此，我們可以運用以下策略來解決問題：

1. **記錄當前所在位置**：持續更新目前的座標（經緯度）。
2. **即時考量更改方向的潛在好處**：每次更改方向，最多可使距離增加 2（例如將原本往南改成往北，淨差距增加2）。
   因此，$k$ 次變更最多可帶來 $2k$ 單位的額外曼哈頓距離。
3. **動態評估可達距離**：每一步即時評估當前座標的距離，加上可能的最大變更增益（即 $2k$），並與目前已移動的步數作比較（不可能超過已經移動的總步數），來取得實際上當前能夠到達的最大距離。
4. **追蹤整個過程中的最大距離**：在遍歷過程中更新並記錄全局最大值，即為最終答案。

## 解題步驟

### Step 1：初始化並預處理方向編碼

首先將方向字串解碼成 ASCII 編碼，以便於之後快速比較。

```typescript
const length: number = s.length;

// 預先將所有方向字元解碼成 char code 存入 Uint16Array
const directionCodes = new Uint16Array(length);
for (let i = 0; i < length; ++i) {
  directionCodes[i] = s.charCodeAt(i);
}
```

### Step 2：初始化座標與最大距離追蹤變數

設定初始座標、最大距離以及可利用的最大增益（$2k$）。

```typescript
let currentLatitude = 0;    // 當前緯度（南北方向）
let currentLongitude = 0;   // 當前經度（東西方向）
let maxDistanceSoFar = 0;   // 至今為止的最大距離
const twoTimesK = k << 1;   // 使用位元移位取代乘法提升效能（k*2）
```

### Step 3：遍歷每個步驟，更新當前座標

#### Step 3.1：逐步掃描方向字串

逐步掃描每個移動方向，依據方向字元調整座標。

```typescript
for (let stepIndex = 0; stepIndex < length; ++stepIndex) {
  const code = directionCodes[stepIndex];

  // 根據方向字元調整座標
  if (code === 78) {          // 字元 'N'
    ++currentLatitude;
  } else if (code === 83) {   // 字元 'S'
    --currentLatitude;
  } else if (code === 69) {   // 字元 'E'
    ++currentLongitude;
  } else {                    // 字元 'W'
    --currentLongitude;
  }

  // ...
}
```

#### Step 3.2：計算當前位置絕對座標

為了計算曼哈頓距離，我們需要經緯度的絕對值：

```typescript
for (let stepIndex = 0; stepIndex < length; ++stepIndex) {
  // Step 3.1：逐步掃描方向字串

  const absoluteLatitude = currentLatitude < 0 ? -currentLatitude : currentLatitude;
  const absoluteLongitude = currentLongitude < 0 ? -currentLongitude : currentLongitude;

  // ...
}
```

#### Step 3.3：動態評估當前潛在最大距離

在此步考慮若將所有變更的機會（$k$）全部用盡，距離可達的最大潛在值。但仍須考量實際已經移動的步數限制：

```typescript
for (let stepIndex = 0; stepIndex < length; ++stepIndex) {
  // Step 3.1：逐步掃描方向字串

  // Step 3.2：計算當前位置絕對座標

  // 理想情況使用所有可用的變更獲得的距離
  const potentialDistance = absoluteLatitude + absoluteLongitude + twoTimesK;

  // 限制實際可達距離，最多只能是已走步數（stepIndex + 1）
  const reachableDistance = potentialDistance < stepIndex + 1
    ? potentialDistance
    : stepIndex + 1;

  // ...
}
```

#### Step 3.4：更新並追蹤最大距離

比較並更新全局最大曼哈頓距離：

```typescript
for (let stepIndex = 0; stepIndex < length; ++stepIndex) {
  // Step 3.1：逐步掃描方向字串

  // Step 3.2：計算當前位置絕對座標
  
  // Step 3.3：動態評估當前潛在最大距離
  
  maxDistanceSoFar = maxDistanceSoFar > reachableDistance
    ? maxDistanceSoFar
    : reachableDistance;
}
```

### Step 4：回傳最終的最大曼哈頓距離

```typescript
return maxDistanceSoFar;
```

## 時間複雜度

- 預處理方向字串為整數編碼需掃描一次，為 $O(n)$。
- 主迴圈遍歷每個步驟執行恆定次數的運算，每一步驟為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了與輸入字串長度相同的 `Uint16Array` 存放方向編碼，額外空間需求為 $O(n)$。
- 其餘使用固定數量的輔助變數，為 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
