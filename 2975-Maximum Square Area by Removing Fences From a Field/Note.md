# 2975. Maximum Square Area by Removing Fences From a Field

There is a large `(m - 1) x (n - 1)` rectangular field with corners at `(1, 1)` and `(m, n)` 
containing some horizontal and vertical fences given in arrays hFences and vFences respectively.

Horizontal fences are from the coordinates `(hFences[i], 1)` to `(hFences[i], n)` 
and vertical fences are from the coordinates `(1, vFences[i])` to `(m, vFences[i])`.

Return the maximum area of a square field that can be formed by removing some fences (possibly none) or `-1` 
if it is impossible to make a square field.

Since the answer may be large, return it modulo `10^9 + 7`.

Note: The field is surrounded by two horizontal fences from the coordinates `(1, 1)` to `(1, n)` and `(m, 1)` to `(m, n)` 
and two vertical fences from the coordinates `(1, 1)` to `(m, 1)` and `(1, n)` to `(m, n)`. 
These fences cannot be removed.

**Constraints:**

- `3 <= m, n <= 10^9`
- `1 <= hFences.length, vFences.length <= 600`
- `1 < hFences[i] < m`
- `1 < vFences[i] < n`
- `hFences` and `vFences` are unique.

## 基礎思路

本題給定水平/垂直柵欄位置，允許移除部分柵欄後，在大矩形場地內形成若干子矩形區塊。我們要找能形成的**最大正方形面積**（邊長相同），若無法形成任何正方形則回傳 `-1`，答案需取模。

關鍵觀察如下：

* **移除柵欄的效果**：若選定兩條水平柵欄（包含外框邊界）作為上下界，其間距即為可形成的高度；同理兩條垂直柵欄的間距可形成寬度。移除中間柵欄可以讓區域合併，因此可形成的高度/寬度其實就是「任意兩條柵欄位置的差」。
* **正方形條件**：存在某個長度 `L`，使得 `L` 同時是「某兩條水平柵欄距離」與「某兩條垂直柵欄距離」。最大正方形邊長就是兩邊距離集合的最大交集元素。
* **規模限制**：`m,n` 可達 `1e9`，但可移除柵欄數量最多各 600，因此我們應在「柵欄座標數量」上做處理：把座標排序後，枚舉兩兩差值即可得到所有可用邊長候選。
* **效率策略**：

    * 將其中一邊（水平或垂直）所有兩兩距離先存成集合，另一邊再掃描距離並找最大匹配。
    * 由於距離數量是二次方，選擇**距離較少的一邊**建集合能降低記憶體與建表成本。
    * 掃描另一邊距離時可由大到小嘗試，搭配剪枝提早停止。

## 解題步驟

### Step 1：`Int32HashSet` — 欄位宣告

以開放定址（線性探測）實作整數集合，用來存「距離長度」。並用 `0` 作為空槽標記，因此只存**正整數**距離。

```typescript
class Int32HashSet {
  private readonly table: Int32Array;
  private readonly mask: number;

  // ...
}
```

### Step 2：`constructor` — 初始化 hash table（容量取 2 倍並上調至 2 的冪次）

為降低碰撞與探測成本，將容量設計為負載因子 ≤ 0.5，並用 2 的冪次容量搭配 bitmask 取代取模。

```typescript
class Int32HashSet {
  private readonly table: Int32Array;
  private readonly mask: number;

  /**
   * 使用線性探測（open addressing）的 Int32HashSet 建構子。
   * 注意：值 0 保留作為空槽標記，因此只能存正整數。
   * @param expectedItems - 預期要儲存的正整數唯一值數量。
   */
  public constructor(expectedItems: number) {
    // 選擇容量以讓負載因子 <= 0.5，降低探測成本
    let capacity = expectedItems * 2 + 1;

    // 向上補齊到 2 的冪次容量，用 bitmask 取代 modulo
    capacity--;
    capacity |= capacity >>> 1;
    capacity |= capacity >>> 2;
    capacity |= capacity >>> 4;
    capacity |= capacity >>> 8;
    capacity |= capacity >>> 16;
    capacity++;

    this.table = new Int32Array(capacity);
    this.mask = capacity - 1;
  }

  // ...
}
```

### Step 3：`add` — 插入距離（線性探測）

用乘法雜湊將值打散，若遇到碰撞則線性往後探測，直到找到空槽或已存在相同值。

