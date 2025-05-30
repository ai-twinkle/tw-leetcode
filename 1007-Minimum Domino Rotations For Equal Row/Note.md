# 1007. Minimum Domino Rotations For Equal Row

In a row of dominoes, `tops[i]` and `bottoms[i]` represent the top and bottom halves of the $i^{th}$ domino. 
(A domino is a tile with two numbers from 1 to 6 - one on each half of the tile.)

We may rotate the $i^{th}$ domino, so that `tops[i]` and `bottoms[i]` swap values.

Return the minimum number of rotations so that all the values in `tops` are the same, 
or all the values in `bottoms` are the same.

If it cannot be done, return `-1`.

**Constraints:**

- `2 <= tops.length <= 2 * 10^4`
- `bottoms.length == tops.length`
- `1 <= tops[i], bottoms[i] <= 6`

## 基礎思路

本題要求透過旋轉骨牌，使骨牌頂部 (`tops`) 或底部 (`bottoms`) 的數字全部一致，並且求得最小旋轉次數。

我們觀察到：

* 若要成功將骨牌統一，最終統一的數字必定來自於首張骨牌，即只能為 `tops[0]` 或 `bottoms[0]`。
* 對每個候選數字，我們遍歷所有骨牌，統計頂部或底部需旋轉的次數：

    * 若某張骨牌上下皆無法與候選數字配對，即表示該候選無法實現。
    * 否則，統計需旋轉頂部或底部的最小次數。
* 透過分別計算這兩個候選數字的旋轉次數，取最小值作為答案；若皆無法達成則回傳 `-1`。

## 解題步驟

### Step 1: 初始化候選目標值

從第一張骨牌取頂部與底部數字作為候選目標：

```typescript
const candidates = [tops[0], bottoms[0]];
```

### Step 2: 計算最小旋轉次數

定義輔助函式 `rotations(target: number)`，計算將所有骨牌變為指定數字所需的最小旋轉次數：

```typescript
function rotations(target: number): number {
  let rotateTop = 0;      // 頂部旋轉次數
  let rotateBottom = 0;   // 底部旋轉次數

  for (let i = 0; i < tops.length; i++) {
    // 若上下皆無法匹配 target，代表該 target 無法實現
    if (tops[i] !== target && bottoms[i] !== target) {
      return Infinity;
    }

    // 若頂部不等於 target，需旋轉頂部一次
    if (tops[i] !== target) {
      rotateTop++;
    }

    // 若底部不等於 target，需旋轉底部一次
    if (bottoms[i] !== target) {
      rotateBottom++;
    }
  }

  // 返回頂部或底部旋轉次數較小者
  return Math.min(rotateTop, rotateBottom);
}
```

### Step 3: 計算並返回答案

使用候選數字分別呼叫 `rotations` 函式，取較小值作為答案：

```typescript
const result = Math.min(rotations(candidates[0]), rotations(candidates[1]));
return result === Infinity ? -1 : result;
```

## 時間複雜度

- 每次 `rotations` 呼叫皆需遍歷所有骨牌，長度為 $n$，共計執行 $2$ 次，因此總時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 程式中僅使用少數常數級別輔助變數（如計數器），不額外佔用與輸入相關的空間。
- 總空間複雜度為 $O(1)$

> $O(1)$
