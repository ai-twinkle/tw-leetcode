# 2126. Destroying Asteroids

You are given an integer `mass`, which represents the original mass of a planet. 
You are further given an integer array `asteroids`, where `asteroids[i]` is the mass of the $i^{th}$ asteroid.

You can arrange for the planet to collide with the asteroids in any arbitrary order. 
If the mass of the planet is greater than or equal to the mass of the asteroid, 
the asteroid is destroyed and the planet gains the mass of the asteroid. 
Otherwise, the planet is destroyed.

Return `true` if all asteroids can be destroyed. 
Otherwise, return `false`.

**Constraints:**

- `1 <= mass <= 10^5`
- `1 <= asteroids.length <= 10^5`
- `1 <= asteroids[i] <= 10^5`

## 基礎思路

本題給定一個行星的初始質量與一組小行星質量，行星可依任意順序與小行星撞擊：若行星質量大於或等於小行星質量，則小行星被摧毀，且行星吸收其質量；反之則行星被摧毀。需判斷是否存在某種撞擊順序，可使所有小行星全數被摧毀。

在思考解法時，可掌握以下核心觀察：

- **撞擊順序由我們自由決定**：
  題目允許任意安排，因此可選擇對行星最有利的順序進行撞擊。

- **質量小者應優先撞擊**：
  若行星目前已能撞毀最小的剩餘小行星，那麼撞毀後行星質量會變大，使其更可能擊毀後續較大的小行星；反之，若連最小的都撞不毀，更大者就絕無可能，此時可直接判定無法全部摧毀。

- **存在絕對安全的提前終止點**：
  一旦行星質量大於或等於整組中最大的小行星，剩餘所有小行星皆可被摧毀，無需繼續走訪。

依據以上特性，可以採用以下策略：

- **將所有小行星依質量由小至大排序**，確保每次撞擊都從目前最小者開始。
- **依序撞擊並累積質量**，若途中遇到撞不毀的情況則立即回傳 `false`。
- **以「行星已超越最大小行星」作為提前終止條件**，避免不必要的剩餘走訪。

最終若能完整走訪整個排序後序列而未中途失敗，即代表所有小行星皆可被摧毀。

## 解題步驟

### Step 1：取得小行星總數

先取得小行星陣列的長度，後續排序、走訪與索引最大值皆會用到。

```typescript
const totalCount = asteroids.length;
```

### Step 2：將小行星依質量由小至大排序

採用 `Uint32Array` 進行儲存與排序：型別化陣列的排序為原生數值比較，相較一般 `Array.prototype.sort()` 在不指定比較函式時的字串排序行為，更為直接且能避免每次比較都呼叫 JS 函式的額外成本。

```typescript
// 使用型別陣列排序，採用原生數值比較順序，避免每次比較都需呼叫 JS 比較函式的額外成本
const sortedAsteroids = new Uint32Array(asteroids).sort();
```

### Step 3：記錄最大的小行星質量

排序後序列最後一個元素即為整組中質量最大的小行星，將其單獨記錄下來，後續會作為「行星已絕對安全」的提前終止判斷依據。

```typescript
const largestAsteroid = sortedAsteroids[totalCount - 1];
```

### Step 4：初始化行星當前質量

以原始輸入質量作為起始狀態，後續隨著吸收小行星而持續增加。

```typescript
let currentMass = mass;
```

### Step 5：依序走訪小行星並先判斷是否能將其摧毀

依照排序後的順序逐顆處理小行星：
若行星目前的質量已不足以撞毀當前這顆小行星，由於此小行星已是剩餘中最小者，後續更大的更不可能被撞毀，可直接回傳 `false`。

```typescript
// 貪婪策略：先處理最小的小行星，使行星質量盡可能快速增長
for (let index = 0; index < totalCount; index++) {
  const asteroidMass = sortedAsteroids[index];
  // 若當前行星質量小於此小行星質量，則無法摧毀，直接回傳 false
  if (currentMass < asteroidMass) {
    return false;
  }
  // ...
}
```

### Step 6：若行星質量已超越最大小行星，提前回傳成功

當行星累積的質量已大於或等於整組中最大的小行星時，剩餘所有小行星皆必定能被摧毀，可直接回傳 `true`，避免不必要的迭代。

```typescript
for (let index = 0; index < totalCount; index++) {
  // Step 5：取得當前小行星質量並判斷是否能摧毀

  // 一旦行星質量超越最大的小行星，剩餘所有小行星皆能安全撞毀
  if (currentMass >= largestAsteroid) {
    return true;
  }
  // ...
}
```

### Step 7：摧毀當前小行星後吸收其質量

通過上述兩項檢查後，代表此小行星可被摧毀，將其質量併入行星，使行星質量持續增長，以便應對後續更大的小行星。

```typescript
for (let index = 0; index < totalCount; index++) {
  // Step 5：取得當前小行星質量並判斷是否能摧毀

  // Step 6：行星質量已超越最大小行星時的提前終止檢查

  // 將此小行星的質量加入行星，使其變得更強
  currentMass += asteroidMass;
}
```

### Step 8：迴圈順利結束代表所有小行星皆被摧毀

若能完整走訪所有小行星且未中途回傳 `false`，則代表所有小行星均已成功撞毀，回傳 `true`。

```typescript
return true;
```

## 時間複雜度

- 對 `n` 個小行星進行排序需 $O(n \log n)$；
- 最壞情況下需走訪整個排序後序列一次，為 $O(n)$；
- 提前終止僅能在實務上加速，並不影響最差情況。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用一個 `Uint32Array` 儲存排序後的小行星，佔用 $O(n)$；
- 其餘僅為固定數量的純量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
