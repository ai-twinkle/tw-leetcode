# 1079. Letter Tile Possibilities

You have `n` `tiles`, where each tile has one letter `tiles[i]` printed on it.

Return the number of possible non-empty sequences of letters you can make using the letters printed on those `tiles`.

**Constraints:**

- `1 <= tiles.length <= 7`
- `tiles` consists of uppercase English letters.

## 基礎思路

我們有一個字串 `tiles`，裡面的每個字母可以看作一個「瓷磚」，可能有重複。
目標是求出所有**非空**排列（順序不同即視為不同）數量。
一開始我是使用傳統的深度優先搜尋 (DFS) ，但這需要枚舉大量排列，效率很低。
但是我們仔細觀測，我們其實可以用數學方法一次性整合計算所有可能性。


### 這題背後的數學原理

在這個題目我們可以使用生成函數（generating function）來解決。
生成函數是一種強大的數學工具，可以將一個數列轉換為多項式或冪級數。
這裡我們利用生成函數來表示「從每個字母中選取多少個」這個決策。

### (1) 每個字母的選擇

假設某個字母 $L$ 在字串中出現 $f$ 次，那麼對於這個字母，我們可以選擇 0 個、1 個、……、最多 $f$ 個。這種選擇可以用下面的多項式表示：

$$
G_L(x) = 1 + \frac{x}{1!} + \frac{x^2}{2!} + \cdots + \frac{x^f}{f!}.
$$

- **為什麼要除以 $j!$**？  
  當我們最終計算排列數時，排列公式會用到分母的 $c_i!$（這裡 $c_i$ 是選取的個數），除以 $j!$ 正好在最後乘上 $k!$（總選取數的階乘）時抵消，避免重複計算同一組數字的排列數。

### (2) 合併所有字母的情況

對於多個不同的字母，每個字母的選擇都是獨立的，所以總的生成函數為所有單個生成函數的乘積：

$$
P(x) = \prod_{\text{letter } L} G_L(x) = \prod_{\text{letter } L}\left( 1 + \frac{x}{1!} + \frac{x^2}{2!} + \cdots + \frac{x^{f_L}}{f_L!} \right).
$$

展開這個乘積，多項式可以寫成：

$$
P(x) = \sum_{k=0}^{n} a_k\, x^k,
$$

其中：
- $n$ 為所有字母的總數（即最大可能選取的瓷磚數）。
- $a_k$ 是 $x^k$ 項的係數，它累計了所有選取總數為 $k$ 的情況，具體來說：

  $$
  a_k = \sum_{\substack{(c_1, c_2, \ldots, c_m) \\ c_1+c_2+\cdots+c_m=k}} \frac{1}{c_1! c_2! \cdots c_m!},
  $$

  其中 $c_i$ 表示從第 $i$ 種字母中選取的個數（且 $c_i \leq f_i$）。

---

### 從生成函數求出排列數

對於一個固定的選取方案：如果從各個字母分別選取了 $c_1, c_2, \ldots, c_m$ 個，總共選了 $k = c_1+c_2+\cdots+c_m$ 個字母，這 $k$ 個字母的不同排列數是：

$$
\frac{k!}{c_1! c_2! \cdots c_m!}.
$$

而在我們的生成函數中，對應的權重為 $\frac{1}{c_1! c_2! \cdots c_m!}$。因此，對於所有選取了 $k$ 個字母的情況，總排列數就可以表示為：

$$
k! \times a_k,
$$

也就是說，先求出生成函數中 $x^k$ 的係數 $a_k$，再乘上 $k!$ 就得到了長度為 $k$ 的排列數。

最終答案就是將 $k$ 從 1 到 $n$（非空選取，所以 $k \ge 1$）的排列數相加：

$$
\text{答案} = \sum_{k=1}^{n} k! \cdot a_k.
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
