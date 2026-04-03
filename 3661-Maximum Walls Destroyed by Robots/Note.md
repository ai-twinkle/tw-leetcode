# 3661. Maximum Walls Destroyed by Robots

There is an endless straight line populated with some robots and walls. 
You are given integer arrays `robots`, `distance`, and `walls`:

- `robots[i]` is the position of the ith robot.
- `distance[i]` is the maximum distance the $i^{th}$ robot's bullet can travel.
- `walls[j]` is the position of the $j^{th}$ wall.

Every robot has one bullet that can either fire to the left or the right at most `distance[i]` meters.

A bullet destroys every wall in its path that lies within its range. 
Robots are fixed obstacles: if a bullet hits another robot before reaching a wall, 
it immediately stops at that robot and cannot continue.

Return the maximum number of unique walls that can be destroyed by the robots.

Notes:

- A wall and a robot may share the same position; the wall can be destroyed by the robot at that position.
- Robots are not destroyed by bullets.

**Constraints:**

- `1 <= robots.length == distance.length <= 10^5`
- `1 <= walls.length <= 10^5`
- `1 <= robots[i], walls[j] <= 10^9`
- `1 <= distance[i] <= 10^5`
- All values in `robots` are unique
- All values in `walls` are unique

## 基礎思路

本題要求在一條直線上，讓每個機器人選擇向左或向右射出子彈，使得被摧毀的獨特牆壁數量達到最大值。子彈在碰到另一個機器人時立即停止，因此機器人之間會相互遮擋，使每個機器人的有效射程受限於相鄰機器人的位置。

在思考解法時，可掌握以下核心觀察：

- **機器人是射程的天然邊界**：
  子彈不能穿透機器人，因此在已排序的機器人序列中，每個機器人向左最遠只能打到前一個機器人的位置（不含），向右最遠只能打到下一個機器人的位置（不含），再加上自身的射程限制。

- **相鄰機器人之間的間隙是獨立的決策單元**：
  間隙內的牆壁只可能由左側機器人向右或右側機器人向左覆蓋，且若兩者皆能覆蓋同一段，需利用容斥原理避免重複計算。

- **每個機器人的狀態只有兩種**：
  機器人向左開火或向右開火，且這個選擇影響前後間隙的覆蓋情況，自然形成動態規劃的狀態轉移。

- **牆壁數量可透過二分搜尋高效統計**：
  將牆壁排序後，任意連續區間內的牆壁數量可用上界與下界的差值在對數時間內算出。

依據以上特性，可以採用以下策略：

- **將機器人依位置排序**，以確保間隙的計算具有方向性與單調性。
- **定義動態規劃狀態**：對每個機器人，分別維護「向左開火時，截至目前所能摧毀的最大牆壁數」與「向右開火時的對應值」，逐步向右轉移。
- **計算每個間隙的覆蓋貢獻**，利用容斥原理合併兩側機器人的射程重疊區段，得到不重複的牆壁數量。
- **最後額外處理最右側機器人向右的無阻礙射程**，因為其右方沒有機器人遮擋。

此策略能以線性掃描完成狀態轉移，搭配二分搜尋完成牆壁計數，整體效率穩定可靠。

## 解題步驟

### Step 1：將機器人依位置排序，並同步整理射程資訊

為了讓間隙的計算具有方向性，必須先對機器人按位置由小到大排序。
由於原始陣列的索引對應關係需要保留，我們先建立一個索引陣列並對其排序，再根據排序結果提取對應的位置與射程至連續的緩衝區中。

```typescript
// 依位置建立機器人的排序索引，並隨之攜帶射程資訊
const robotOrder = new Int32Array(robotCount);
for (let index = 0; index < robotCount; index++) {
  robotOrder[index] = index;
}
robotOrder.sort((indexA, indexB) => robots[indexA] - robots[indexB]);

const sortedPositions = new Int32Array(robotCount);
const sortedDistances = new Int32Array(robotCount);
for (let index = 0; index < robotCount; index++) {
  const originalIndex = robotOrder[index];
  sortedPositions[index] = robots[originalIndex];
  sortedDistances[index] = distance[originalIndex];
}
```

### Step 2：將牆壁排序以支援二分搜尋

為了能在對數時間內統計任意區間內的牆壁數量，需先將牆壁位置排序。

```typescript
// 排序牆壁以支援二分搜尋
const sortedWalls = new Int32Array(walls).sort();
```

### Step 3：實作下界二分搜尋輔助函數

下界搜尋用於找到第一個不小於目標值的牆壁索引，是後續區間計數的基礎。

```typescript
/**
 * 回傳第一個牆壁位置 >= target 的索引（下界）。
 *
 * @param target - 位置門檻值
 * @return 最小的索引，使得 sortedWalls[index] >= target
 */
const lowerBound = (target: number): number => {
  let low = 0;
  let high = wallCount;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (sortedWalls[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
};
```

### Step 4：實作上界二分搜尋輔助函數

上界搜尋用於找到第一個大於目標值的牆壁索引，兩者相減即可得到區間內的牆壁數量。

```typescript
/**
 * 回傳第一個牆壁位置 > target 的索引（上界）。
 *
 * @param target - 位置門檻值
 * @return 最小的索引，使得 sortedWalls[index] > target
 */
const upperBound = (target: number): number => {
  let low = 0;
  let high = wallCount;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (sortedWalls[middle] <= target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
};
```

### Step 5：實作區間牆壁計數輔助函數

封裝上下界搜尋，提供閉區間 `[lowerPosition, upperPosition]` 內的牆壁數量查詢，並處理無效區間的邊界情況。

