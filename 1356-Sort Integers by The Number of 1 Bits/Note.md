# 1356. Sort Integers by The Number of 1 Bits

You are given an integer array `arr`. 
Sort the integers in the array in ascending order by the number of `1`'s in their binary representation 
and in case of two or more integers have the same number of `1`'s you have to sort them in ascending order.

Return the array after sorting it.

**Constraints:**

- `1 <= arr.length <= 500`
- `0 <= arr[i] <= 10^4`

## 基礎思路

本題要求對整數陣列進行排序，排序依據分成兩層：先依照二進位表示中 `1` 的個數由小到大排序；若 `1` 的個數相同，則再依照數值本身由小到大排序。由於陣列長度最多 500、數值上限為 10^4，因此可以在排序前先建立快速取得「1 的個數」的方法，避免在排序過程中反覆計算造成額外負擔。

在思考解法時，可掌握以下核心觀察：

* **排序鍵是「兩層比較」的組合**：需要同時表達「1 的個數優先」與「數值次序」兩種規則。
* **位元統計可預先完成**：數值範圍固定且不大，可一次性預先計算每個可能值的 `1` 個數，讓後續查表即可得到結果。
* **將雙層規則壓成單一可排序鍵**：若能把「1 的個數」與「原始數值」打包成一個整數，直接用數值排序即可同時滿足兩層規則，並避免排序比較器的呼叫成本。
* **排序後只需還原原始值**：鍵值排序完成後，將打包鍵解出原始數值回寫即可得到答案。

依據以上特性，可以採用以下策略：

* **先建立固定範圍內的位元統計表**，讓每個數值的 `1` 個數都能以常數時間取得。
* **把每個元素轉成「(1 的個數, 數值)」的單一排序鍵**，並以數值遞增排序。
* **排序完成後再解包還原成原始數值陣列**，得到符合題意的排序結果。

此策略能在維持正確排序規則的同時，將排序前的準備成本固定化，並讓排序過程更高效。

## 解題步驟

### Step 1：建立固定範圍內的位元統計表

由於數值只會落在固定上限內，可以先針對每個可能值預先計算其二進位中 `1` 的個數，後續直接查表取得，避免在排序路徑中重複進行位元統計。

```typescript
const MAXIMUM_VALUE = 10000;
const VALUE_BIT_MASK = (1 << 14) - 1; // 16383，足以容納最大值 10000

/**
 * 為 [0, 10000] 的所有值預先計算 popcount（二進位中 1 的個數）。
 * 這能避免在排序路徑中重複進行位元計數。
 */
const POPCOUNT_TABLE = (function precomputePopcountTable() {
  const table = new Uint8Array(MAXIMUM_VALUE + 1);
  for (let value = 1; value <= MAXIMUM_VALUE; value += 1) {
    table[value] = (table[value >>> 1] + (value & 1)) as number;
  }
  return table;
})();
```

### Step 2：處理極小輸入以避免不必要的排序流程

當輸入長度為 0 或 1 時，不可能需要重新排列，直接回傳即可，避免後續建表與排序成本。

```typescript
const length = arr.length;

// 小型輸入的快速路徑。
if (length <= 1) {
    return arr;
}
```

### Step 3：為每個元素建立可直接排序的打包鍵

為了同時滿足「先比 `1` 的個數，再比數值」的規則，可以把 `1` 的個數放在高位、數值放在低位，形成單一整數鍵。如此一來，對鍵進行遞增排序就等同於先按 `1` 的個數排序，並在相同時按數值排序。

```typescript
// 將 (popcount, value) 打包成單一可排序整數，以避免比較器呼叫成本。
const packedKeys = new Uint32Array(length);

for (let index = 0; index < length; index += 1) {
    const value = arr[index] | 0;
    packedKeys[index] = (POPCOUNT_TABLE[value] << 14) | value;
}
```

### Step 4：以數值遞增排序打包鍵以完成雙層排序規則

由於鍵的高位代表 `1` 的個數、低位代表原始數值，直接以數值遞增排序即可一次完成兩層排序需求，且可避免額外比較器帶來的呼叫開銷。

```typescript
// TypedArray sort 會以數值遞增排序，並避免 JavaScript 比較器呼叫的額外成本。
packedKeys.sort();
```

### Step 5：將排序後的鍵解包回寫成結果陣列

排序完成後，每個鍵的低位部分就是原始數值，透過遮罩取回並依序寫回，即可得到已符合規則的結果陣列。

```typescript
// 將值解包回寫到原始陣列。
for (let index = 0; index < length; index += 1) {
    arr[index] = packedKeys[index] & VALUE_BIT_MASK;
}

return arr;
```

## 時間複雜度

- 預先計算位元統計表的成本為 $O(M)$，其中 $M = 10000$ 為固定上限，因此可視為常數成本；
- 對長度為 $n$ 的陣列建立打包鍵與解包回寫各需 $O(n)$；
- 排序 $n$ 個鍵的成本為 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 額外使用一個長度為 $n$ 的打包鍵陣列，成本為 $O(n)$；
- 位元統計表大小為 $M = 10000$，屬固定上限，可視為常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
