# 3105. Longest Strictly Increasing or Strictly Decreasing Subarray

You are given an array of integers `nums`. Return the length of the longest subarray of `nums` 
which is either strictly increasing or strictly decreasing.

**Constraints:**

- `1 <= nums.length <= 50`
- `1 <= nums[i] <= 50`

## 基礎思路

我們可以觀察兩個元素之間差異，來決定趨勢，趨勢共有三種可能:
- 變換趨勢: 重置長度為 2 (因為檢測到趨勢變換時已經有兩個元素)
- 維持趨勢: 此時將當前趨勢長度加一即可
- 保持不變: 當數字相同時，我們需要紀錄當前長度為 1 (因為題目要求嚴格遞增或遞減)

## 解題步驟

### Step 1: 初始化變數

```typescript
const n = nums.length;

let maxLength = 1;
let currentLength = 1;
// 當前 subarray 的趨勢
// 1 代表遞增
// -1 代表遞減
// 0 代表無趨勢 (或重置)
let currentType = 0;
```

### Step 2: 迭代數組

```typescript
for (let i = 1; i < n; i++) {
  const different = nums[i] - nums[i - 1];
  // 檢查趨勢類型
  const newType = different > 0 ? 1 : different < 0 ? -1 : 0;

  if (newType === 0) {
    // 當前元素與前一個元素相同，重置 subarray 長度為 1
    currentLength = 1;
    currentType = 0;
  } else if (newType === currentType) {
    // 當前元素與前一個元素趨勢相同，增加 subarray 長度
    currentLength++;
  } else {
    // 當前元素與前一個元素趨勢不同，重置 subarray 長度為 2，開始新的 subarray 計算
    currentLength = 2;
    currentType = newType;
  }

  // 更新最大長度
  if (currentLength > maxLength) {
    maxLength = currentLength;
  }
}
```

### Step 3: 返回結果

```typescript
return maxLength;
```

## 時間複雜度

- 計算趨勢的時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 僅使用常數空間
- 總空間複雜度為 $O(1)$

> $O(1)$
