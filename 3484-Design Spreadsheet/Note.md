# 3484. Design Spreadsheet

A spreadsheet is a grid with 26 columns (labeled from `'A'` to `'Z'`) and a given number of `rows`. 
Each cell in the spreadsheet can hold an integer value between 0 and 105.

Implement the `Spreadsheet` class:

- `Spreadsheet(int rows)` Initializes a spreadsheet with 26 columns (labeled `'A'` to `'Z'`) and the specified number of rows. 
   All cells are initially set to 0.
- `void setCell(String cell, int value)` Sets the value of the specified `cell`. 
  The cell reference is provided in the format `"AX"` (e.g., `"A1"`, `"B10"`), 
  where the letter represents the column (from `'A'` to `'Z'`) and the number represents a 1-indexed row.
- `void resetCell(String cell)` Resets the specified cell to 0.
- `int getValue(String formula)` Evaluates a formula of the form `"=X+Y"`, 
  where `X` and `Y` are either cell references or non-negative integers, and returns the computed sum.

Note: If `getValue` references a cell that has not been explicitly set using `setCell`, its value is considered 0.

**Constraints:**

- `1 <= rows <= 10^3`
- `0 <= value <= 10^5`
- The formula is always in the format `"=X+Y"`, where `X` and `Y` are either valid cell references or non-negative integers with values less than or equal to `10^5`.
- Each cell reference consists of a capital letter from `'A'` to `'Z'` followed by a row number between `1` and `rows`.
- At most `10^4` calls will be made in total to `setCell`, `resetCell`, and `getValue`.

## 基礎思路

本題要實作一個具有固定 26 欄（`A`～`Z`）與 `rows` 列的資料表，並高效支援三類更新操作與一個即時計算操作：

1. **設定儲存格數值**：指定 `"A1"`、`"B10"` 等位置寫入整數值。
2. **重設儲存格**：將指定儲存格恢復為 0。
3. **即時評估加總公式**：輸入 `"=X+Y"`，其中 `X`、`Y` 可為非負整數或儲存格參照（未設定者視為 0），回傳和。

核心觀察與策略：

* **欄固定、列已知**：可將二維表格攤平成**一維陣列**，採「列優先（row-major）」編址，以 `flatIndex = row * 26 + col` 直接定位。
* **避免字串開銷**：

    * 將儲存格參照（如 `"C123"`）以**字元碼**掃描：第一字元轉欄索引（`'A'` → 0），其餘連續數字累乘累加成「1 基底列號」，再換成 0 基底索引。
    * 公式僅為 `"=X+Y"`，一次線性掃描找到 `'+'`，左右兩段各自以**不切字串、不用 `parseInt`** 的方式解析成整數或查表取值。
- **快取行起點**：預先建立 `rowBaseIndex[r] = r * 26`，將乘法移出熱路徑，降低常數成本。
- **邊界保證**：未設定過的儲存格在整個 `Int32Array` 中本就為 0，滿足需求；值域在 `int32` 內，可用位元 OR `| 0` 固定為 32 位整數。

此設計讓 `setCell` / `resetCell` 皆為 $O(1)$，`getValue` 對長度 $L$ 的字串為 $O(L)$，並藉由零配置的字元運算與整數陣列達成高效與低常數開銷。

## 解題步驟

### Step 1：主類別與欄位宣告

宣告常數字元碼、欄數、底層一維格子 `grid`（列優先攤平），以及 `rowBaseIndex`（每列起始索引快取）。

```typescript
class Spreadsheet {
  private static readonly CODE_A = 65;    // 'A'
  private static readonly CODE_0 = 48;    // '0'
  private static readonly CODE_9 = 57;    // '9'
  private static readonly CODE_PLUS = 43; // '+'

  private readonly totalColumns = 26;
  private readonly grid: Int32Array;         // 以列優先攤平的一維表格: [row * 26 + col]
  private readonly rowBaseIndex: Int32Array; // rowBaseIndex[r] = r * 26

  // ...
}
```

