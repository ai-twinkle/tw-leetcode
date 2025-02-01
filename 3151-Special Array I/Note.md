# 3151. Special Array I

An array is considered special if every pair of its adjacent elements contains two numbers with different parity.

You are given an array of integers nums. Return true if `nums` is a special array, otherwise, return `false`.

## 基礎思路

用一個個旗標來記錄前一個數字的奇偶性，並與當前數字比較。
如果不符合條件，則回傳 `false`。
然後更新旗標，繼續遍歷。

## 解題步驟

### Step 1: 初始化旗標

```typescript
let previousNumberIsOdd = nums[0] % 2 === 1;
```

### Step 2: 遍歷所有數字

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