```typescript
class Int32HashSet {
  // Step 1：欄位宣告

  // Step 2：constructor — 初始化 hash table

  /**
   * 將正整數加入集合。
   * @param value - 要加入的正整數（必須 > 0）。
   */
  public add(value: number): void {
    // 乘法雜湊讓連續整數在 2 的冪次表中分佈較均勻
    let slot = (Math.imul(value, 0x9e3779b1) >>> 0) & this.mask;

    while (true) {
      const stored = this.table[slot];

      if (stored === 0) {
        // 空槽表示不存在，可在此插入
        this.table[slot] = value;
        return;
      }

      if (stored === value) {
        // 已存在相同值，無需重複插入
        return;
      }

      // 線性探測處理碰撞
      slot = (slot + 1) & this.mask;
    }
  }

  // ...
}
```

### Step 4：`has` — 查詢距離是否存在（與 add 同樣探測序列）

以相同雜湊與探測方式查找：遇到空槽可直接判定不存在；命中則回傳存在。

```typescript
class Int32HashSet {
  // Step 1：欄位宣告

  // Step 2：constructor — 初始化 hash table

  // Step 3：add — 插入距離

  /**
   * 檢查集合中是否存在某正整數。
   * @param value - 要查詢的正整數（必須 > 0）。
   * @returns 存在回傳 true，否則 false。
   */
  public has(value: number): boolean {
    // 使用與 add() 相同的雜湊與探測序列
    let slot = (Math.imul(value, 0x9e3779b1) >>> 0) & this.mask;

    while (true) {
      const stored = this.table[slot];

      if (stored === 0) {
        // 空槽表示從未插入
        return false;
      }

      if (stored === value) {
        // 命中即存在
        return true;
      }

      // 持續探測直到遇到空槽
      slot = (slot + 1) & this.mask;
    }
  }
}
```

### Step 5：`buildSortedPositions` — 補上外框邊界並排序

水平/垂直柵欄都必須包含不可移除的外框邊界（1 與 border），加入後排序，便於後續兩兩差值的枚舉。

```typescript
/**
 * 建立包含兩側固定邊界（1 與 border）的排序後柵欄座標。
 * @param fences - 可移除柵欄座標。
 * @param border - 固定外框邊界（水平用 m，垂直用 n）。
 * @returns 含邊界的排序後座標。
 */
function buildSortedPositions(fences: number[], border: number): Int32Array {
  const positions = new Int32Array(fences.length + 2);

  // 插入兩條不可移除的外框邊界
  positions[0] = 1;
  positions[positions.length - 1] = border;

  // 將可移除柵欄填入中間
  for (let index = 0; index < fences.length; index++) {
    positions[index + 1] = fences[index];
  }

  // 排序可讓 O(k^2) 差值枚舉具備更好的連續存取特性
  positions.sort();
  return positions;
}
```

### Step 6：`maximizeSquareArea` — 建立座標、選較小一邊建立距離集合

先建立水平/垂直座標陣列並計算兩兩距離數，選距離較少的一邊建集合，以降低記憶體與建表時間。

```typescript
/**
 * @param m - 場地高度邊界。
 * @param n - 場地寬度邊界。
 * @param hFences - 可移除水平柵欄座標。
 * @param vFences - 可移除垂直柵欄座標。
 * @returns 最大正方形面積（取模 1e9+7），若不可能則回傳 -1。
 */
function maximizeSquareArea(m: number, n: number, hFences: number[], vFences: number[]): number {
  const horizontalPositions = buildSortedPositions(hFences, m);
  const verticalPositions = buildSortedPositions(vFences, n);

  const horizontalCount = horizontalPositions.length;
  const verticalCount = verticalPositions.length;

  // 計算兩兩配對數量，用來決定哪一邊用來建立距離集合
  const horizontalPairs = (horizontalCount * (horizontalCount - 1)) / 2;
  const verticalPairs = (verticalCount * (verticalCount - 1)) / 2;

  let basePositions: Int32Array;
  let scanPositions: Int32Array;

  // 選擇配對數較小的一邊建立距離集合，以降低記憶體與建表成本
  if (horizontalPairs <= verticalPairs) {
    basePositions = horizontalPositions;
    scanPositions = verticalPositions;
  } else {
    basePositions = verticalPositions;
    scanPositions = horizontalPositions;
  }

  const baseCount = basePositions.length;
  const expectedDistanceItems = (baseCount * (baseCount - 1)) / 2;
  const distanceSet = new Int32HashSet(expectedDistanceItems);

  // ...
}
```

### Step 7：預先枚舉 basePositions 的所有兩兩距離並加入集合

這一步把「可形成的邊長」先存入集合，供另一邊掃描時快速查交集。

