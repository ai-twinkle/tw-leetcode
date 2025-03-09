# 3208. Alternating Groups II

There is a circle of red and blue tiles. 
You are given an array of integers `colors` and an integer `k`. 
The color of tile `i` is represented by `colors[i]`:

- `colors[i] == 0` means that tile `i` is red.
- `colors[i] == 1` means that tile `i` is blue.

An alternating group is every `k` contiguous tiles in the circle with alternating colors 
(each tile in the group except the first and last one has a different color from its left and right tiles).

Return the number of alternating groups.

Note that since `colors` represents a circle, the first and the last tiles are considered to be next to each other.

## 基礎思路

我們可以利用一個單次循環遍歷的方法，持續更新記錄當前連續交替的圖磚數量。
由於陣列代表的是一個循環（即第一個和最後一個元素相鄰），我們必須模擬整個循環的情況。
因此，我們從索引 1 遍歷到 n + k - 1（其中 n 是陣列長度），確保所有可能形成長度為 k 的交替子序列都能被檢查到。

從索引 1 開始，我們將當前元素（使用 i % n 來處理循環情況）與前一個元素進行比較。
- 如果兩者的顏色不同，代表交替序列得以延續，此時將當前連續交替的圖磚數量增加 1；
- 反之，如果遇到相同的顏色，就表示交替序列中斷，此時重置當前連續交替的圖磚數量為 1，重新開始計數。

當當前連續交替的圖磚數量大於或等於 k 時，意味著從目前的位置向前數有一段至少包含 k 個連續交替的圖磚，這樣的子序列即構成一個有效的交替群組。
需要注意的是，由於我們在模擬循環，必須確保這個群組的起始位置仍在原始陣列內（透過檢查 (i - k + 1) < n）。

當滿足這個條件，就將有效群組的數量 groupCount 增加 1，當循環遍歷完成後，此時的 groupCount 即為最終答案。

## 解題步驟

### Step 1: 紀錄陣列長度

首先，我們需要紀錄陣列的長度，以便後續處理循環的情況。

```typescript
const n = colors.length;
```

### Step 2: 如果 k 為 1，直接返回陣列長度

如果 k 為 1，則任意一個圖磚都可以形成一個交替群組，因此直接返回陣列長度即可。

```typescript
if (k === 1) {
  return n;
}
```

### Step 3: 初始化變數

初始化變數 `alternatingCount` 和 `groupCount`，分別用於記錄當前連續交替的圖磚數量和有效的交替群組數量。

```typescript
let groupCount = 0;
let alternatingCount = 1;
```

### Step 4: 遍歷陣列

從索引 1 開始，遍歷到 n + k - 1，進行交替群組的檢查。
如果當前元素與前一個元素的顏色不同，則增加當前連續交替的圖磚數量；反之，重置當前連續交替的圖磚數量。
當當前連續交替的圖磚數量大於或等於 k 時，且起始位置仍在原始陣列內時，增加有效的交替群組數量。

```typescript
for (let i = 1; i < n + k - 1; i++) {
  if (colors[i % n] !== colors[(i - 1) % n]) {
    // 如果兩者的顏色不同，則增加當前連續交替的圖磚數量
    alternatingCount++;
  } else {
    // 反之，重置當前連續交替的圖磚數量
    alternatingCount = 1;
  }

  // 當當前連續交替的圖磚數量大於或等於 k 時，且起始位置仍在原始陣列內時，增加有效的交替群組數量
  if (alternatingCount >= k && (i - k + 1) < n) {
    groupCount++;
  }
}
```


## 時間複雜度

- 遍歷循環的時間從 `1` 遍歷到 `n+k−1` 的單一迴圈，其中 `n` 為陣列長度。且遍歷內部的操作都是常數時間的。故時間複雜度為 $O(n + k)$。
- 總時間複雜度為 $O(n + k)$。

> $O(n + k)$

## 空間複雜度

- 我們只使用了常數額外的空間，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
