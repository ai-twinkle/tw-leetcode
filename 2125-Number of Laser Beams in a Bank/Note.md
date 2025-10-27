# 2125. Number of Laser Beams in a Bank

Anti-theft security devices are activated inside a bank. 
You are given a 0-indexed binary string array `bank` representing the floor plan of the bank, which is an `m x n` 2D matrix. 
`bank[i]` represents the $i^{th}$ row, consisting of `'0'`s and `'1'`s. 
`'0'` means the cell is empty, while `'1'` means the cell has a security device.

There is one laser beam between any two security devices if both conditions are met:

- The two devices are located on two different rows: `r_1` and `r_2`, where `r_1 < r_2`.
- For each row `i` where `r_1 < i < r_2`, there are no security devices in the $i^{th}$ row.

Laser beams are independent, i.e., one beam does not interfere nor join with another.

Return the total number of laser beams in the bank.

**Constraints:**

- `m == bank.length`
- `n == bank[i].length`
- `1 <= m, n <= 500`
- `bank[i][j]` is either `'0'` or `'1'`.

## 基礎思路

本題要求計算銀行平面圖中「雷射光束」的總數。
每一行 (`bank[i]`) 代表銀行的一層，其中 `'1'` 表示有安全裝置，`'0'` 表示空位。
若兩行之間都沒有安全裝置，則這兩行之間的所有安全裝置會互相形成光束。

具體條件如下：

- 兩個裝置必須位於不同的行 `r₁ < r₂`。
- 兩行之間的所有行都沒有裝置（即為空行）。

例如：

```
bank = ["011001","000000","010100","001000"]
```

第 0 行與第 2 行之間沒有任何非空行，因此第 0 行的裝置與第 2 行的裝置會形成多條光束；
第 2 行與第 3 行之間同理。

在思考解法時，需注意以下幾點：

- 我們只需考慮「相鄰的兩個非空行」之間的光束；
- 若中間有任何非空行存在，則光束會在該行中止；
- 光束數量的計算方式為「前一個非空行的裝置數 × 當前非空行的裝置數」。

因此，我們可以採用以下策略：

- **逐行掃描**：每次統計當前行中 `'1'` 的個數；
- **跳過空行**：若該行沒有裝置則直接略過；
- **連乘累計**：若該行與上一個非空行皆有裝置，則將兩行裝置數相乘並累加；
- **持續更新上一個非空行的裝置數**：用於後續計算。

透過單次遍歷即可計算出總光束數，時間複雜度為線性級。

## 解題步驟

### Step 1：宣告必要變數

建立儲存 `'1'` 字元編碼、前一個非空行的裝置數，以及累積光束數的變數。

```typescript
// '1' 的 ASCII 編碼值，避免重複字串比較
const codeOne = 49;

// 儲存上一個非空行的裝置數
let previousNonEmptyRowDeviceCount = 0;

// 累計雷射光束總數
let totalBeams = 0;
```

### Step 2：遍歷每一行

使用 `for` 迴圈掃描每一行，計算當前行的裝置數。

```typescript
// 逐行遍歷銀行平面圖
for (let rowIndex = 0, rowLength = bank.length; rowIndex < rowLength; rowIndex++) {
  const row = bank[rowIndex];

  // 計算當前行中安全裝置的數量
  let currentRowDeviceCount = 0;
  for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
    // 若該位置為 '1'，則裝置數加一
    if (row.charCodeAt(colIndex) === codeOne) {
      currentRowDeviceCount++;
    }
  }
```

### Step 3：處理非空行的光束計算

僅當該行為非空行時，才與前一個非空行形成光束；若兩者皆非空，則乘積即為新增加的光束數。

```typescript
  // 僅在當前行非空時才參與光束計算
  if (currentRowDeviceCount > 0) {
    // 若前一個非空行存在，則形成光束
    if (previousNonEmptyRowDeviceCount > 0) {
      // 光束數 = 兩行裝置數的乘積
      totalBeams += previousNonEmptyRowDeviceCount * currentRowDeviceCount;
    }

    // 更新上一個非空行的裝置數
    previousNonEmptyRowDeviceCount = currentRowDeviceCount;
  }
}
```

### Step 4：回傳結果

結束所有行的遍歷後，回傳光束總數。

```typescript
// 回傳最終光束總數
return totalBeams;
```

## 時間複雜度

- 需遍歷整個矩陣的每一行與每一列，總共有 $m \times n$ 個元素。
- 計算與加總皆為常數操作。
- 總時間複雜度為 $O(m \times n)$。

> $O(mn)$

## 空間複雜度

- 僅使用常數級變數（不含輸入）。
- 無額外結構與儲存開銷。
- 總空間複雜度為 $O(1)$。

> $O(1)$
