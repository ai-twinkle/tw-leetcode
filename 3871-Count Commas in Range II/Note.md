# 3871. Count Commas in Range II

You are given an integer `n`.

Return the total number of commas used when writing all integers from `[1, n]` (inclusive) in standard number formatting.

In standard formatting:

- A comma is inserted after every three digits from the right.
- Numbers with fewer than 4 digits contain no commas.

**Constraints:**

- `1 <= n <= 10^15`

## 基礎思路

本題要求計算：將 `1` 到 `n` 之間的所有整數以標準千分位格式書寫時，總共會用到多少個逗號。由於上界可達 $10^{15}$，逐一列舉每個整數並計算其逗號數量顯然不可行，必須改以數學角度整體推導。

在思考解法時，可掌握以下核心觀察：

- **逗號數量僅取決於位數**：
  一個整數所含的逗號數等於其位數扣除一後除以三取整，也就是說，逗號的多寡與數值的具體內容無關，只與它跨越了哪些量級有關。

- **每個量級門檻各自貢獻一個逗號**：
  當一個整數達到千、百萬、十億等門檻時，就會比未達門檻者多出一個逗號。因此總逗號數可以拆解為「各個門檻分別被跨越的次數」之總和。

- **跨越次數等於區間長度**：
  對於某個特定門檻而言，所有大於等於該門檻且不超過上界的整數，都恰好因此門檻獲得一個逗號，其數量即為該區間內的整數個數。

- **門檻具有遞增性可提早終止**：
  由於各量級門檻由小到大排列，一旦上界低於某個門檻，便必然低於其後所有門檻，後續無須再檢查。

依據以上特性，可以採用以下策略：

- **預先列出所有會使數字增加一個逗號的量級門檻**。
- **對每個門檻累加其所涵蓋的整數個數，即為該門檻貢獻的逗號總量**。
- **一旦上界小於當前門檻即中止累加，避免多餘運算**。

此策略將逐一計數的問題轉化為少量的區間長度加總，能在常數時間內求得答案。

## 解題步驟

### Step 1：預先定義各量級的逗號門檻

先列出所有會使數字多出一個逗號的量級界線。由於其中的較大數值超出 32 位元整數範圍，需以雙精度浮點數形式儲存。

```typescript
/**
 * 預先計算好的 1000 次方門檻，數字達到這些門檻時會多出一個逗號。
 * 以雙精度浮點數儲存，因為 1e12 與 1e15 超出 32 位元整數範圍。
 */
const COMMA_THRESHOLDS = new Float64Array([1e3, 1e6, 1e9, 1e12, 1e15]);
```

### Step 2：初始化逗號累計總數

使用一個累加器記錄目前為止統計到的逗號總量，初始值為零。

```typescript
let totalCommas = 0;
```

### Step 3：逐一走訪各門檻並在超出範圍時提早終止

依序取出每個量級門檻；由於門檻由小到大排列，一旦上界已低於當前門檻，代表其後所有門檻皆不可能被跨越，可立即中止迴圈。

```typescript
for (let index = 0; index < COMMA_THRESHOLDS.length; index++) {
  const threshold = COMMA_THRESHOLDS[index];

  // 門檻為遞增排列，因此一旦 n 低於某個門檻，就必定低於其後所有門檻
  if (n < threshold) {
    break;
  }

  // ...
}
```

### Step 4：累加當前門檻所貢獻的逗號數量

通過門檻檢查後，該門檻與上界之間的所有整數都會因此門檻各獲得一個逗號，其數量即為此區間的整數個數，直接累加至總量。

```typescript
for (let index = 0; index < COMMA_THRESHOLDS.length; index++) {
  // Step 3：取出門檻並判斷是否提早終止

  // 位於 [threshold, n] 之間的每個整數，都因此門檻恰好貢獻一個逗號
  totalCommas += n - threshold + 1;
}
```

### Step 5：回傳統計結果

所有可能被跨越的門檻皆已處理完畢，累加器中的數值即為最終答案。

```typescript
return totalCommas;
```

## 時間複雜度

- 門檻數量由約束上界決定，最多僅有五個且為固定值；
- 每個門檻僅進行一次比較與一次加法，皆為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定長度的門檻表與少量純量變數；
- 未隨輸入規模配置任何額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
