# 2094. Finding 3-Digit Even Numbers

You are given an integer array `digits`, where each element is a digit. 
The array may contain duplicates.

You need to find all the unique integers that follow the given requirements:

- The integer consists of the concatenation of three elements from `digits` in any arbitrary order.
- The integer does not have leading zeros.
- The integer is even.

For example, if the given `digits` were `[1, 2, 3]`, integers `132` and `312` follow the requirements.

Return a sorted array of the unique integers.

**Constraints:**

- `3 <= digits.length <= 100`
- `0 <= digits[i] <= 9`

## 基礎思路

本題要從數字陣列 `digits` 中選出三個數字，組成一個「沒有前導零」且為「偶數」的三位整數，並找出所有不重複的結果。

由於組成的數字需符合三個條件：

1. **三位整數**：從陣列中任取三個數字。
2. **不能有前導零**：即百位數必須為 `1` 到 `9`。
3. **為偶數**：即個位數必須為 `0`、`2`、`4`、`6`、`8`。

若用排列組合暴力生成所有三位數，效率會過低且難以判重。較佳的策略是：

* 統計數字出現次數，避免重複使用。
* 透過百位、十位、個位的三重迴圈快速枚舉所有可能。
* 每次檢查數字頻率是否足夠使用，符合條件時才存入結果。

## 解題步驟

### Step 1：統計 `digits` 陣列中每個數字出現的次數

此步驟可協助後續快速確認數字的使用次數是否合法。

```typescript
const digitFrequencies = new Uint8Array(10);
for (const digit of digits) {
  digitFrequencies[digit]++;
}
```

### Step 2：初始化結果陣列

儲存所有符合條件的三位數。

```typescript
const result: number[] = [];
```

### Step 3：三重迴圈枚舉所有符合條件的三位數組合

逐位枚舉數字並確認頻率是否足夠，若合法則加入結果陣列。

- 百位數：從 `1` 到 `9`，不能為 `0`。
- 十位數：從 `0` 到 `9`，可以為 `0`。
- 個位數：從 `0` 到 `8`，只能是偶數。

```typescript
// 處理百位數 (1~9 不能為 0)
for (let hundredsPlace = 1; hundredsPlace <= 9; hundredsPlace++) {
  const countHundred = digitFrequencies[hundredsPlace];
  if (countHundred === 0) {
    continue;
  }

  // 處理十位數 (0~9)
  for (let tensPlace = 0; tensPlace <= 9; tensPlace++) {
    const countTen = digitFrequencies[tensPlace] - (tensPlace === hundredsPlace ? 1 : 0);
    if (countTen <= 0) {
      continue;
    }

    // 處理個位數，只能是偶數 (0, 2, 4, 6, 8)
    for (let unitsPlace = 0; unitsPlace <= 8; unitsPlace += 2) {
      const countUnit =
        digitFrequencies[unitsPlace] -
        (unitsPlace === hundredsPlace ? 1 : 0) -
        (unitsPlace === tensPlace ? 1 : 0);
      if (countUnit <= 0) {
        continue;
      }

      result.push(hundredsPlace * 100 + tensPlace * 10 + unitsPlace);
    }
  }
}
```

### Step 4：回傳結果陣列

```typescript
return result;
```

## 時間複雜度

- 預處理陣列頻率需掃描一次輸入陣列，耗時 $O(n)$。
- 三重迴圈固定最多執行 $9\times10\times5=450$ 次，視為常數 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 頻率統計陣列固定長度為 10，空間為 $O(1)$。
- 結果陣列最大為固定常數 450 個數字，空間為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
