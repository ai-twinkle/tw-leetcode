# 1622. Fancy Sequence

Write an API that generates fancy sequences using the `append`, `addAll`, and `multAll` operations.

Implement the `Fancy` class:

- `Fancy()` Initializes the object with an empty sequence.
- `void append(val)` Appends an integer `val` to the end of the sequence.
- `void addAll(inc)` Increments all existing values in the sequence by an integer `inc`.
- `void multAll(m)` Multiplies all existing values in the sequence by an integer `m`.
- `int getIndex(idx)` Gets the current value at index `idx` (0-indexed) of the sequence modulo `10^9 + 7`. 
   If the index is greater or equal than the length of the sequence, return `-1`.

**Constraints:**

- `1 <= val, inc, m <= 100`
- `0 <= idx <= 10^5`
- At most `10^5` calls total will be made to `append`, `addAll`, `multAll`, and `getIndex`.

## 基礎思路

本題需要維護一個可被多次整體加值、整體乘值、尾端插入新值的序列，並支援查詢任意位置在當前所有操作作用後的結果。若每次整體操作都直接更新整個序列，單次操作成本會過高，無法在呼叫次數上限內完成。

在思考解法時，可掌握以下核心觀察：

* **整體加值與整體乘值可視為同一個線性轉換**：
  對所有元素反覆施加操作後，每個仍需區分的元素，本質上都可表示為某個初始值經過同一組整體轉換後的結果。

* **新插入的元素只會受到插入之後的操作影響**：
  因此不需要在插入時回頭修改舊資料，只要把它換算到目前的標準化空間中保存即可。

* **查詢時再套用目前轉換即可還原實際值**：
  若每個元素儲存的是被逆向還原後的基準值，那麼查詢某個索引時，只需重新套用當前整體轉換，就能得到答案。

* **乘以 0 會讓舊資料失去個別差異**：
  一旦對整個序列乘以 0，當下所有既有元素都會變成相同值；此後可把它們視為同一批舊世代資料，而後續新插入元素則進入新的世代重新記錄。

* **模數下的反向乘法需要依賴模反元素**：
  為了在插入時把值映回標準化空間，需要消除目前累積的乘法效果，因此可預先計算可用乘數的模反元素，加速後續處理。

依據以上特性，可以採用以下策略：

* **用一組全域參數描述目前整體的線性轉換狀態**。
* **插入新值時，將其逆向映射回標準化空間後再存入陣列**。
* **查詢時，依索引所在世代決定是直接回傳共同值，或將標準化值還原成最終值**。
* **當遇到乘以 0 時，直接切分世代，讓舊資料不再逐一保存個別結果**。

此策略可以避免對整個序列進行反覆批次更新，讓所有操作都維持高效率。

## 解題步驟

### Step 1：定義模數、容量上限與乘法反元素表

先建立整體運算所需的常數，包含模數、最大操作數量，以及保存小範圍乘數模反元素的陣列，供後續快速查表使用。

```typescript
const MODULO = 1000000007n;
const MAX_OPERATION_COUNT = 100000;

// 預先計算 1..100 的模反元素。
const MULTIPLICATIVE_INVERSES = new Array<bigint>(101);
```

### Step 2：預先計算所有可用乘數的模反元素

由於題目中的整體乘數範圍固定且很小，可在一開始先把所有可能值的模反元素算好，之後便能直接重用，避免重複計算。

```typescript
for (let value = 1; value <= 100; value += 1) {
  MULTIPLICATIVE_INVERSES[value] = powerModulo(BigInt(value), MODULO - 2n);
}
```

### Step 3：建立快速冪函式並初始化運算狀態

這個輔助函式用來高效率計算模次方，作為前一步預先建立模反元素的核心工具；一開始先準備答案、目前底數與目前指數三個狀態。

```typescript
/**
 * 計算 base^exponent 在 MODULO 下的結果。
 * @param base 底數。
 * @param exponent 指數。
 * @return 模次方結果。
 */
function powerModulo(base: bigint, exponent: bigint): bigint {
  let result = 1n;
  let currentBase = base;
  let currentExponent = exponent;

  // ...
}
```

### Step 4：在快速冪中處理當前位元的乘積貢獻

