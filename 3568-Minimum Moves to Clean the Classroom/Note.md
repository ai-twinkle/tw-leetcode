# 3568. Minimum Moves to Clean the Classroom

You are given an `m x n` grid `classroom` where a student volunteer is tasked with cleaning up litter scattered around the room. 
Each cell in the grid is one of the following:

- `'S'`: Starting position of the student
- `'L'`: Litter that must be collected (once collected, the cell becomes empty)
- `'R'`: Reset area that restores the student's energy to full capacity, regardless of their current energy level (can be used multiple times)
- `'X'`: Obstacle the student cannot pass through
- `'.'`: Empty space

You are also given an integer `energy`, representing the student's maximum energy capacity. 
The student starts with this energy from the starting position `'S'`.

Each move to an adjacent cell (up, down, left, or right) costs 1 unit of energy. 
If the energy reaches 0, the student can only continue if they are on a reset area `'R'`, 
which resets the energy to its maximum capacity `energy`.

Return the minimum number of moves required to collect all litter items, or `-1` if it's impossible.

**Constraints:**

- `1 <= m == classroom.length <= 20`
- `1 <= n == classroom[i].length <= 20`
- `classroom[i][j]` is one of `'S'`, `'L'`, `'R'`, `'X'`, or `'.'`
- `1 <= energy <= 50`
- There is exactly one `'S'` in the grid.
- There are at most 10 `'L'` cells in the grid.

## 基礎思路

本題要求在一個含障礙物、重置點與垃圾的網格中，計算收集完所有垃圾所需的最少移動步數。
表面上這是最短路徑問題，但移動受到能量限制，且垃圾的收集狀態會隨路徑改變，因此不能只以座標作為搜尋單位。

在思考解法時，可掌握以下核心觀察：

- **狀態必須同時描述位置、收集進度與剩餘能量**：
  同一個格子在不同的收集進度或不同的剩餘能量下，後續的可達性完全不同，因此三者共同構成搜尋狀態。

- **垃圾數量極少，適合以位元集合表示進度**：
  垃圾最多十個，收集進度可以用一個位元遮罩完整描述，且遮罩全滿即代表任務完成。

- **每步成本相同，適用廣度優先搜尋**：
  由於所有移動的代價一致，逐層擴展即可保證首次抵達目標狀態時的步數為最小值。

- **相同位置與進度下，能量越多者嚴格佔優**：
  廣度優先搜尋的步數是非遞減的，因此在步數不劣的前提下，若某狀態的剩餘能量不高於先前紀錄，其後續能做的事必為子集，可直接捨棄。這讓原本三維的狀態表得以壓縮為「位置 × 進度」兩維，只保留該組合曾出現過的最大能量。

- **重置點使能量恢復而非消耗**：
  踏上重置點時能量直接回滿，因此它是打破能量限制的關鍵樞紐；而在非重置點上能量歸零的狀態已無法再移動，可直接剪除。

依據以上特性，可以採用以下策略：

- **預先將網格攤平為型別化陣列**，把垃圾位元、重置旗標與障礙資訊一次編碼完成。
- **預先建立鄰接表**，讓搜尋主迴圈不必重複做邊界與障礙判斷。
- **以廣度優先搜尋逐層擴展狀態**，並將位置、進度、能量壓縮進單一整數存入佇列。
- **以「位置 × 進度」的最佳能量表進行支配剪枝**，只有能量嚴格更優的狀態才值得入列。
- **在收集到最後一份垃圾的當下立即回傳步數**，若佇列耗盡仍未完成則回傳 `-1`。

## 解題步驟

### Step 1：預先定義位元編碼所需的常數

狀態需被壓縮進單一整數，因此先定義垃圾位元、重置旗標、能量欄位與位置欄位所使用的位寬與遮罩。

```typescript
/** 儲存於格子描述子中的位元旗標，用以標記重置區 'R'。 */
const RESET_AREA_FLAG = 1 << 10;

/** 用以取出格子描述子中垃圾位元的遮罩。 */
const LITTER_BIT_MASK = (1 << 10) - 1;

/** 佇列項目中用來封裝剩餘能量的低位位元數量。 */
const ENERGY_BIT_WIDTH = 6;

/** 用以取出佇列項目中剩餘能量的遮罩。 */
const ENERGY_VALUE_MASK = (1 << ENERGY_BIT_WIDTH) - 1;

/** 佇列項目中用來封裝能量加上格子索引的位元數量。 */
const MASK_SHIFT = 15;

/** 用以取出佇列項目中格子索引的遮罩。 */
const CELL_VALUE_MASK = (1 << (MASK_SHIFT - ENERGY_BIT_WIDTH)) - 1;
```

### Step 2：計算網格尺寸並準備扁平化容器

取得列數與行數後推得格子總數，並配置格子描述子與障礙標記陣列，同時準備記錄起點與垃圾總數。