```typescript
/**
 * 計算位置落在閉區間 [lowerPosition, upperPosition] 內的牆壁數量。
 *
 * @param lowerPosition - 查詢區間的閉合下界
 * @param upperPosition - 查詢區間的閉合上界
 * @return 位置落在 [lowerPosition, upperPosition] 內的牆壁數量
 */
const countInRange = (lowerPosition: number, upperPosition: number): number => {
  if (lowerPosition > upperPosition) {
    return 0;
  }
  return upperBound(upperPosition) - lowerBound(lowerPosition);
};
```

### Step 6：初始化第一個機器人的動態規劃狀態

對排序後的第一個機器人，其左側沒有相鄰機器人遮擋，向左的射程完整延伸；
向右的射程則在本 Step 僅計入自身位置的牆壁，間隙部分留待後續轉移處理。

```typescript
// 初始化第一個機器人的 DP 狀態
const firstPosition = sortedPositions[0];
const firstDistance = sortedDistances[0];

// 向左開火：覆蓋 [firstPosition - firstDistance, firstPosition]（含兩端）
let dpLeft = countInRange(firstPosition - firstDistance, firstPosition);

// 向右開火：自身位置的牆壁在射程內；更右邊間隙的牆壁在處理間隙時計入
let dpRight = countInRange(firstPosition, firstPosition);
```

### Step 7：掃描相鄰機器人，計算間隙覆蓋並轉移動態規劃狀態

對每對相鄰機器人，計算間隙內各側可覆蓋的牆壁數量及重疊區域，
再依容斥原理合併，得到向左或向右開火時的最佳累計牆壁數，並更新動態規劃狀態。

```typescript
for (let robotIndex = 1; robotIndex < robotCount; robotIndex++) {
  const previousPosition = sortedPositions[robotIndex - 1];
  const previousDistance = sortedDistances[robotIndex - 1];
  const currentPosition  = sortedPositions[robotIndex];
  const currentDistance  = sortedDistances[robotIndex];

  // --- 嚴格位於間隙 (previousPosition, currentPosition) 內的牆壁 ---

  // 前一個機器人向右射入此間隙可覆蓋的牆壁
  const rightReachEnd = previousPosition + previousDistance < currentPosition - 1
    ? previousPosition + previousDistance
    : currentPosition - 1;
  const rightCover = countInRange(previousPosition + 1, rightReachEnd);

  // 當前機器人向左射入此間隙可覆蓋的牆壁
  const leftReachStart = currentPosition - currentDistance > previousPosition + 1
    ? currentPosition - currentDistance
    : previousPosition + 1;
  const leftCover = countInRange(leftReachStart, currentPosition - 1);

  // 兩者皆可覆蓋的重疊區段（容斥原理所需）
  const overlapStart = leftReachStart > previousPosition + 1 ? leftReachStart : previousPosition + 1;
  const overlapEnd   = rightReachEnd  < currentPosition  - 1 ? rightReachEnd  : currentPosition  - 1;
  const overlap = countInRange(overlapStart, overlapEnd);

  // 當前機器人自身位置的牆壁，無論向哪側開火皆可覆蓋
  const wallAtCurrentPosition = countInRange(currentPosition, currentPosition);

  // dpLeft 轉移：當前機器人向左開火
  //   前一個向左開火 → 間隙只由當前左側覆蓋（前一個射程不進入間隙）
  //   前一個向右開火 → 間隙由兩側聯集覆蓋（用容斥原理去除重疊）
  const newDpLeft =
    Math.max(dpLeft  + leftCover, dpRight + rightCover + leftCover - overlap) + wallAtCurrentPosition;

  // dpRight 轉移：當前機器人向右開火（對間隙的貢獻由左側決定）
  //   前一個向左開火 → 當前機器人未覆蓋間隙，貢獻為 0
  //   前一個向右開火 → 間隙由前一個向右覆蓋，貢獻為 rightCover
  const newDpRight = Math.max(dpLeft, dpRight + rightCover) + wallAtCurrentPosition;

  dpLeft  = newDpLeft;
  dpRight = newDpRight;
}
```

### Step 8：補算最後一個機器人向右的無阻礙射程，並回傳最大值

最右側的機器人向右開火時，右方沒有任何機器人遮擋，因此需額外計入其射程內的牆壁，
最終取兩個狀態的最大值作為答案。

```typescript
// 補加最後一個機器人向右開火時，右側無遮擋的牆壁數量
const lastPosition = sortedPositions[robotCount - 1];
const lastDistance = sortedDistances[robotCount - 1];
const rightEdgeWalls = countInRange(lastPosition + 1, lastPosition + lastDistance);

return Math.max(dpLeft, dpRight + rightEdgeWalls);
```

## 時間複雜度

- 排序機器人需要 $O(r \log r)$，其中 $r$ 為機器人數量；
- 排序牆壁需要 $O(w \log w)$，其中 $w$ 為牆壁數量；
- 每次 `countInRange` 呼叫執行兩次二分搜尋，各為 $O(\log w)$；
- 主迴圈對 $r$ 個機器人各執行常數次 `countInRange`，共 $O(r \log w)$；
- 總時間複雜度為 $O((r + w) \log(r + w))$。

> $O((r + w) \log(r + w))$

## 空間複雜度

- 排序索引陣列、排序後位置與射程陣列各佔 $O(r)$；
- 排序後牆壁陣列佔 $O(w)$；
- 動態規劃僅使用常數個額外變數；
- 總空間複雜度為 $O(r + w)$。

> $O(r + w)$
