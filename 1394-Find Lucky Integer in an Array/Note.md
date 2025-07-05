# 1394. Find Lucky Integer in an Array

Given an array of integers `arr`, a lucky integer is an integer that has a frequency in the array equal to its value.

Return the largest lucky integer in the array. If there is no lucky integer return `-1`.

**Constraints:**

- `1 <= arr.length <= 500`
- `1 <= arr[i] <= 500`

## 基礎思路

本題的核心在於快速且有效地判斷陣列中是否存在「幸運整數」，即出現次數恰好等於自身數值的整數，並且從中找出最大的那一個。
為了實現此目標，我們採取以下策略：

- **頻率統計：**
  由於題目給定的數值範圍明確限制在 $1$ 到 $500$，可利用固定長度的陣列來快速統計每個數字的出現頻率。

- **從大至小搜尋：**
  因為題目要求最大的幸運整數，因此在完成頻率統計後，應從最大數值 $500$ 開始向下尋找，找到第一個符合「出現頻率與數值相同」條件的數，即可直接回傳此值。

透過上述策略，不僅可保證效率，也能夠在最短時間內找到最大幸運整數。

## 解題步驟

### Step 1：初始化頻率陣列

首先初始化一個長度為 $501$ 的頻率統計陣列，利用 `Uint16Array` 確保效能：

```typescript
// 使用 TypedArray 進行頻率統計，索引 0 未使用
const frequencyArray = new Uint16Array(501);
```

### Step 2：逐一統計數字的出現次數

接著遍歷輸入陣列，統計每個數字出現的頻率：

```typescript
// 統計每個數字的出現頻率
for (let i = 0; i < arr.length; i++) {
  frequencyArray[arr[i]]++;
}
```

### Step 3：從最大值向下搜尋幸運整數

完成頻率統計後，從 $500$ 開始向下搜尋，找到第一個滿足幸運整數條件的值即回傳：

```typescript
// 從最大到最小檢查幸運整數
for (let value = 500; value >= 1; value--) {
  if (frequencyArray[value] === value) {
    return value;
  }
}
```

### Step 4：若不存在幸運整數，回傳 -1

若以上步驟無法找到符合條件的整數，即表示無幸運整數存在：

```typescript
return -1;
```

## 時間複雜度

- 頻率統計階段須遍歷整個陣列，時間複雜度為 $O(n)$。
- 搜尋幸運整數的步驟僅遍歷固定範圍 ($500$ 個元素)，屬於常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅額外使用固定大小 ($501$ 個元素) 的頻率統計陣列，空間複雜度為常數級別。
- 無其他動態配置之資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
