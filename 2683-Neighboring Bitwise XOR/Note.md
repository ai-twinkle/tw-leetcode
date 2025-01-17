# 2683. Neighboring Bitwise XOR

A 0-indexed array derived with length n is derived by computing the bitwise XOR (⊕) of adjacent values in a binary array original of length n.

Specifically, for each index i in the range [0, n - 1]:

* If i = n - 1, then derived[i] = original[i] ⊕ original[0].
* Otherwise, derived[i] = original[i] ⊕ original[i + 1].

Given an array derived, your task is to determine whether there exists a valid binary array original that could have formed derived.

Return true if such an array exists or false otherwise.

* A binary array is an array containing only 0's and 1's

## 基本思路

我們可以換個角度思考這個問題：相鄰值的 XOR 值 表示 `original` 陣列中該位置的兩個元素是否相同。

- 若 XOR 值為 `0`，則這兩個元素相同。
- 若 XOR 值為 `1`，則這兩個元素不同。

因此，對於輸入的 `derived` 陣列：
- 值為 `1` 表示 `original` 陣列在下一個位置需要進行"反轉"。
- 值為 `0` 表示不需要反轉。

由於這是一個環形陣列，元素經過 "反轉" k 次後必須保持相符才能「閉環」。也就是說：
- 如果反轉次數 k（`derived` 中值為 `1` 的總數）是偶數，則可以構造出有效的 `original` 陣列。
- 如果反轉次數 k 是奇數，則不可能構造出有效的 `original` 陣列。

### 範例

1. 輸入: `[1, 1, 0]`
    - 總反轉次數：2 次（偶數）
    - 結果: 有解

2. 輸入: `[1, 1]`
    - 總反轉次數：2 次（偶數）
    - 結果: 有解

3. 輸入: `[1, 0]`
    - 總反轉次數：1 次（奇數）
    - 結果: 無解

## 解題步驟

### Step 1: 計算 `derived` 執行 "反轉" 的次數

```typescript
let count = 0;
for (const x of derived) {
  if (x === 1) {
    count++;
  }
}
```

### Step 2: 判斷是否有解

```typescript
return count % 2 === 0;
```

### Step 3: 化簡

```typescript
return derived.filter(x => x === 1).length % 2 === 0;
```

> 備註: 這邊會使空間複雜度增加成 $O(n)$，因為 `filter` 會產生一個新陣列佔用額外空間。

## 時間複雜度
由於需要遍歷 `derived` 陣列，因此時間複雜度為 O(n)。`n` 表示 `derived` 陣列的長度。

> $O(n)$

## 空間複雜度
需要一個變數 `count` 來計算反轉次數，因此空間複雜度為 O(1)。

> $O(1)$
