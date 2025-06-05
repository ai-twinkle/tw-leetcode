# 1061. Lexicographically Smallest Equivalent String

You are given two strings of the same length `s1` and `s2` and a string `baseStr`.

We say `s1[i]` and `s2[i]` are equivalent characters.

- For example, if `s1 = "abc"` and `s2 = "cde"`, then we have `'a' == 'c'`, `'b' == 'd'`, and `'c' == 'e'`.

Equivalent characters follow the usual rules of any equivalence relation:

- Reflexivity: `'a' == 'a'`.
- Symmetry: `'a' == 'b'` implies `'b' == 'a'`.
- Transitivity: `'a' == 'b'` and `'b' == 'c'` implies `'a' == 'c'`.

For example, given the equivalency information from `s1 = "abc"` and `s2 = "cde"`, `"acd"` and `"aab"` are equivalent strings of `baseStr = "eed"`, 
and `"aab"` is the lexicographically smallest equivalent string of `baseStr`.

Return the lexicographically smallest equivalent string of `baseStr` by using the equivalency information from `s1` and `s2`.

**Constraints:**

- `1 <= s1.length, s2.length, baseStr <= 1000`
- `s1.length == s2.length`
- `s1`, `s2`, and `baseStr` consist of lowercase English letters.

## 基礎思路

本題的核心在於處理「等價」字元之間的關係，並利用這些關係找出對應於給定字串 `baseStr` 的字典序最小等價字串。
因此我們可以採用 **聯集-查找（Union-Find）** 資料結構，快速管理並追蹤等價字母的群組：

- **聯集（Union）**：將兩個字母設定為等價，確保字典序較小的字母作為該群組的代表。
- **查找（Find）**：對於任意字母，快速找到其所在群組的最小代表。

透過這種方式，每個字母所在的群組都會有最小的字母代表。
我們最終只需遍歷 `baseStr`，透過查找找到對應的最小代表字母，組成新的字串即為答案。

## 解題步驟

### Step 1：建立 Union-Find 類別

首先，我們需要建立一個 `UnionFind` 類別來管理字母之間的聯集關係。這個類別將包含以下方法：

```typescript
class UnionFind {
  private readonly parent: Uint8Array;

  constructor() {
    // 初始化 parent[i] = i，i 範圍 [0..25]
    this.parent = new Uint8Array(26);
    for (let index = 0; index < 26; index++) {
      this.parent[index] = index;
    }
  }

  /**
   * 使用路徑壓縮的 find。
   * @param {number} elementIndex 數字，範圍在 [0..25]
   * @returns {number} 回傳這個元素的根節點索引
   */
  public find(elementIndex: number): number {
    if (this.parent[elementIndex] !== elementIndex) {
      this.parent[elementIndex] = this.find(this.parent[elementIndex]);
    }
    return this.parent[elementIndex];
  }

  /**
   * 合併兩個索引 [0..25]，並且總是將數值較大的根節點掛到數值較小的根節點下。
   * @param {number} elementIndex1 數字，範圍在 [0..25]
   * @param {number} elementIndex2 數字，範圍在 [0..25]
   */
  public union(elementIndex1: number, elementIndex2: number): void {
    const rootIndex1 = this.find(elementIndex1);
    const rootIndex2 = this.find(elementIndex2);
    if (rootIndex1 === rootIndex2) {
      return;
    }
    // 總是保留數值較小的根節點當作父節點
    if (rootIndex1 < rootIndex2) {
      this.parent[rootIndex2] = rootIndex1;
    } else {
      this.parent[rootIndex1] = rootIndex2;
    }
  }
}
```

### Step 2：初始化 Union-Find 結構

先建立一個 `UnionFind` 物件，透過陣列儲存每個字母的父節點：

```typescript
const unionFinder = new UnionFind();
```

### Step 3：根據給定的等價字串建立聯集

遍歷 `s1` 和 `s2`，逐一將相同索引的字母合併到同一群組：

```typescript
for (let i = 0; i < s1.length; i++) {
  const letterIndex1 = s1.charCodeAt(i) - 97;    // 字母轉為 0~25 索引
  const letterIndex2 = s2.charCodeAt(i) - 97;
  unionFinder.union(letterIndex1, letterIndex2); // 合併兩字母的群組
}
```

### Step 4：依據群組代表建構最小等價字串

最後遍歷 `baseStr` 中每個字元，透過 Union-Find 找到其群組的最小代表，組合成結果字串：

```typescript
let result = '';
for (const char of baseStr) {
  const originalIndex = char.charCodeAt(0) - 97;     // 取得當前字母索引
  const rootIndex = unionFinder.find(originalIndex); // 找出群組代表
  result += String.fromCharCode(rootIndex + 97);     // 轉回字母並加入結果字串
}

return result;
```

## 時間複雜度

- 需要遍歷一次 `s1` 與 `s2` 字串，進行聯集操作，花費 $O(m \cdot \alpha(26))$。
- 需要遍歷一次 `baseStr` 字串，進行查找操作，花費 $O(n \cdot \alpha(26))$。
- 由於字母只有 26 個，因此 $\alpha(26)$ 可視為常數。
- 總時間複雜度為 $O(m + n)$。

> $O(m+n)$

## 空間複雜度

- 使用一個固定大小的 `Uint8Array`，大小為 26，因此此部分為常數空間 $O(1)$。
- 使用了額外的結果字串，長度與輸入字串 `baseStr` 相同，因此需要額外 $O(n)$ 空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
