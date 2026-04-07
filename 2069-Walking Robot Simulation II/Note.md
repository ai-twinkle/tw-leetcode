# 2069. Walking Robot Simulation II

A `width x height` grid is on an XY-plane with the bottom-left cell at `(0, 0)` 
and the top-right cell at `(width - 1, height - 1)`. 
The grid is aligned with the four cardinal directions (`"North"`, `"East"`, `"South"`, and `"West"`). 
A robot is initially at cell `(0, 0)` facing direction `"East"`.

The robot can be instructed to move for a specific number of steps. For each step, it does the following.

1. Attempts to move forward one cell in the direction it is facing.
2. If the cell the robot is moving to is out of bounds, the robot instead turns 90 degrees counterclockwise and retries the step.

After the robot finishes moving the number of steps required, it stops and awaits the next instruction.

Implement the Robot class:

- `Robot(int width, int height)` Initializes the `width x height` grid with the robot at `(0, 0)` facing `"East"`.
- `void step(int num)` Instructs the robot to move forward `num` steps.
- `int[] getPos()` Returns the current cell the robot is at, as an array of length 2, `[x, y]`.
- `String getDir()` Returns the current direction of the robot, `"North"`, `"East"`, `"South"`, or `"West"`.

**Constraints:**

- `2 <= width, height <= 100`
- `1 <= num <= 10^5`
- At most `10^4` calls in total will be made to `step`, `getPos`, and `getDir`.

## 基礎思路

本題要求模擬一個在有界方格上沿邊界繞行的機器人，每次遇到邊界便逆時針轉向再繼續前進。核心挑戰在於，步數最多達 $10^5$，且查詢次數最多達 $10^4$ 次，若每次 `step` 都真實模擬移動，累積時間成本將不可接受。

在思考解法時，可掌握以下核心觀察：

- **機器人的移動軌跡是封閉循環**：
  在有界方格上，機器人只會沿四條邊行走，整個路徑恰好構成一條週長為 $2 \times (w + h - 2)$ 的封閉迴路，因此位置具有週期性。

- **位置與方向可預先建表**：
  迴路上的每個點都對應唯一的座標與朝向，可在初始化時一次性將所有點的 $(x, y)$ 與方向預先計算並存入查找表，之後每次查詢只需 $O(1)$。

- **步數累加可用模運算折疊**：
  由於路徑是週期性的，累積步數只需對週長取模，即可在常數時間內完成移動。

- **起點 `(0, 0)` 的方向需要特殊處理**：
  機器人初始位於位置索引 0，朝向 East；但繞行一圈回到索引 0 時，實際朝向應為 South（即下一步將繼續沿左邊界往下）。因此需以 `hasMoved` 旗標區分「尚未移動的初始狀態」與「繞圈後回到原點」兩種情況。

- **迴路的分段建構需確保無縫銜接**：
  四條邊需按照繞行方向依序建構，且角落只能歸屬於其中一段，以避免重複計算週長。

依據以上特性，可以採用以下策略：

- **在建構子中一次性預建四段邊界的查找表**，涵蓋迴路上每個位置的座標與方向。
- **`step` 方法只更新一個位置索引並對週長取模**，不做任何實際移動模擬。
- **`getPos` 與 `getDir` 直接查表回傳**，並對起點的特殊方向加以修正。

此策略將每次 `step`、`getPos`、`getDir` 的時間複雜度均壓縮至 $O(1)$，總體效率極佳。

## 解題步驟

### Step 1：預先宣告方向名稱常數陣列

在模組層級建立方向名稱的常數陣列，以方向索引作為鍵值，避免在每次查詢時重新建構字串。

```typescript
const DIRECTION_NAMES: readonly string[] = ['East', 'North', 'West', 'South'];
```

### Step 2：計算週長並初始化位置狀態與查找表

計算出方格邊界的週長，初始化當前位置索引與是否已移動的旗標，並分配三張查找表，分別對應每個邊界位置的 $x$ 座標、$y$ 座標與方向索引。

```typescript
class Robot {
  /**
   * @param width  格寬（2 ≤ width ≤ 100）
   * @param height 格高（2 ≤ height ≤ 100）
   */
  constructor(width: number, height: number) {
    const perimeter = 2 * (width + height - 2);
    this.perimeter = perimeter;
    this.pos = 0;
    this.hasMoved = false;

    this.lookupX = new Int16Array(perimeter);
    this.lookupY = new Int16Array(perimeter);
    this.lookupDir = new Uint8Array(perimeter);

    // ...
  }
}
```

### Step 3：建構底部邊（East 段）的查找表

沿底部邊從左至右填入每個位置的座標與方向，共 `width` 個點，方向均為 East（索引 0）。

```typescript
class Robot {
  constructor(width: number, height: number) {
    // Step 2：計算週長、初始化位置與查找表

    // 第 1 段：底部邊，朝 East（y=0，x：0→width-1），長度 = width
    for (let x = 0; x < width; x++) {
      this.lookupX[x] = x;
      this.lookupY[x] = 0;
      this.lookupDir[x] = 0; // East
    }

    // ...
  }
}
```

