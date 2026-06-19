# 1732. Find the Highest Altitude

There is a biker going on a road trip. The road trip consists of `n + 1` points at different altitudes. 
The biker starts his trip on point `0` with altitude equal `0`.

You are given an integer array `gain` of length `n` where `gain[i]` is the net gain in altitude 
between points `i` and `i + 1` for all (`0 <= i < n`). 
Return the highest altitude of a point.

**Constraints:**

- `n == gain.length`
- `1 <= n <= 100`
- `-100 <= gain[i] <= 100`

## 基礎思路

本題要求在一段由 `gain` 描述的高度變化序列中，找出整段路途中所能到達的最高點海拔。由於起點高度為 0，且 `gain[i]` 為第 `i` 點到第 `i+1` 點的「淨高度變化」，因此每個點的海拔本質上是一段前綴和。

在思考解法時，可掌握以下核心觀察：

- **點的海拔即為前綴和**：
  第 `i+1` 個點的高度等於起點 0 加上 `gain[0]` 至 `gain[i]` 的累積總和，因此整段旅程的所有海拔可由前綴和依序產生。

- **最高點必出現在某一個點上**：
  最高海拔不需在中途額外運算，只需在每次更新前綴和後，與目前已知最大值比較即可。

- **起點高度 0 必須納入候選**：
  若所有 `gain[i]` 皆為負值，則整段旅程的最高點即為起點，因此最高值的初始值必須為 0。

依據以上特性，可以採用以下策略：

- **以單一變數維護目前所在點的海拔（即前綴和）**，避免額外的陣列空間。
- **以另一變數維護目前為止觀察到的最高海拔**，在每次更新前綴和後立即比較並更新。
- **以一次線性掃描同時完成前綴和累積與最大值追蹤**，確保整體流程簡潔且高效。

此策略只需單次走訪輸入陣列即可完成整體運算，且僅使用常數額外空間。

## 解題步驟

### Step 1：初始化最高海拔、當前海拔與行進點數

由於旅程起點為 0，因此將 `highestAltitude` 與 `currentAltitude` 同時初始化為 0；前者作為目前已知的最高海拔候選值，後者作為當前所在點的海拔（前綴和）。另以 `pointCount` 記錄需要走訪的次數，以便於後續迴圈使用。

```typescript
// 旅程起點為 0，作為最高海拔的初始候選值
let highestAltitude = 0;
let currentAltitude = 0;
const pointCount = gain.length;
```

### Step 2：依序累加 gain，建構當前點的海拔（前綴和）

進入單次掃描，逐一將 `gain[index]` 累加到 `currentAltitude` 上，使其成為當前所在點的海拔；此即為前綴和的滾動更新。

```typescript
// 以單次掃描完成前綴和累積與最大值追蹤
for (let index = 0; index < pointCount; index++) {
  currentAltitude += gain[index];

  // ...
}
```

### Step 3：比較並更新目前為止觀察到的最高海拔

在更新完當前海拔後，立即與 `highestAltitude` 比較；若當前海拔超過先前記錄的最高值，則更新最高海拔。

```typescript
for (let index = 0; index < pointCount; index++) {
  // Step 2：將當前 gain 累加至 currentAltitude

  // 僅當當前點的海拔高於目前最高值時才更新
  if (currentAltitude > highestAltitude) {
    highestAltitude = currentAltitude;
  }
}
```

### Step 4：回傳整段旅程中的最高海拔

當迴圈走訪完所有 `gain` 元素後，`highestAltitude` 已記錄整段旅程（包含起點 0）中的最大海拔值，直接回傳即為答案。

```typescript
// 回傳整段旅程觀察到的最高海拔
return highestAltitude;
```

## 時間複雜度

- 僅對長度為 `n` 的 `gain` 陣列進行單次線性掃描；
- 每次迭代僅執行常數次加法與比較操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用 `highestAltitude`、`currentAltitude`、`pointCount` 等固定數量的變數；
- 未使用任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
