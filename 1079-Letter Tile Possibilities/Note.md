# 1079. Letter Tile Possibilities

You have `n` `tiles`, where each tile has one letter `tiles[i]` printed on it.

Return the number of possible non-empty sequences of letters you can make using the letters printed on those `tiles`.

**Constraints:**

- `1 <= tiles.length <= 7`
- `tiles` consists of uppercase English letters.

## 基礎思路

這題的核心在於，給定一組**帶有重複字母**的瓷磚，計算所有**非空排列**的數量。
排列的長度不限，每個瓷磚只能用一次，但不同順序視為不同結果。

最直覺的方式是用 DFS（回溯法）暴力枚舉每一種長度、每種字母組合的所有排列，但即便 `tiles` 最長只有 7，總排列數仍可能爆炸性增長，因此需要更有效率的計數方法。

我們先考慮 DFS 的問題：

- 如果 tiles 全不同，答案就是 $2^n-1$ 個子集的全排列總數。
- 若 tiles 含重複字母，DFS 很難避免對同一字母組合的重複排列計算。

為避免重複計算，我們可以利用**生成函數**的組合技巧，將「各字母最多選幾個」的所有可能方案一次計算，然後用排列公式加總，快速得到最終答案。

### 數學原理

1. **單一字母的選取**
   若某字母 $L$ 共出現 $f$ 次，則這個字母的選法可用生成函數 $G\_L(x)$ 表示：

   $$
   G_L(x) = 1 + \frac{x}{1!} + \frac{x^2}{2!} + \cdots + \frac{x^f}{f!}
   $$

   - 分母的 $j!$ 是為了後續搭配排列公式，避免重複。

2. **多字母的合併**
   對所有字母，總生成函數為所有單字母生成函數的乘積：

   $$
   P(x) = \prod_{\text{letter } L} G_L(x)
   $$

   展開之後：

   $$
   P(x) = \sum_{k=0}^n a_k x^k
   $$

   - 其中 $n$ 為瓷磚總數，$a\_k$ 為選 $k$ 個瓷磚的所有方案的權重和。

3. **如何計算總排列數？**

  - 若選取方案為 $(c\_1, ..., c\_m)$，每種字母取 $c\_i$ 個，排列數為 $\frac{k!}{c\_1!c\_2!...c\_m!}$。
  - 生成函數中 $a\_k$ 累計的正好是所有選 $k$ 個字母的 $\frac{1}{c\_1!...c\_m!}$。
  - 所以總數就是 $k! \cdot a\_k$。
  - 最終答案為所有 $k \geq 1$ 的總和：

    $$
    \text{答案} = \sum_{k=1}^{n} k! \cdot a_k
    $$

## 解題步驟

### Step 1: 建立頻率表

在開始計算之前，我們需要先統計每個字母出現的頻率。這可以幫助我們知道每個字母最多能選幾次，進而建立每個字母的生成函數。

```typescript
// 建立一個雜湊表來統計每個字母的出現次數
const freq: { [letter: string]: number } = {};
for (const tile of tiles) {
  // 統計每個字母出現的頻率
  freq[tile] = (freq[tile] || 0) + 1;
}
const letters = Object.keys(freq); // 取出所有出現的字母
```

### Step 2: 建立生成函數並做多項式卷積

對於每個字母，我們建立一個生成函數 (多項式)，形式為  
$1 + \frac{x}{1!} + \frac{x^2}{2!} + \cdots + \frac{x^f}{f!}$  
其中 $f$ 為該字母的頻率。接著，透過多項式卷積將所有字母的生成函數合併，得到一個總多項式。

```typescript
// poly[k] 代表 x^k 的係數，初始多項式為 1，也就是 [1]
let poly: number[] = [1];

// 針對每個字母，建立其生成函數並與現有的 poly 進行卷積
for (const letter of letters) {
  const f = freq[letter];
  // 建立該字母的生成函數系列: series[j] = 1/j!  (j = 0...f)
  const series: number[] = [];
  let fact = 1;
  for (let j = 0; j <= f; j++) {
    // 當 j = 0 時，fact = 1 (0! = 1); 當 j >= 1 時，不斷更新 fact
    series.push(1 / fact);
    fact *= (j + 1);
  }

  // 與現有的 poly 進行卷積 (多項式相乘)
  // newPoly 的長度為 poly.length + f，初始值皆為 0
  const newPoly: number[] = new Array(poly.length + f).fill(0);
  for (let i = 0; i < poly.length; i++) {
    for (let j = 0; j < series.length; j++) {
      newPoly[i + j] += poly[i] * series[j];
    }
  }
  // 更新 poly 為卷積後的新多項式
  poly = newPoly;
}
```

### Step 3: 根據多項式係數計算排列數

展開後的多項式為：
$$ 
P(x) = \sum_{k=0}^{n} a_k \, x^k 
$$  
其中 $a_k$ 表示所有選取總共 $k$ 個字母的方式，且每種方式的權重為：
$$
\frac{1}{c_1! c_2! \cdots c_m!} 
$$
為了得到每個長度 $k$ 的排列數，需要將 $a_k$ 乘上 $k!$ (因為排列數為 $ \frac{k!}{c_1! \cdots c_m!} $)。

```typescript
// poly[k] = a_k = ∑ (1/(c1!*...*cm!))，其中選取的字母總數為 k
// 將每個係數乘上 k!，即可得到選取 k 個字母的排列數
let result = 0;
let factorial = 1;
for (let k = 1; k < poly.length; k++) {
  factorial *= k; // 累積計算 k! (注意 k 從 1 開始)
  result += poly[k] * factorial;
}
```

### Step 4: 回傳最終結果

最後，由於浮點數計算可能有些微誤差，使用 `Math.round` 來取整數後回傳。

```typescript
return Math.round(result);
```

## 時間複雜度
- **建立頻率表**
  - 遍歷 tiles 長度為 n 的字串，統計各字母頻率：$O(n)$。
- **多項式卷積設**
  - m 為不同字母的個數，每個字母 L 的出現次數為 $f_L$，則建立生成函數的長度為 $f_L+1$。  
    對於每個字母，我們將當前多項式 (長度會逐步增加) 與該字母的生成函數做卷積。  
    假設在處理第 i 個字母時，多項式長度為 $L_i$，那此步驟需要 $ O(L_i \times (f_i+1)) $ 的運算。  
    累計下來，總時間約為  

    $$
    O\Bigl(\sum_{i=1}^{m} L_i \cdot (f_i+1)\Bigr).
    $$

    在最壞情況下（例如所有字母皆不重複，此時 $m = n$ 且每個 $ f_i = 1 $），每次卷積的成本大約是  $ O(1 \times 2), O(2 \times 2), \ldots, O(n \times 2) $，累計約 $ O(n^2) $。  
    若以 m 與 n 表示，通常可視為 $O(n \times m)$，在最壞情況下 m = n，即 $O(n^2)$。
- **計算排列數**  
  - 最後遍歷多項式展開後的項（最多 n+1 項），計算每一項排列數： $O(n)$。
- 總時間複雜度為 $O(n \times m)$，最壞情況下 $m = n$ 時為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- **頻率表與字母集合**  
  - 儲存各字母及其頻率：$O(m)$，其中 $m \leq n$。
- **多項式 poly**  
  - 在卷積過程中，多項式的長度最多為 $ n+1 $（即選取 0 到 n 個字母）：$O(n)$。
- **其他輔助變數**  
  - 常數級別的額外空間：$O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
