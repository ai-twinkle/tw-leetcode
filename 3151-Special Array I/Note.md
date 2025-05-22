# 3151. Special Array I

An array is considered special if every pair of its adjacent elements contains two numbers with different parity.

You are given an array of integers nums. Return true if `nums` is a special array, otherwise, return `false`.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題的核心在於檢查每一對相鄰元素，判斷它們是否分別為奇數與偶數。
如果有任何一對相鄰數字的奇偶性相同，則這個陣列就不是特殊陣列。

我們可以使用一個旗標（變數）來記錄前一個數字的奇偶性，接著與當前數字的奇偶性進行比較：

- 若相同，立即回傳 `false`。
- 若不同，則更新旗標，繼續檢查下一組相鄰元素。

如果整個陣列都符合條件，則回傳 `true`，代表這是一個特殊陣列。

## 解題步驟

### Step 1: 初始化旗標

首先，判斷陣列第一個元素的奇偶性，並記錄下來，作為後續比較的依據。

```typescript
let previousNumberIsOdd = nums[0] % 2 === 1;
```

### Step 2: 遍歷所有數字

接著，從第二個元素開始遍歷陣列，依序檢查每個數字與前一個數字的奇偶性是否不同。

```typescript
for (let i = 1; i < nums.length; i++) {
  // 判斷奇偶性
  const currentNumberIsOdd = nums[i] % 2 === 1;
  
  // 判斷是否與前一個數字奇偶性相同
  if (previousNumberIsOdd === currentNumberIsOdd) {
    return false;
  }
  
  // 更新旗標
  previousNumberIsOdd = currentNumberIsOdd;
}
```

### Step 3: 回傳結果

```typescript
// 如果整個遍歷都沒有問題，則回傳 true，代表是特殊陣列
return true;
```

## 時間複雜度

- 遍歷所有數字，時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 只使用了常數空間，空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