當目前指數對應的位元需要計入答案時，就將當前底數乘進結果中；這是快速冪逐步累積答案的核心部分。

```typescript
/**
 * 計算 base^exponent 在 MODULO 下的結果。
 * @param base 底數。
 * @param exponent 指數。
 * @return 模次方結果。
 */
function powerModulo(base: bigint, exponent: bigint): bigint {
  // Step 3：建立快速冪函式並初始化運算狀態

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % MODULO;
    }

    // ...
  }

  // ...
}
```

### Step 5：更新快速冪的下一輪狀態並回傳結果

完成當前位元後，將底數平方、指數折半，持續往下一個位元推進，直到整個次方運算結束，最後回傳結果。

```typescript
/**
 * 計算 base^exponent 在 MODULO 下的結果。
 * @param base 底數。
 * @param exponent 指數。
 * @return 模次方結果。
 */
function powerModulo(base: bigint, exponent: bigint): bigint {
  // Step 3：建立快速冪函式並初始化運算狀態

  while (currentExponent > 0n) {
    // Step 4：處理當前位元的乘積貢獻

    currentBase = (currentBase * currentBase) % MODULO;
    currentExponent /= 2n;
  }

  return result;
}
```

### Step 6：建立資料結構並初始化成員狀態

接著定義整個資料結構的欄位，包含標準化值的儲存空間、序列總長度、最後一次整體歸零造成的分界位置，以及目前整體線性轉換所需的狀態參數。

```typescript
class Fancy {
  private readonly normalizedValues = new Int32Array(MAX_OPERATION_COUNT);

  private totalLength = 0;
  private resetLength = 0;
  private activeValueCount = 0;

  private currentMultiplier = 1n;
  private currentIncrement = 0n;
  private currentInverseMultiplier = 1n;

  constructor() {

  }

  // ...
}
```

### Step 7：在 append 中先反向消除目前的整體加法效果

新插入的值不應受到過去操作影響，因此在存入前，需先把目前整體平移效果逆向扣除，將它拉回標準化空間。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  /**
   * 將一個值附加到序列尾端。
   * @param val 要附加的值。
   */
  append(val: number): void {
    // 將新加入的值反向轉回標準化空間。
    let normalizedValue =
      (BigInt(val) - this.currentIncrement + MODULO) % MODULO;

    // ...
  }

  // ...
}
```

### Step 8：在 append 中繼續消除乘法效果並完成插入

完成加法逆轉後，再進一步消除目前累積的乘法效果，得到真正要保存的標準化值，最後寫入陣列並更新長度資訊。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  /**
   * 將一個值附加到序列尾端。
   * @param val 要附加的值。
   */
  append(val: number): void {
    // Step 7：反向消除目前的整體加法效果

    normalizedValue =
      (normalizedValue * this.currentInverseMultiplier) % MODULO;

    this.normalizedValues[this.activeValueCount] = Number(normalizedValue);
    this.activeValueCount += 1;
    this.totalLength += 1;
  }

  // ...
}
```

### Step 9：在 addAll 中直接更新整體平移量

由於所有有效元素共用同一組整體轉換，因此整體加值不需要逐一修改元素，只需更新目前的平移參數即可。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  /**
   * 對所有現有元素加上一個值。
   * @param inc 套用到所有元素的增量。
   */
  addAll(inc: number): void {
    this.currentIncrement += BigInt(inc);
    this.currentIncrement %= MODULO;
  }

  // ...
}
```

### Step 10：在 multAll 中先處理乘以 0 的世代切換

若整體乘數為 0，則所有既有元素都會變成相同值，先前儲存的個別差異不再有意義；因此直接記錄分界位置、清空目前有效資料數量，並把整體轉換狀態重設。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  // Step 9：更新整體平移量

  /**
   * 對所有現有元素乘上一個值。
   * @param m 套用到所有元素的乘數。
   */
  multAll(m: number): void {
    if (m === 0) {
      // 所有現有值都會變成 0，因此可直接開始新的一代。
      this.resetLength = this.totalLength;
      this.activeValueCount = 0;
      this.currentMultiplier = 1n;
      this.currentIncrement = 0n;
      this.currentInverseMultiplier = 1n;
      return;
    }

    // ...
  }

  // ...
}
```

