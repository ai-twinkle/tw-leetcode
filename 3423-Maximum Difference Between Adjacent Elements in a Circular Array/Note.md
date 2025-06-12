# 3423. Maximum Difference Between Adjacent Elements in a Circular Array

Given a circular array `nums`, find the maximum absolute difference between adjacent elements.

Note: In a circular array, the first and last elements are adjacent.

**Constraints:**

- `2 <= nums.length <= 100`
- `-100 <= nums[i] <= 100`

## 基礎思路

本題是一個典型的圓環陣列遍歷問題：我們需要在一次線性掃描中，計算陣列中每對相鄰元素的絕對差值，並考慮首尾相連的情況。
只要透過取餘運算 `(i + 1) % n` 處理圓環相鄰，便能在 $O(n)$ 時間內找到最大差值。

## 解題步驟

### Step 1：初始化與輔助變數

```typescript
// 取得陣列長度
const n = nums.length;
// 初始化最大差值
let maxDiff = 0;
```

### Step 2：遍歷所有相鄰元素並更新最大差值

```typescript
for (let i = 0; i < n; i++) {
  // 計算下一個索引（考慮圓環效果）
  const nextIndex = (i + 1) % n;
  // 計算當前與下一位置之間的絕對差值
  const diff = Math.abs(nums[i] - nums[nextIndex]);
  // 取最大值
  maxDiff = Math.max(maxDiff, diff);
}
```

### Step 3：回傳最終結果

```typescript
// 回傳最大相鄰絕對差值
return maxDiff;
```

## 時間複雜度

- 僅需對陣列做一次遍歷，內部操作為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的輔助變數，無額外動態配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