### Step 4：建構右側邊（North 段）的查找表

沿右側邊從下往上填入，共 `height - 1` 個點（不含底部角落，因為已屬第 1 段），方向均為 North（索引 1）。

```typescript
class Robot {
  constructor(width: number, height: number) {
    // Step 2：計算週長、初始化位置與查找表

    // Step 3：建構底部邊

    // 第 2 段：右側邊，朝 North（x=width-1，y：1→height-1），長度 = height-1
    for (let i = 0; i < height - 1; i++) {
      const index = width + i;
      this.lookupX[index] = width - 1;
      this.lookupY[index] = 1 + i;
      this.lookupDir[index] = 1; // North
    }

    // ...
  }
}
```

### Step 5：建構頂部邊（West 段）的查找表

沿頂部邊從右往左填入，共 `width - 1` 個點（不含右上角，因為已屬第 2 段），方向均為 West（索引 2）；其中最後一個點為左上角 `[0, height-1]`，仍屬此段。

```typescript
class Robot {
  constructor(width: number, height: number) {
    // Step 2：計算週長、初始化位置與查找表

    // Step 3：建構底部邊

    // Step 4：建構右側邊

    // 第 3 段：頂部邊，朝 West（y=height-1，x：width-2→0），長度 = width-1
    // 左上角 [0, height-1] 是此段最後一個格（仍朝 West）
    const topEdgeStart = width + height - 1;
    for (let i = 0; i < width - 1; i++) {
      const index = topEdgeStart + i;
      this.lookupX[index] = width - 2 - i;
      this.lookupY[index] = height - 1;
      this.lookupDir[index] = 2; // West
    }

    // ...
  }
}
```

### Step 6：建構左側邊（South 段）的查找表

沿左側邊從上往下填入，共 `height - 2` 個點（不含左上角，因已屬第 3 段；也不含左下角 `[0, 0]`，因為它由起點的 East 狀態或 `hasMoved` 的 South 狀態管理），方向均為 South（索引 3）。

```typescript
class Robot {
  constructor(width: number, height: number) {
    // Step 2：計算週長、初始化位置與查找表

    // Step 3：建構底部邊

    // Step 4：建構右側邊

    // Step 5：建構頂部邊

    // 第 4 段：左側邊，朝 South（x=0，y：height-2→1），長度 = height-2
    // 不含 [0, height-1]（屬 West 段）也不含 [0, 0]（屬 East/South 的特殊起點）
    const leftEdgeStart = 2 * width + height - 2;
    for (let i = 0; i < height - 2; i++) {
      const index = leftEdgeStart + i;
      this.lookupX[index] = 0;
      this.lookupY[index] = height - 2 - i;
      this.lookupDir[index] = 3; // South
    }
  }
}
```

### Step 7：實作 `step` 方法——以模運算折疊步數

標記機器人已移動，並將累積步數對週長取模，更新至位置索引，整個操作為 $O(1)$。

```typescript
class Robot {
  // Step 2 ~ Step 6：建構查找表

  /**
   * @param num 前進步數
   */
  step(num: number): void {
    this.hasMoved = true;
    this.pos = (this.pos + num) % this.perimeter;
  }
}
```

### Step 8：實作 `getPos` 方法——查表回傳座標

直接查找對應索引的 $x$、$y$ 值並組成陣列回傳，無需任何運算。

```typescript
class Robot {
  // Step 2 ~ Step 6：建構查找表

  // Step 7：step 方法

  /**
   * @return 機器人目前的 [x, y] 位置
   */
  getPos(): number[] {
    return [this.lookupX[this.pos], this.lookupY[this.pos]];
  }
}
```

### Step 9：實作 `getDir` 方法——查表並處理起點特殊情況

若當前索引為 0 且已移動過，代表機器人是繞圈後回到原點，此時方向應為 South；否則直接查表回傳方向名稱。

```typescript
class Robot {
  // Step 2 ~ Step 6：建構查找表

  // Step 7：step 方法

  // Step 8：getPos 方法

  /**
   * @return 機器人目前朝向的方向
   */
  getDir(): string {
    // 若繞行一整圈後回到索引 0，機器人朝向應為 South
    if (this.pos === 0 && this.hasMoved) {
      return 'South';
    }

    return DIRECTION_NAMES[this.lookupDir[this.pos]];
  }
}
```

## 時間複雜度

- 建構子預建四段查找表，共迭代 $2 \times (w + h - 2)$ 次，即 $O(w + h)$；
- `step`、`getPos`、`getDir` 各執行常數次操作，均為 $O(1)$；
- 設 $q$ 為總呼叫次數，整體時間為 $O(w + h + q)$。
- 總時間複雜度為 $O(w + h + q)$。

> $O(w + h + q)$

## 空間複雜度

- 三張查找表各佔 $O(w + h)$ 空間；
- 其餘僅為常數個純量變數。
- 總空間複雜度為 $O(w + h)$。

> $O(w + h)$