### Step 11：在 multAll 中更新目前整體線性轉換狀態

若乘數不為 0，則目前世代中的元素仍可透過同一組線性轉換描述；此時只需同步更新整體乘法、整體平移，以及未來插入新值時要使用的反向乘法資訊。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  // Step 9：更新整體平移量

  /**
   * 對所有現有元素乘上一個值。
   * @param m 套用到所有元素的乘數。
   */
  multAll(m: number): void {
    // Step 10：處理乘以 0 的世代切換

    const multiplier = BigInt(m);

    this.currentMultiplier = (this.currentMultiplier * multiplier) % MODULO;
    this.currentIncrement = (this.currentIncrement * multiplier) % MODULO;
    this.currentInverseMultiplier =
      (this.currentInverseMultiplier * MULTIPLICATIVE_INVERSES[m]) % MODULO;
  }

  // ...
}
```

### Step 12：在 getIndex 中先檢查索引是否越界

查詢某個位置前，先確認該索引是否仍落在整體序列長度範圍內；若越界，直接回傳 `-1`。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  // Step 9：更新整體平移量

  // Step 11：更新整體線性轉換狀態

  /**
   * 取得指定索引位置的值。
   * @param idx 目標索引。
   * @return 該索引目前的值；若超出範圍則回傳 -1。
   */
  getIndex(idx: number): number {
    if (idx >= this.totalLength) {
      return -1;
    }

    // ...
  }
}
```

### Step 13：在 getIndex 中處理被歸零前的舊世代區間

若查詢位置落在最後一次乘以 0 之前，則該區段中的所有元素如今都共享同一結果，因此可直接回傳目前共同值。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  // Step 9：更新整體平移量

  // Step 11：更新整體線性轉換狀態

  /**
   * 取得指定索引位置的值。
   * @param idx 目標索引。
   * @return 該索引目前的值；若超出範圍則回傳 -1。
   */
  getIndex(idx: number): number {
    // Step 12：檢查索引是否越界

    // 最後一次乘以 0 之前的值，現在都共享同一個結果。
    if (idx < this.resetLength) {
      return Number(this.currentIncrement);
    }

    // ...
  }
}
```

### Step 14：在 getIndex 中還原目前世代元素的最終值

若查詢位置位於目前世代，則先取出對應的標準化值，再套用目前累積的整體乘法與平移，還原成最後答案。

```typescript
class Fancy {
  // Step 6：建立資料結構並初始化成員狀態

  // Step 8：完成 append 的標準化存入流程

  // Step 9：更新整體平移量

  // Step 11：更新整體線性轉換狀態

  /**
   * 取得指定索引位置的值。
   * @param idx 目標索引。
   * @return 該索引目前的值；若超出範圍則回傳 -1。
   */
  getIndex(idx: number): number {
    // Step 12：檢查索引是否越界

    // Step 13：處理被歸零前的舊世代區間

    const normalizedValue = BigInt(this.normalizedValues[idx - this.resetLength]);
    return Number(
      (normalizedValue * this.currentMultiplier + this.currentIncrement) % MODULO
    );
  }
}
```

### Step 15：保留題目要求的物件使用方式說明

最後附上題目給定的建立與呼叫方式，說明此外部介面會如何被使用。

```typescript
/**
 * 你的 Fancy 物件會如此被實例化與呼叫：
 * var obj = new Fancy()
 * obj.append(val)
 * obj.addAll(inc)
 * obj.append(val)
 * obj.multAll(m)
 * var param_4 = obj.getIndex(idx)
 */
```

## 時間複雜度

- 預處理階段需先計算 `1` 到 `100` 的模反元素，每次計算使用快速冪，單次成本為 $O(\log MODULO)$；
- 由於可用乘數範圍固定，這段預處理可視為固定成本；
- `append`、`addAll`、`multAll` 與 `getIndex` 都只進行常數次狀態更新與模數運算；
- 因此每次操作的時間複雜度皆為 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 使用一個長度為操作次數上限的陣列保存目前世代的標準化值；
- 另有固定大小的模反元素表，以及常數個狀態變數；
- 因此整體空間使用量隨可儲存元素數量線性成長。
- 總空間複雜度為 $O(n)$。

> $O(n)$
