# 3129. Find All Possible Stable Binary Arrays I

You are given 3 positive integers `zero`, `one`, and `limit`.

A binary array `arr` is called stable if:

- The number of occurrences of 0 in `arr` is exactly `zero`.
- The number of occurrences of 1 in `arr` is exactly `one`.
- Each subarray of `arr` with a size greater than `limit` must contain both 0 and 1.

Return the total number of stable binary arrays.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= zero, one, limit <= 200`

## 基礎思路

本題要求計算恰好包含指定數量 `0` 與 `1` 的所有穩定二元陣列數量，且任何長度大於限制值的子陣列都不能只由單一數字組成。換言之，任意連續的相同數字區段長度都不得超過限制值。

在思考解法時，可掌握以下核心觀察：

* **穩定性的限制可轉化為連續區段長度限制**：
  若某段子陣列長度已超過限制值，卻只包含單一數字，便違反條件；因此本題本質上是在限制連續 `0` 或連續 `1` 的最長長度。

* **狀態需區分最後一個數字類型**：
  即使使用了相同數量的 `0` 與 `1`，若結尾不同，後續可接續的合法方式也不同，因此需要分開統計「以 `0` 結尾」與「以 `1` 結尾」的情況。

* **轉移可視為枚舉最後一段連續區塊的長度**：
  若一個合法陣列以 `0` 結尾，則最後可接上一段長度介於合法範圍內的 `0` 區塊，而它前面必須接在一個以 `1` 結尾的合法狀態之後；以 `1` 結尾的情況同理。

* **直接枚舉區塊長度會造成重複計算**：
  每個狀態都要累加一段長度範圍內的多個前置狀態，若逐一加總，整體效率會偏低；因此可進一步利用前綴和，將區間加總壓縮為常數時間查詢。

依據以上特性，可以採用以下策略：

* **以二維狀態表示已使用的 `0` 與 `1` 數量，並區分結尾是 `0` 或 `1`**。
* **對每一種結尾型態分別維護可快速查詢的前綴和**，使得合法轉移區間能在常數時間內完成。
* **依照已使用的 `0` 與 `1` 數量逐步填表**，最終將目標位置中兩種結尾型態的結果相加。

此策略能同時滿足狀態完整性與轉移效率，在限制範圍內有效求出答案。

## 解題步驟

### Step 1：初始化模數與一維化索引所需的基礎參數

這裡先準備模數，以及將二維狀態表壓平成一維陣列時所需的欄數與總長度，方便後續以連續記憶體儲存所有狀態。

```typescript
const MOD = 1_000_000_007;
const columnCount = one + 1;
const totalSize = (zero + 1) * columnCount;
```

### Step 2：建立兩種結尾狀態與對應的前綴和陣列

我們分別維護兩類合法陣列數量：
一類是目前以 `0` 結尾，另一類是目前以 `1` 結尾。
此外，再額外維護兩組前綴和，用來快速取得轉移時需要的區間總和。

```typescript
// 以 0 結尾的陣列
const stableArrayEndingWithZero = new Uint32Array(totalSize);

// 以 1 結尾的陣列
const stableArrayEndingWithOne = new Uint32Array(totalSize);

// 沿著 zero 維度累積、以 1 結尾的前綴和
const prefixSumEndingWithOne = new Uint32Array(totalSize);

// 沿著 one 維度累積、以 0 結尾的前綴和
const prefixSumEndingWithZero = new Uint32Array(totalSize);
```

### Step 3：設定虛擬初始狀態，作為第一段區塊的起點

由於後續轉移是從「前一種結尾」接上一整段新數字，因此需要一個空狀態作為所有第一段區塊的共同起點。
這裡將兩種結尾狀態在原點都設為可行，讓第一段 `0` 或第一段 `1` 都能被統一處理。

```typescript
// 用來初始化第一段區塊的虛擬狀態
stableArrayEndingWithZero[0] = 1;
stableArrayEndingWithOne[0] = 1;
```

### Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

外層依序枚舉已使用的 `0` 數量，內層再枚舉已使用的 `1` 數量。
同時預先算出當前列、前一列與超出限制前那一列的偏移位置，讓後續查表更直接。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  const currentZeroOffset = zeroCount * columnCount;
  const previousZeroOffset = (zeroCount - 1) * columnCount;
  const limitedZeroOffset = (zeroCount - limit - 1) * columnCount;

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    const index = currentZeroOffset + oneCount;

    // ...
  }
}
```

### Step 5：先處理原點的虛擬狀態並更新其前綴和

