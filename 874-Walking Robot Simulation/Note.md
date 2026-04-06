# 874. Walking Robot Simulation

A robot on an infinite XY-plane starts at point `(0, 0)` facing north. 
The robot receives an array of integers `commands`, which represents a sequence of moves that it needs to execute. 
There are only three possible types of instructions the robot can receive:

- `-2`: Turn left `90` degrees.
- `-1`: Turn right `90` degrees.
- `1 <= k <= 9`: Move forward `k` units, one unit at a time.

Some of the grid squares are `obstacles`. 
The $i^{th}$ obstacle is at grid point `obstacles[i] = (x_i, y_i)`. 
If the robot runs into an obstacle, it will stay in its current location 
(on the block adjacent to the obstacle) and move onto the next command.

Return the maximum squared Euclidean distance that the robot reaches at any point in its path 
(i.e. if the distance is `5`, return `25`).

**Note:**

- There can be an obstacle at `(0, 0)`. 
  If this happens, the robot will ignore the obstacle until it has moved off the origin. 
  However, it will be unable to return to `(0, 0)` due to the obstacle.
- North means `+Y` direction.
- East means `+X` direction.
- South means `-Y` direction.
- West means `-X` direction.

**Constraints:**

- `1 <= commands.length <= 10^4`
- `commands[i]` is either `-2`, `-1`, or an integer in the range `[1, 9]`.
- `0 <= obstacles.length <= 10^4`
- `-3 * 10^4 <= x_i, y_i <= 3 * 10^4`
- The answer is guaranteed to be less than `2^31`.

## 基礎思路

本題要求模擬一個在無限平面上移動的機器人，並追蹤其與原點的最大平方歐幾里德距離。機器人可以轉向或向前移動，而前進時可能遭遇障礙物阻擋，需停在障礙物前一格。

在思考解法時，可掌握以下核心觀察：

- **方向狀態可以用整數循環表示**：
  機器人只有四個方向，向左轉等同於方向索引減一（模四），向右轉等同於加一（模四），可以用位元運算高效處理。

- **障礙物查詢須為常數時間**：
  每一步前進都需要確認目標格是否為障礙物，若以線性掃描查找，總複雜度將無法接受；必須使用雜湊集合達到 $O(1)$ 查詢。

- **二維座標可編碼為單一整數鍵值**：
  座標範圍已知且有界，可透過偏移量將負座標映射到非負空間，再以線性編碼將二維座標壓縮成一個整數，避免字串拼接帶來的效能損耗。

- **最大距離必須在每一步移動後即時更新**：
  機器人不一定在終點達到最遠位置，任何中間位置都可能是最大值，因此需要在每次成功移動後立即比較並記錄。

依據以上特性，可以採用以下策略：

- **預先將所有障礙物座標打包為整數鍵值，存入雜湊集合**，以便在模擬過程中進行 $O(1)$ 的障礙物判斷。
- **以方向索引搭配預計算的方向差量陣列處理轉向與前進**，使方向切換僅需一次加法與位元遮罩。
- **逐步模擬每一條指令**，每次前進一格前先檢查是否有障礙物，確認安全後才更新位置並比較最大距離。

此策略能以線性時間完成整個模擬，並在每一步正確處理障礙物與最大距離的更新。

## 解題步驟

### Step 1：將障礙物座標編碼為整數鍵值並存入雜湊集合

由於每一步前進都需要查詢目標格是否有障礙物，需要 $O(1)$ 的查詢效率。
透過座標偏移量將二維座標壓縮成單一整數，再統一存入集合，即可在後續模擬中高效判斷。

```typescript
// 將每個障礙物打包成單一整數鍵值以便 O(1) 查詢
const obstacleSet = new Set<number>();
for (const obstacle of obstacles) {
  const packedKey = (obstacle[0] + COORDINATE_OFFSET) * COORDINATE_RANGE
    + (obstacle[1] + COORDINATE_OFFSET);
  obstacleSet.add(packedKey);
}
```

### Step 2：初始化機器人狀態

機器人從原點出發，初始朝向正北（方向索引為 0），並將目前記錄的最大平方距離初始化為 0。

```typescript
let currentX = 0;
let currentY = 0;
// 0 = 北, 1 = 東, 2 = 南, 3 = 西
let directionIndex = 0;
let maximumSquaredDistance = 0;
```

### Step 3：依指令類型處理轉向

逐一遍歷每條指令，若指令為 `-2`，則向左轉（方向索引加 3 模 4）；若指令為 `-1`，則向右轉（方向索引加 1 模 4）。
兩者皆使用位元遮罩取代模運算以提升效率。

```typescript
for (const command of commands) {
  if (command === -2) {
    // 向左轉：北→西→南→東→北
    directionIndex = (directionIndex + 3) & 3;
  } else if (command === -1) {
    // 向右轉：北→東→南→西→北
    directionIndex = (directionIndex + 1) & 3;
  } else {
    // ...
  }
}
```

### Step 4：取出當前方向的移動差量，並逐步嘗試前進

指令為正整數時，先從預計算陣列中讀出當前方向對應的 X 與 Y 差量，
再對每一步計算目標格座標並打包為整數鍵值，準備進行障礙物查詢。

```typescript
for (const command of commands) {
  // Step 3：處理轉向指令

  } else {
    const stepDeltaX = DIRECTION_DELTA_X[directionIndex];
    const stepDeltaY = DIRECTION_DELTA_Y[directionIndex];

    // 逐步前進，遇到障礙物時停止
    for (let step = 0; step < command; step++) {
      const nextX = currentX + stepDeltaX;
      const nextY = currentY + stepDeltaY;
      const packedNext = (nextX + COORDINATE_OFFSET) * COORDINATE_RANGE
        + (nextY + COORDINATE_OFFSET);

      // ...
    }
  }
}
```

### Step 5：遇到障礙物時中止本次移動，否則更新位置並記錄最大距離

若目標格為障礙物，則立即跳出此指令的逐步迴圈；
若安全，則移動至目標格，並在每次成功移動後即時計算平方距離並與目前最大值比較。

```typescript
for (const command of commands) {
  // Step 3：處理轉向指令

  } else {
    // Step 4：取出方向差量並計算目標格

    for (let step = 0; step < command; step++) {
      // Step 4：計算目標格座標與打包鍵值

      if (obstacleSet.has(packedNext)) {
        break;
      }

      currentX = nextX;
      currentY = nextY;

      const squaredDistance = currentX * currentX + currentY * currentY;
      maximumSquaredDistance = squaredDistance > maximumSquaredDistance
        ? squaredDistance
        : maximumSquaredDistance;
    }
  }
}
```

### Step 6：回傳所有位置中的最大平方距離

所有指令處理完畢後，直接回傳記錄的最大平方歐幾里德距離。

```typescript
return maximumSquaredDistance;
```

## 時間複雜度

- 預處理障礙物：遍歷所有障礙物一次，共 $O(p)$（$p$ 為障礙物數量）；
- 模擬指令：外層遍歷所有指令，共 $O(c)$（$c$ 為指令數量）；每條移動指令最多前進 9 步，每步進行 $O(1)$ 的障礙物查詢與距離更新，合計 $O(9c) = O(c)$；
- 總時間複雜度為 $O(p + c)$。

> $O(p + c)$

## 空間複雜度

- 障礙物集合儲存所有障礙物的整數鍵值，佔用 $O(p)$ 空間；
- 其餘變數（座標、方向索引、最大距離）均為常數空間；
- 總空間複雜度為 $O(p)$。

> $O(p)$
