# 1128. Number of Equivalent Domino Pairs

Given a list of `dominoes`, `dominoes[i] = [a, b]` is equivalent to `dominoes[j] = [c, d] `
if and only if either (`a == c` and `b == d`), or (`a == d` and `b == c`) - that is, one domino can be rotated to be equal to another domino.

Return the number of pairs `(i, j)` for which `0 <= i < j < dominoes.length`, 
and `dominoes[i]` is equivalent to `dominoes[j]`.

**Constraints:**

- `1 <= dominoes.length <= 4 * 10^4`
- `dominoes[i].length == 2`
- `1 <= dominoes[i][j] <= 9`

## 基礎思路

題目要求計算一個陣列中等價的骨牌對數量，其中任意兩個骨牌 `[a, b]` 和 `[c, d]` 若滿足以下條件則視為等價：

* `(a == c 且 b == d)` 或 `(a == d 且 b == c)`。

由於骨牌兩端的數字範圍皆為 $1$ 到 $9$，我們可以將每個骨牌轉換成一個唯一的數值來表示：

* 為了確保兩個數字順序無關，我們固定將較小數字放置在十位數，較大數字放置在個位數。
* 例如骨牌 `[2, 5]` 和 `[5, 2]` 都會被表示為整數 `25`。

接著，我們只要計算每個相同表示數值的骨牌出現的次數，就能利用組合數學求出總對數。

為了進一步節省時間，我們觀察約束條件，發現所有骨牌的數字範圍皆在 $1$ 到 $9$ 之間，因此我們可以將每個骨牌的表示數值映射到一個範圍為 $11$ 到 $99$ 的整數。
這樣就能使用固定長度的 Typed Array 來記錄每個骨牌表示數值的出現次數，獲得較快的查詢速度。

## 解題步驟

### Step 1：初始化與資料結構

我們使用一個長度為 $100$ 的 `Uint16Array` 陣列來記錄每個骨牌表示數值的出現次數（因為所有數值介於 `11` 到 `99` 之間）：

```typescript
// 初始化一個 Uint16Array 陣列來記錄每個骨牌表示數值的出現次數
const countByKey = new Uint16Array(100);
let totalEquivalentPairs = 0;
const length = dominoes.length;
```

### Step 2：遍歷每個骨牌並計算對數

接下來，我們遍歷整個骨牌陣列，對每個骨牌執行以下操作：

- **取得骨牌兩端數字**

- **決定數字的大小順序並產生鍵值**：

    固定將較小數字放在前方（十位），較大數字放在後方（個位），產生唯一的鍵值：

- **更新總對數並記錄此骨牌出現次數**：

    若過去已有相同鍵值的骨牌，每次新的出現皆會形成新的骨牌對，因此可直接累加：

```typescript
for (let i = 0; i < length; i++) {
  // 取得骨牌兩端數字
  const firstValue = dominoes[i][0];
  const secondValue = dominoes[i][1];

  // 決定數字順序，小數放前，大數放後
  const minValue = firstValue < secondValue ? firstValue : secondValue;
  const maxValue = firstValue < secondValue ? secondValue : firstValue;

  // 產生鍵值
  const key = minValue * 10 + maxValue; // key 的範圍從 11 到 99 

  // 每當看到已經出現過的鍵值時，表示可新增對數
  totalEquivalentPairs += countByKey[key];

  // 記錄此鍵值出現次數
  countByKey[key]++;
}
```

### Step 3：返回最終結果

經過上述處理，`totalEquivalentPairs` 即為最終結果：

```typescript
return totalEquivalentPairs;
```

## 時間複雜度

- **單一迴圈遍歷**：僅需遍歷一次骨牌陣列，每次操作時間複雜度為常數 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **countByKey 陣列**：固定大小為 $100$，為常數空間。
- **其他變數**：僅使用常數空間儲存臨時變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
