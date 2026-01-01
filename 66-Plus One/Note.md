# 66. Plus One

You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the $i^{th}$ digit of the integer. 
The digits are ordered from most significant to least significant in left-to-right order. 
The large integer does not contain any leading `0`'s.

Increment the large integer by one and return the resulting array of digits.

**Constraints:**

- `1 <= digits.length <= 100`
- `0 <= digits[i] <= 9`
- digits does not contain any leading `0`'s.

## 基礎思路

本題將一個「以陣列表示的大整數」加一，需模擬人工進位的過程。

在思考解法時，可以先觀察幾個關鍵性質：

* **數字的最低位在陣列尾端**：加一的影響會從最右邊開始，並可能一路向左傳遞進位。
* **進位只在遇到 9 時才會持續傳遞**：

    * 若某一位小於 9，只需加一即可結束。
    * 若等於 9，該位會變成 0，並將進位往更高位傳遞。
* **最壞情況是所有位數都是 9**：

    * 例如 `[9,9,9]`，加一後會變成 `[1,0,0,0]`，需要建立一個新陣列。

因此，整體策略可以分為兩種情況：

* **從低位往高位處理進位**，一旦不再產生進位即可提前結束；
* **若所有位數皆產生進位**，則建立一個長度加一的新結果。

這樣即可在一次由右至左的掃描中完成運算。

## 解題步驟

### Step 1：由最低位開始處理進位

從陣列尾端（最低位）往前掃描，逐位處理加一與進位邏輯。

```typescript
// 從最低有效位往最高有效位處理進位
for (let index = digits.length - 1; index >= 0; index--) {
  const currentDigit = digits[index];

  // ...
}
```

### Step 2：遇到非 9 的數字，直接加一並結束

若當前位數不是 9，代表不會再有進位，
直接將該位加一並回傳結果即可。

```typescript
for (let index = digits.length - 1; index >= 0; index--) {
  const currentDigit = digits[index];

  // 若不是 9，直接加一即可結束
  if (currentDigit !== 9) {
    digits[index] = currentDigit + 1;
    return digits;
  }

  // ...
}
```

### Step 3：遇到 9 則歸零並繼續向前傳遞進位

若當前位數為 9，則該位會變成 0，
並將進位繼續傳遞到更高位。

```typescript
for (let index = digits.length - 1; index >= 0; index--) {
  // Step 2：遇到非 9 的數字，直接加一並結束

  // 當前位數為 9，歸零並繼續進位
  digits[index] = 0;
}
```

### Step 4：處理所有位數皆為 9 的特殊情況

若整個迴圈結束仍未回傳，
代表原本所有位數都是 9，需要建立新陣列。

```typescript
// 所有位數皆為 9，需要建立新陣列
const newLength = digits.length + 1;
const result = new Array<number>(newLength);
result[0] = 1;
```

### Step 5：補齊其餘位數為 0 並回傳結果

新陣列除了最高位為 1，其餘位數皆為 0。

```typescript
for (let index = 1; index < newLength; index++) {
  result[index] = 0;
}

return result;
```

## 時間複雜度

- 最多只需從右到左完整掃描一次陣列；
- 在最壞情況（所有位數皆為 9）下，仍只會進行一次線性掃描與一次線性填值。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 若存在非 9 的位數，直接原地修改，額外空間為常數。
- 若所有位數皆為 9，需建立一個長度為 `n + 1` 的新陣列。
- 在最壞情況下，額外空間與輸入大小成正比。
- 總空間複雜度為 $O(n)$。

> $O(n)$
