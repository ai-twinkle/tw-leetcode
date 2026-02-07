# 1653. Minimum Deletions to Make String Balanced

You are given a string `s` consisting only of characters `'a'` and `'b'`.

You can delete any number of characters in `s` to make `s` balanced. 
`s` is balanced if there is no pair of indices `(i,j)` such that `i < j` and `s[i] = 'b'` and `s[j]= 'a'`.

Return the minimum number of deletions needed to make `s` balanced.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is `'a'` or `'b'`.

## 基礎思路

本題要把只含 `'a'`、`'b'` 的字串，刪到「平衡」：不存在 `i < j` 且 `s[i] = 'b'`、`s[j] = 'a'` 的情況。換句話說，平衡字串必須呈現 **所有 `'a'` 在前、所有 `'b'` 在後** 的型態（不一定要連續，但相對順序需符合）。

要達到最少刪除次數，可以從左到右掃描字串，維持一個「目前掃描到這裡為止，已經能讓前綴平衡的最少刪除數」。當遇到：

* `'b'`：它放在前面不會立刻違反平衡，但若後面出現 `'a'` 就會形成衝突，因此需要記錄目前已看過多少個 `'b'`，作為未來可能要刪掉的候選成本。
* `'a'`：此時若前面曾出現 `'b'`，就會產生衝突。要消除衝突只有兩種高階選擇：

  1. 刪掉這個 `'a'`（成本：目前最少刪除數 + 1）
  2. 刪掉前面所有 `'b'`（成本：目前累積看過的 `'b'` 數量）

每次遇到 `'a'` 就在這兩種策略中取最小值，持續更新即可得到全域最小刪除次數。此策略只需單次線性掃描，且使用常數額外空間。

## 解題步驟

### Step 1：初始化掃描狀態

先取得字串長度，並準備兩個狀態量：

* `countOfB`：目前為止看過的 `'b'` 數量（作為「若要刪前面所有 b」的成本）
* `minimumDeletionsSoFar`：目前前綴已達平衡所需的最少刪除數

```typescript
const length = s.length;

let countOfB = 0;
let minimumDeletionsSoFar = 0;
```

### Step 2：建立主迴圈骨架並取得當前字元

用單一 `for` 從左到右掃描，每次取出字元的 ASCII code 以判斷是 `'a'` 或 `'b'`。

```typescript
for (let index = 0; index < length; index++) {
  const code = s.charCodeAt(index);

  // ...
}
```

### Step 3：遇到 `'b'` 時累積可刪除候選數量

當字元是 `'b'`（ASCII 98）時，更新 `countOfB`。
此時不需要更新 `minimumDeletionsSoFar`，因為 `'b'` 放在前綴內仍可能在後續透過刪除解決。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立主迴圈骨架並取得當前字元

  if (code === 98) {
    // 紀錄目前看過多少個 'b'（若後面出現 'a'，這些 'b' 可能需要被刪除）
    countOfB++;
  } else {
    // ...
  }
}
```

### Step 4：遇到 `'a'` 時在兩種刪除策略中取最小

當字元不是 `'b'`（本題只會是 `'a'`），表示可能與前面的 `'b'` 形成違規。
此時有兩種互斥策略：

* `deleteThisA`：刪掉這個 `'a'`，成本為 `minimumDeletionsSoFar + 1`
* `deletePreviousBs`：刪掉前面所有 `'b'`，成本為 `countOfB`

取兩者最小值更新 `minimumDeletionsSoFar`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：建立主迴圈骨架並取得當前字元

  if (code === 98) {
    // Step 3：遇到 'b' 時累積可刪除候選數量
  } else {
    // 對於 'a'：要嘛刪掉此 'a'（+1），要嘛刪掉前面所有 'b'（countOfB）
    const deleteThisA = minimumDeletionsSoFar + 1;
    const deletePreviousBs = countOfB;

    minimumDeletionsSoFar = deleteThisA < deletePreviousBs ? deleteThisA : deletePreviousBs;
  }
}
```

### Step 5：回傳全字串最少刪除數

掃描完成後，`minimumDeletionsSoFar` 即為讓整個字串平衡的最少刪除次數。

```typescript
return minimumDeletionsSoFar;
```

## 時間複雜度

- 主迴圈掃描字串一次，迭代次數為 `n = s.length`。
- 每次迭代只做常數次操作（字元判斷、加法、比較、指定）。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數（`length`、`countOfB`、`minimumDeletionsSoFar`、迴圈索引與暫存 `code`）。
- 不隨 `n` 增長配置額外結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