```typescript
const rowCount = classroom.length;
const columnCount = classroom[0].length;
const cellCount = rowCount * columnCount;

const cellInfo = new Int32Array(cellCount);
const isBlocked = new Uint8Array(cellCount);
let startCell = 0;
let litterCount = 0;
```

### Step 3：掃描網格並將各類格子編碼進型別化陣列

逐格讀取字元代碼：垃圾格分配一個專屬位元以供遮罩使用；重置區寫入重置旗標；障礙物標記為不可通行；起點則記錄其扁平索引。

```typescript
// 將網格一次攤平為型別化陣列：垃圾位元、重置旗標、障礙物。
for (let row = 0; row < rowCount; row++) {
  const rowText = classroom[row];
  const rowBase = row * columnCount;
  for (let column = 0; column < columnCount; column++) {
    const characterCode = rowText.charCodeAt(column);
    const cell = rowBase + column;
    if (characterCode === 76) {
      // 'L'：為此垃圾在收集遮罩中分配專屬的位元。
      cellInfo[cell] = 1 << litterCount;
      litterCount++;
    } else if (characterCode === 82) {
      // 'R'：抵達此處會將能量補滿至最大值。
      cellInfo[cell] = RESET_AREA_FLAG;
    } else if (characterCode === 88) {
      // 'X'：無法通行的障礙物。
      isBlocked[cell] = 1;
    } else if (characterCode === 83) {
      startCell = cell;
    }
  }
}
```

### Step 4：處理不存在垃圾的特例

若網格中沒有任何垃圾，代表任務在原地即已完成，無須移動。

```typescript
if (litterCount === 0) {
  return 0;
}
```

### Step 5：預先建立各格的鄰接表

為避免搜尋主迴圈重複執行邊界檢查與障礙判斷，先以固定步幅四為每個可通行格子記錄其可行鄰居；障礙格本身則直接跳過。

```typescript
// 鄰接關係以固定步幅四預先計算，使內層搜尋迴圈不必重複做
// 邊界檢查或障礙物測試。
const neighborList = new Int16Array(cellCount << 2);
const neighborCount = new Uint8Array(cellCount);
for (let row = 0; row < rowCount; row++) {
  const rowBase = row * columnCount;
  for (let column = 0; column < columnCount; column++) {
    const cell = rowBase + column;
    if (isBlocked[cell] === 1) {
      continue;
    }
    const writeBase = cell << 2;
    let count = 0;
    if (row > 0 && isBlocked[cell - columnCount] === 0) {
      neighborList[writeBase + count] = cell - columnCount;
      count++;
    }
    if (row + 1 < rowCount && isBlocked[cell + columnCount] === 0) {
      neighborList[writeBase + count] = cell + columnCount;
      count++;
    }
    if (column > 0 && isBlocked[cell - 1] === 0) {
      neighborList[writeBase + count] = cell - 1;
      count++;
    }
    if (column + 1 < columnCount && isBlocked[cell + 1] === 0) {
      neighborList[writeBase + count] = cell + 1;
      count++;
    }
    neighborCount[cell] = count;
  }
}
```

### Step 6：建立狀態空間與最佳能量表

由垃圾數量推得遮罩總數與完成條件，並配置「位置 × 進度」的最佳能量表；由於能量為零的狀態永不入列，`0` 可同時兼作「尚未造訪」的標記。

```typescript
const maskCount = 1 << litterCount;
const fullMask = maskCount - 1;
const maximumEnergy = energy;

// bestEnergy[mask * cellCount + cell] 代表該狀態目前所見的最高能量；
// 由於沒有剩餘能量的狀態永遠不會入列，因此 0 同時代表「尚未造訪」。
const bestEnergy = new Uint8Array(cellCount * maskCount);
```

### Step 7：初始化佇列並放入起始狀態

以可動態擴容的環形前進佇列儲存壓縮後的狀態，先記錄起點的滿能量，再將起始狀態編碼入列。

```typescript
// 佇列從小容量開始並在需要時倍增，讓簡單的輸入不必為整個
// 狀態空間大小的緩衝區付出代價。
let queue = new Int32Array(1 << 13);
let head = 0;
let tail = 0;
bestEnergy[startCell] = maximumEnergy;
queue[tail] = (startCell << ENERGY_BIT_WIDTH) | maximumEnergy;
tail++;
```

### Step 8：分層推進並解碼佇列中的狀態

外層迴圈以 `levelEnd` 切出當前層的邊界，每完成一層即代表步數加一；內層取出狀態後解碼出剩餘能量、位置與收集遮罩，並立刻檢查該狀態是否已被同組合但能量更高的紀錄所支配，若是則直接捨棄。