### Step 2：建構子 — 初始化行列結構與行基底索引

以 `rows * 26` 配置 `grid`（自動 0 初始化），並預先計算 `rowBaseIndex[r] = r * 26`。

```typescript
class Spreadsheet {
  // Step 1：主類別與欄位宣告

  /**
   * 初始化一個具有 26 欄（A..Z）與指定列數的試算表。
   * 所有儲存格初始為 0。
   *
   * @param rows 列數總量。
   */
  constructor(rows: number) {
    this.grid = new Int32Array(rows * this.totalColumns); // 預設為 0

    // 預先計算 row * 26，避免在熱路徑反覆做乘法
    this.rowBaseIndex = new Int32Array(rows);
    let runningBase = 0;
    for (let row = 0; row < rows; row++) {
      this.rowBaseIndex[row] = runningBase;
      runningBase += this.totalColumns;
    }
  }

  // ...
}
```

### Step 3：私有方法 `computeIndexFromCell` — 解析儲存格參照成平面索引

不切子字串、不用 `parseInt`：以字元碼直接解析欄字母與列數字，轉成一維索引。

```typescript
class Spreadsheet {
  // Step 2：建構子 — 初始化行列結構與行基底索引

  /**
   * 將 "A1" 或 "Z999" 這類儲存格參照轉為一維索引。
   * 避免建立子字串與 parseInt 的額外負擔。
   *
   * @param cell 形如 [A-Z][1..] 的參照字串。
   * @returns 對應到底層 Int32Array 的一維索引。
   */
  private computeIndexFromCell(cell: string): number {
    // 第一字元為欄位字母
    const columnIndex = cell.charCodeAt(0) - Spreadsheet.CODE_A;

    // 後續皆為 1 基底列數字
    let rowNumber = 0;
    for (let i = 1; i < cell.length; i++) {
      rowNumber = (rowNumber * 10) + (cell.charCodeAt(i) - Spreadsheet.CODE_0);
    }

    // 轉成 0 基底列索引後加上欄索引
    return this.rowBaseIndex[rowNumber - 1] + columnIndex;
  }

  // ...
}
```

### Step 4：`setCell` — 寫入指定儲存格數值

以 `computeIndexFromCell` 取得索引後直接寫入，使用 `| 0` 固定為 32 位整數。

```typescript
class Spreadsheet {
  // Step 2：建構子 — 初始化行列結構與行基底索引
  
  // Step 3：私有方法 `computeIndexFromCell` — 解析儲存格參照成平面索引

  /**
   * 設定指定儲存格的數值。
   *
   * @param cell 例如 "A1"。
   * @param value 介於 0 到 1e5 的非負整數。
   */
  setCell(cell: string, value: number): void {
    this.grid[this.computeIndexFromCell(cell)] = value | 0; // 固定為 int32
  }

  // ...
}
```

### Step 5：`resetCell` — 重設指定儲存格為 0

同樣由參照轉索引後，直接寫入 0。

```typescript
class Spreadsheet {
  // Step 2：建構子 — 初始化行列結構與行基底索引
  
  // Step 3：私有方法 `computeIndexFromCell` — 解析儲存格參照成平面索引

  // Step 4：`setCell` — 寫入指定儲存格數值

  /**
   * 將指定儲存格重設為 0。
   *
   * @param cell 例如 "C7"。
   */
  resetCell(cell: string): void {
    this.grid[this.computeIndexFromCell(cell)] = 0;
  }

  // ...
}
```

### Step 6：私有方法 `evaluateOperand` — 評估運算元（整數或儲存格）

針對 `[start, end)` 片段判斷首字元：若為數字則線性轉成整數；否則解析為儲存格參照並取值。