```typescript
function maximizeSquareArea(m: number, n: number, hFences: number[], vFences: number[]): number {
  // Step 6：建立座標、選較小一邊建立距離集合

  // 預先計算較小一邊所有可形成的線段長度
  for (let leftIndex = 0; leftIndex < baseCount - 1; leftIndex++) {
    const leftValue = basePositions[leftIndex];

    for (let rightIndex = leftIndex + 1; rightIndex < baseCount; rightIndex++) {
      distanceSet.add(basePositions[rightIndex] - leftValue);
    }
  }

  // ...
}
```

### Step 8：掃描另一邊的距離並找最大交集（保留最外層迴圈 + 省略標記）

外層固定左端點 `leftIndex`，先用「最大可能距離」做剪枝；內層由右往左掃描距離，第一個命中的距離即為該 leftIndex 的最佳解。

```typescript
function maximizeSquareArea(m: number, n: number, hFences: number[], vFences: number[]): number {
  // Step 6：建立座標、選較小一邊建立距離集合

  // Step 7：預先枚舉 basePositions 的所有兩兩距離並加入集合

  let maximumSideLength = 0;
  const scanLastIndex = scanPositions.length - 1;

  for (let leftIndex = 0; leftIndex < scanLastIndex; leftIndex++) {
    const leftValue = scanPositions[leftIndex];

    // Step 8：先做剪枝，若此 leftIndex 的最大可能距離都無法超過最佳解，後續也不可能超過
    const maximumPossibleForLeft = scanPositions[scanLastIndex] - leftValue;
    if (maximumPossibleForLeft <= maximumSideLength) {
      break;
    }

    // Step 9：由大到小掃描右端點，遇到第一個命中即更新最佳邊長
    for (let rightIndex = scanLastIndex; rightIndex > leftIndex; rightIndex--) {
      const distance = scanPositions[rightIndex] - leftValue;

      // 若距離已不可能改善，較小 rightIndex 只會更小，直接停止
      if (distance <= maximumSideLength) {
        break;
      }

      if (distanceSet.has(distance)) {
        maximumSideLength = distance;
        break;
      }
    }
  }

  // ...
}
```

### Step 9：處理無解情況與面積取模回傳

若最大邊長仍為 0，代表兩邊距離集合無交集，無法形成正方形；否則以 BigInt 安全平方後取模回傳。

```typescript
function maximizeSquareArea(m: number, n: number, hFences: number[], vFences: number[]): number {
  // Step 6：建立座標、選較小一邊建立距離集合

  // Step 7：預先枚舉 basePositions 的所有兩兩距離並加入集合

  // Step 8：掃描另一邊的距離並找最大交集

  if (maximumSideLength === 0) {
    return -1;
  }

  // 使用 BigInt 避免最大邊長平方（可達 1e18）溢位
  const side = BigInt(maximumSideLength);
  return Number((side * side) % 1000000007n);
}
```

## 時間複雜度

- 令 `a = hFences.length + 2`、`b = vFences.length + 2`（含外框邊界後的水平/垂直座標數），並令 `k = min(a, b)`、`t = max(a, b)`。
- 排序兩組座標：`buildSortedPositions` 內部排序各一次，時間為 $O(a \log a + b \log b)$。
- 建立距離集合：枚舉較小一邊所有兩兩距離共有 $\frac{k(k-1)}{2} = O(k^2)$ 次 `add`；由於開放定址線性探測在**最壞情況**下一次 `add` 可能退化到掃描整張表（表中項目量級為 $O(k^2)$），因此此段最壞為 $O(k^2) \cdot O(k^2) = O(k^4)$。
- 掃描另一邊找最大交集：外層/內層最壞形成 $O(t^2)$ 次距離檢查；每次 `has` 在**最壞情況**同樣可能退化到 $O(k^2)$ 探測，因此此段最壞為 $O(t^2 \cdot k^2)$。
- 總時間複雜度為 $O(a \log a + b \log b + k^4 + t^2 k^2)$。

> $O(a \log a + b \log b + k^4 + t^2 k^2)$

## 空間複雜度

- 水平/垂直座標陣列：分別為 $O(a)$ 與 $O(b)$。
- 距離集合的 hash table：最多儲存 $\frac{k(k-1)}{2} = O(k^2)$ 個距離，表容量亦為同量級，因此為 $O(k^2)$。
- 其餘變數皆為常數級。
- 總空間複雜度為 $O(a + b + k^2)$。

> $O(a + b + k^2)$