當已使用的 `0` 與 `1` 都是 0 時，這是唯一的空狀態。
此時直接設定前綴和後略過後續一般轉移，避免將虛擬狀態與正常狀態混在一起計算。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

    // 處理初始的虛擬狀態
    if (zeroCount === 0 && oneCount === 0) {
      prefixSumEndingWithOne[index] = 1;
      prefixSumEndingWithZero[index] = 1;
      continue;
    }

    // ...
  }
}
```

### Step 6：計算以 0 結尾的合法陣列數量

若目前還能放入 `0`，則可從某些以 `1` 結尾的狀態接上一段 `0` 區塊而來。
這裡利用前綴和先取出整段可行範圍的總和；若長度可能超過限制，則扣掉不合法的部分，便可得到目前以 `0` 結尾的答案。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

    // Step 5：處理原點的虛擬狀態

    // 計算以 0 結尾的陣列數量
    if (zeroCount > 0) {
      let value = prefixSumEndingWithOne[previousZeroOffset + oneCount];

      if (zeroCount > limit) {
        value = (value - prefixSumEndingWithOne[limitedZeroOffset + oneCount] + MOD) % MOD;
      }

      stableArrayEndingWithZero[index] = value;
    }

    // ...
  }
}
```

### Step 7：計算以 1 結尾的合法陣列數量

與前一步完全對稱。
若目前還能放入 `1`，就從某些以 `0` 結尾的狀態接上一段 `1` 區塊而來，並同樣透過前綴和快速扣除超過限制的不合法範圍。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

    // Step 5：處理原點的虛擬狀態

    // Step 6：計算以 0 結尾的陣列數量

    // 計算以 1 結尾的陣列數量
    if (oneCount > 0) {
      let value = prefixSumEndingWithZero[index - 1];

      if (oneCount > limit) {
        value = (value - prefixSumEndingWithZero[index - limit - 1] + MOD) % MOD;
      }

      stableArrayEndingWithOne[index] = value;
    }

    // ...
  }
}
```

### Step 8：更新以 1 結尾狀態在 zero 維度上的前綴和

當前格的以 `1` 結尾答案求出後，需要立刻將它合併進同欄位沿著 `0` 數量方向的前綴和。
這樣後續較大的 `0` 數量在做區間轉移時，才能直接查到累積結果。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

    // Step 5：處理原點的虛擬狀態

    // Step 6：計算以 0 結尾的陣列數量

    // Step 7：計算以 1 結尾的陣列數量

    // 沿著 zero 維度更新前綴和
    let prefixOneValue = stableArrayEndingWithOne[index];
    if (zeroCount > 0) {
      prefixOneValue = (prefixOneValue + prefixSumEndingWithOne[previousZeroOffset + oneCount]) % MOD;
    }
    prefixSumEndingWithOne[index] = prefixOneValue;

    // ...
  }
}
```

### Step 9：更新以 0 結尾狀態在 one 維度上的前綴和

同理，當前格的以 `0` 結尾答案求出後，也要同步更新沿著 `1` 數量方向的前綴和。
至此，這個狀態格所需的所有資訊就都處理完成。

```typescript
for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
  // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

  for (let oneCount = 0; oneCount <= one; oneCount += 1) {
    // Step 4：逐列逐欄走訪所有已使用的 0 與 1 數量組合

    // Step 5：處理原點的虛擬狀態

    // Step 6：計算以 0 結尾的陣列數量

    // Step 7：計算以 1 結尾的陣列數量

    // Step 8：更新以 1 結尾狀態在 zero 維度上的前綴和

    // 沿著 one 維度更新前綴和
    let prefixZeroValue = stableArrayEndingWithZero[index];
    if (oneCount > 0) {
      prefixZeroValue = (prefixZeroValue + prefixSumEndingWithZero[index - 1]) % MOD;
    }
    prefixSumEndingWithZero[index] = prefixZeroValue;
  }
}
```

### Step 10：取出目標狀態並合併兩種結尾的答案

當所有狀態都填完後，目標位置就是剛好使用完指定數量 `0` 與 `1` 的那一格。
由於合法陣列可能以 `0` 結尾，也可能以 `1` 結尾，因此將兩者相加後回傳即可。

```typescript
const targetIndex = zero * columnCount + one;

return (stableArrayEndingWithZero[targetIndex] + stableArrayEndingWithOne[targetIndex]) % MOD;
```

## 時間複雜度

- 設 `n` 為 `0` 的數量，`m` 為 `1` 的數量；
- 狀態表共有 `(n + 1) * (m + 1)` 個位置；
- 每個位置的轉移、區間扣除與前綴和更新皆為常數時間；
- 總時間複雜度為 $O(n \cdot m)$。

> $O(n \cdot m)$

## 空間複雜度

- 設 `n` 為 `0` 的數量，`m` 為 `1` 的數量；
- 使用四個大小皆為 `(n + 1) * (m + 1)` 的一維陣列來儲存狀態與前綴和；
- 其餘僅為常數數量的輔助變數；
- 總空間複雜度為 $O(n \cdot m)$。

> $O(n \cdot m)$