```typescript
let moves = 0;
while (head < tail) {
  const levelEnd = tail;
  moves++;
  while (head < levelEnd) {
    const entry = queue[head];
    head++;
    const remainingEnergy = entry & ENERGY_VALUE_MASK;
    const cell = (entry >> ENERGY_BIT_WIDTH) & CELL_VALUE_MASK;
    const mask = entry >> MASK_SHIFT;
    const maskBase = mask * cellCount;

    // 捨棄已被同一狀態中能量更充足的造訪所取代的項目。
    if (bestEnergy[maskBase + cell] > remainingEnergy) {
      continue;
    }

    // ...
  }
}
```

### Step 9：走訪鄰居並更新垃圾收集遮罩

依鄰接表逐一展開可行鄰居；若該格為尚未收集的垃圾，則將對應位元併入遮罩，並在遮罩恰好全滿時直接回傳當前步數，因為此刻即為最早完成任務的時機。

```typescript
while (head < tail) {
  // Step 8：切出當前層並累加步數

  while (head < levelEnd) {
    // Step 8：解碼佇列項目並排除被支配的狀態

    const energyAfterMove = remainingEnergy - 1;
    const readBase = cell << 2;
    const degree = neighborCount[cell];
    for (let index = 0; index < degree; index++) {
      const nextCell = neighborList[readBase + index];
      const info = cellInfo[nextCell];
      const litterBit = info & LITTER_BIT_MASK;
      let nextMask = mask;
      let nextBase = maskBase;
      if (litterBit !== 0 && (mask & litterBit) === 0) {
        nextMask = mask | litterBit;
        if (nextMask === fullMask) {
          return moves;
        }
        nextBase = nextMask * cellCount;
      }

      // ...
    }
  }
}
```

### Step 10：計算移動後的能量並剪除劣勢狀態

若鄰居為重置區則能量回滿，否則扣除一單位；能量歸零且非重置區的狀態已無法再移動，直接略過。接著比對最佳能量表，只有能量嚴格更優者才值得繼續，並即時更新紀錄。

```typescript
while (head < tail) {
  // Step 8：切出當前層並累加步數

  while (head < levelEnd) {
    // Step 8：解碼佇列項目並排除被支配的狀態

    for (let index = 0; index < degree; index++) {
      // Step 9：取出鄰居並更新垃圾收集遮罩

      const nextEnergy = (info & RESET_AREA_FLAG) !== 0 ? maximumEnergy : energyAfterMove;
      // 在非重置格上沒有能量的狀態永遠無法再移動。
      if (nextEnergy === 0) {
        continue;
      }
      const stateKey = nextBase + nextCell;
      if (bestEnergy[stateKey] >= nextEnergy) {
        continue;
      }
      bestEnergy[stateKey] = nextEnergy;

      // ...
    }
  }
}
```

### Step 11：必要時擴充佇列並推入新狀態

當佇列已滿時將容量倍增並搬移既有內容，隨後把遮罩、位置與能量壓縮成單一整數寫入佇列尾端。

```typescript
while (head < tail) {
  // Step 8：切出當前層並累加步數

  while (head < levelEnd) {
    // Step 8：解碼佇列項目並排除被支配的狀態

    for (let index = 0; index < degree; index++) {
      // Step 9：取出鄰居並更新垃圾收集遮罩

      // Step 10：計算移動後能量並剪除劣勢狀態

      if (tail === queue.length) {
        const expandedQueue = new Int32Array(queue.length << 1);
        expandedQueue.set(queue);
        queue = expandedQueue;
      }
      queue[tail] = (nextMask << MASK_SHIFT) | (nextCell << ENERGY_BIT_WIDTH) | nextEnergy;
      tail++;
    }
  }
}
```

### Step 12：搜尋耗盡後回報無解

若佇列已清空仍未湊齊完整遮罩，代表在能量限制下無法收集所有垃圾。

```typescript
return -1;
```

## 時間複雜度

- 扁平化網格與建立鄰接表各需一次線性掃描，為 $O(mn)$；
- 狀態由「位置 × 收集遮罩」構成，共 $O(mn \cdot 2^L)$ 種組合，其中 $L$ 為垃圾數量；
- 每種組合僅在剩餘能量嚴格提升時才入列，故最多入列 $e$ 次（$e$ 為最大能量）；
- 每次出列固定展開至多四個鄰居，皆為常數時間；
- 總時間複雜度為 $O(mn \cdot 2^L \cdot e)$。

> $O(mn \cdot 2^L \cdot e)$

## 空間複雜度

- 鄰接表與格子描述子皆為 $O(mn)$；
- 最佳能量表大小為 $O(mn \cdot 2^L)$；
- 佇列容量隨入列總數倍增，上界為 $O(mn \cdot 2^L \cdot e)$；
- 總空間複雜度為 $O(mn \cdot 2^L \cdot e)$。

> $O(mn \cdot 2^L \cdot e)$
