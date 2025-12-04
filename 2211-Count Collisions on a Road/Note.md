# 2211. Count Collisions on a Road

There are `n` cars on an infinitely long road. 
The cars are numbered from `0` to `n - 1` from left to right and each car is present at a unique point.

You are given a 0-indexed string `directions` of length `n`. 
`directions[i]` can be either `'L'`, `'R'`, or `'S'` denoting whether the $i^{th}$ car is moving towards the left, towards the right, or staying at its current point respectively. 
Each moving car has the same speed.

The number of collisions can be calculated as follows:

- When two cars moving in opposite directions collide with each other, the number of collisions increases by `2`.
- When a moving car collides with a stationary car, the number of collisions increases by `1`.

After a collision, the cars involved can no longer move and will stay at the point where they collided. 
Other than that, cars cannot change their state or direction of motion.

Return the total number of collisions that will happen on the road.

**Constraints:**

- `1 <= directions.length <= 10^5`
- `directions[i]` is either `'L'`, `'R'`, or `'S'`.

## 基礎思路

本題要求計算道路上所有最終會發生的碰撞次數。
每輛車只能朝左、朝右或保持靜止，且碰撞後會立即停止。
為了找出最終的碰撞總數，需要理解哪些車永遠不會與任何人相遇。

可掌握以下核心觀察：

* **只有會移動的車才可能發生碰撞**
  字元 `'L'` 與 `'R'` 表示移動中的車，而 `'S'` 表示靜止，但任何移動車在遇到靜止車時也會造成碰撞。

* **最左側連續的向左車永遠不會碰撞**
  因為它們前方沒有車，向左移動不可能遇到任何物體。

* **最右側連續的向右車永遠不會碰撞**
  因為它們前方也沒有車，向右移動同樣不會遇到任何車。

* **除了上述兩群車之外，所有會動的車最終都會在某處碰撞並停止**
  只要存在 `'R' ... L'` 或 `'R' ... S'` 或 `'L' ... S'` 的關係，就會導致不可避免的碰撞。

* **碰撞次數等於：所有會動的車數量 − 永遠不會碰撞的車數量**
  因為每一輛最終停止的車都必定經歷過至少一次碰撞事件。

基於這些觀察，可透過：

* 計算整體移動車輛數量。
* 計算開頭連續 `'L'` 的車數量。
* 計算結尾連續 `'R'` 的車數量。
* 使用上述公式得到最終碰撞次數。

此方法不需模擬真正的碰撞，只需雙向掃描即可完成，效率極高。

## 解題步驟

### Step 1：針對特殊情況快速結束

若車輛數量為 0 或 1，不可能產生任何碰撞，可立即回傳。

```typescript
// 若車輛不足以發生碰撞，快速返回 0
if (length <= 1) {
  return 0;
}
```

### Step 2：預先取得字元編碼並初始化計數變數

用字元編碼避免重複字串取值成本，並準備計算總移動車輛數、開頭連續 `'L'` 數量與領先段落偵測旗標。

```typescript
// 預先取得字元編碼以提升可讀性與執行效率
const codeL = "L".charCodeAt(0);
const codeR = "R".charCodeAt(0);
const codeS = "S".charCodeAt(0);

let totalMovingCars = 0;
let leadingLeftCount = 0;

// 此旗標用於偵測最前方連續的 'L'
let isLeadingSegment = true;
```

### Step 3：第一次掃描：統計所有移動車與開頭連續 `'L'` 車

逐一檢查每個車輛是否為移動狀態，並在開頭區段持續計算向左的車數量，直到遇到非 `'L'` 即中止領先段落。

```typescript
// 第一次掃描：計算所有移動車與前段連續的 'L'
for (let index = 0; index < length; index++) {
  const directionCode = directions.charCodeAt(index);

  // 計算所有會動的車（'L' 或 'R'）
  if (directionCode !== codeS) {
    totalMovingCars++;
  }

  // 只有最前方連續的 'L' 才會被計入
  if (isLeadingSegment) {
    if (directionCode === codeL) {
      leadingLeftCount++;
    } else {
      // 一旦遇到非 'L'，前段區域結束
      isLeadingSegment = false;
    }
  }
}
```

### Step 4：第二次掃描：計算結尾連續 `'R'` 車

從右側開始倒著掃描，計算最後連續的 `'R'` 數量，一旦遇到非 `'R'` 即停止。

```typescript
// 第二次掃描：計算尾端連續的 'R'
let trailingRightCount = 0;
for (let index = length - 1; index >= 0; index--) {
  const directionCode = directions.charCodeAt(index);

  if (directionCode === codeR) {
    trailingRightCount++;
  } else {
    // 遇到非 'R' 立即停止尾段計算
    break;
  }
}
```

### Step 5：依據不會碰撞的車輛數推算最終碰撞次數

所有中間的移動車都不可避免會碰撞，因此用「總移動車 − 最前段 `'L'` − 最後段 `'R'`」即可得出碰撞數。

```typescript
// 不會碰撞的車包含：最前方連續 'L' 與最後方連續 'R'
// 其餘所有會動的車都會產生碰撞
return totalMovingCars - leadingLeftCount - trailingRightCount;
```

## 時間複雜度

- 需要兩次線性掃描：一次由左至右，一次由右至左。
- 每次判斷皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量變數進行計算。
- 無任何額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
