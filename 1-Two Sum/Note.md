# 1. Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Constraints:**

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.

## 基礎思路

題目要求找出兩個陣列中的元素，使其總和為指定目標值 `target`，並回傳其索引。由於輸入保證只有一組正確答案，我們不需要處理多解或無解情況。

為了在 $O(n)$ 時間內完成，我們可以在遍歷陣列時，動態維護一個**值到索引的映射表**。
對每個當前元素 `value`，只要查詢 `target - value` 是否已出現過即可（即是否存在某前一個數加上 `value` 為 `target`）。

這樣，我們只需一次遍歷陣列，利用「一邊掃描、一邊查表」的方式，即可在 $O(n)$ 時間內找到答案。

## 解題步驟

### Step 1：宣告映射表作為輔助空間

使用 `Map<number, number>` 來建立一個從值到其最早出現索引的映射，這樣查找補數是否存在可達成 $O(1)$。

```typescript
// 建立從值映射至其最早出現位置的 Map
const indexByValue = new Map<number, number>();
```

### Step 2：單趟 for 迴圈處理每個元素

在這一步中，我們邊遍歷 `nums` 陣列，邊查表是否出現過目標補數（`target - value`）：

- 若有則立即回傳答案；
- 若沒有，則把當前值加入映射表中。

```typescript
// 單次遍歷：對每個值檢查其補數是否已出現
for (let index = 0; index < nums.length; index++) {
  const value = nums[index];
  const required = target - value;

  // 若補數已存在，代表找到正確配對，回傳兩個索引
  const complementIndex = indexByValue.get(required);
  if (complementIndex !== undefined) {
    return [complementIndex, index];
  }

  // 儲存目前值的索引，僅儲存第一次出現的位置以避免重複使用
  if (!indexByValue.has(value)) {
    indexByValue.set(value, index);
  }
}
```

### Step 3：安全保底回傳（理論上不會進入）

由於題目保證有解，我們不會真的執行到這一步，但為了完整性，仍然加入一個回傳空陣列的保底。

```typescript
// 題目保證有解，這是保險用的 fallback。
return [];
```

## 時間複雜度

- 單次遍歷陣列為 $O(n)$。
- 每次查表與插入 Map 為 $O(1)$（平均情況下）。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個映射表儲存最多 $n$ 筆資料。
- 總空間複雜度為 $O(n)$。

> $O(n)$