```typescript
class Spreadsheet {
  // Step 2：建構子 — 初始化行列結構與行基底索引
  
  // Step 3：私有方法 `computeIndexFromCell` — 解析儲存格參照成平面索引
  
  // Step 4：`setCell` — 寫入指定儲存格數值
  
  // Step 5：`resetCell` — 重設指定儲存格為 0

  /**
   * 就地評估一個運算元（不分配暫存字串）。
   * 運算元要不是非負整數，就是 [A-Z][1..] 的儲存格參照。
   *
   * @param source 完整公式字串。
   * @param start 起始索引（含）。
   * @param end 結束索引（不含）。
   * @returns 此運算元對應的數值。
   */
  private evaluateOperand(source: string, start: number, end: number): number {
    // 檢查首字元：若是數字則解析整數；否則視為儲存格參照
    const firstCode = source.charCodeAt(start);

    if (firstCode >= Spreadsheet.CODE_0 && firstCode <= Spreadsheet.CODE_9) {
      // 不產生子字串地解析整數
      let numericValue = 0;
      for (let i = start; i < end; i++) {
        numericValue = (numericValue * 10) + (source.charCodeAt(i) - Spreadsheet.CODE_0);
      }
      return numericValue | 0;
    } else {
      // 解析儲存格：[A-Z] + 數字
      const columnIndex = firstCode - Spreadsheet.CODE_A;

      let rowNumber = 0;
      for (let i = start + 1; i < end; i++) {
        rowNumber = (rowNumber * 10) + (source.charCodeAt(i) - Spreadsheet.CODE_0);
      }

      const flatIndex = this.rowBaseIndex[rowNumber - 1] + columnIndex;
      return this.grid[flatIndex];
    }
  }

  // ...
}
```

### Step 7：`getValue` — 計算 `"=X+Y"` 的加總

自左而右找到 `'+'`，分別以 `evaluateOperand` 解析左右運算元並回傳總和；未設定的儲存格默認為 0。

```typescript
class Spreadsheet {
  // Step 2：建構子 — 初始化行列結構與行基底索引
  
  // Step 3：私有方法 `computeIndexFromCell` — 解析儲存格參照成平面索引
  
  // Step 4：`setCell` — 寫入指定儲存格數值
  
  // Step 5：`resetCell` — 重設指定儲存格為 0
  
  // Step 6：私有方法 `evaluateOperand` — 評估運算元（整數或儲存格）

  /**
   * 計算形如 "=X+Y" 的公式，X 與 Y 可為儲存格或非負整數。
   * 單次掃描找到 '+'，再就地解析兩側運算元。
   *
   * @param formula 公式字串，格式固定為 "=X+Y"。
   * @returns 計算得到的總和。
   */
  getValue(formula: string): number {
    // 線性尋找 '+'，不建立子字串
    let plusPosition = -1;
    for (let i = 1; i < formula.length; i++) {
      if (formula.charCodeAt(i) === Spreadsheet.CODE_PLUS) {
        plusPosition = i;
        break;
      }
    }

    // 左運算元：[1, plusPosition)
    const leftValue = this.evaluateOperand(formula, 1, plusPosition);

    // 右運算元：(plusPosition + 1, formula.length)
    const rightValue = this.evaluateOperand(formula, plusPosition + 1, formula.length);

    // 以 int32 做一次加總
    return (leftValue + rightValue) | 0;
  }
}
```

## 時間複雜度

- 建構子初始化需要配置 $26 \times n$ 的儲存格陣列與 $n$ 個列起始索引，時間為 $O(n)$，其中 $n$ 為試算表的列數。
- 每次 `setCell`、`resetCell` 操作為常數時間；每次 `getValue` 為 $O(L)$，其中 $L$ 為公式長度（格式固定為 `=X+Y`，$L$ 為常數），總計 $O(Q)$，其中 $Q$ 為所有操作的總次數。
- 總時間複雜度為 $O(n + Q)$。

> $O(n + Q)$

## 空間複雜度

- 使用大小為 $26 \times n$ 的一維陣列 `grid` 儲存儲存格內容，以及大小為 $n$ 的 `rowBaseIndex` 陣列做列基底快取。
- 其餘操作皆使用常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
