# 485. Max Consecutive Ones

Given a binary array `nums`, return the maximum number of consecutive `1`'s in the array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `nums[i]` is either `0` or `1`.

## 基礎思路

本題要在二元陣列中找出連續 `1` 的最長段落長度。

在思考解法時，我們可以利用以下觀察：

* **連續段落的界線由 0 決定**：每遇到 `0`，代表當前連續 `1` 段落結束，需要重新開始計數。
* **只需維護兩個資訊**：一個是「目前連續 1 的長度」，另一個是「截至目前為止的最大連續 1 長度」。
* **單次線性掃描即可完成**：從左到右走過一次陣列，遇到 `1` 就累加當前長度；遇到 `0` 就結算並清零，最後再處理尾端可能未結算的段落。

透過這樣的策略，可以用線性時間得到答案，且只需常數額外空間。

## 解題步驟

### Step 1：初始化追蹤變數與陣列長度

建立目前連續段長度與最大段長度，並先取出陣列長度避免重複存取。

```typescript
let currentStreak = 0;
let maximumStreak = 0;

const length = nums.length;
```

### Step 2：建立主迴圈逐一讀取元素

逐一讀取每個元素，準備依照值是 `1` 或 `0` 決定要延長段落或結算段落。

```typescript
// 當連續段落結束時才更新最大值，以降低每個元素的額外開銷。
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // ...
}
```

### Step 3：遇到 `1` 則延長目前連續段落

若當前值為 `1`，代表連續段落持續，將目前段落長度加一，並直接進入下一個元素。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立主迴圈逐一讀取元素

  const value = nums[index];

  if (value === 1) {
    currentStreak++;
    continue;
  }

  // ...
}
```

### Step 4：遇到 `0` 則結算目前段落並重置

當遇到 `0`，代表一段連續 `1` 結束：
先用目前段落長度更新最大值（若更大），再把目前段落清零，開始新的段落計算。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立主迴圈逐一讀取元素

  // Step 3：遇到 `1` 則延長目前連續段落

  if (currentStreak > maximumStreak) {
    maximumStreak = currentStreak;
  }
  currentStreak = 0;
}
```

### Step 5：處理尾端段落並回傳答案

若陣列最後以 `1` 結尾，最後一段不會在迴圈中因 `0` 而被結算，因此需在迴圈後再做一次比較更新，最後回傳最大值。

```typescript
if (currentStreak > maximumStreak) {
  maximumStreak = currentStreak;
}

return maximumStreak;
```

## 時間複雜度

- 主迴圈從 `index = 0` 跑到 `index = length - 1`，共執行 `n` 次（其中 `n = nums.length`）。
- 每次迭代僅包含常數次操作（讀取值、比較、加減、指派），`while` 等非線性結構不存在。
- 迴圈後的尾端處理是常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定數量的變數（`currentStreak`、`maximumStreak`、`length`、迴圈索引與暫存值），與輸入大小 `n` 無關。
- 未配置額外與 `n` 成比例的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
