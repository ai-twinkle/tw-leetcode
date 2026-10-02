# 22. Generate Parentheses

Given `n` pairs of parentheses, 
write a function to generate all combinations of well-formed parentheses.

**Constraints:**

- `1 <= n <= 8`

## 基礎思路

本題要求產生所有由指定對數括號構成的合法組合。
由於合法性具有嚴格的前綴性質，與其先窮舉所有排列再逐一驗證，不如在建構過程中就只走合法的分支，避免任何無效嘗試。

在思考解法時，可掌握以下核心觀察：

- **合法性可在前綴階段判定**：
  一個合法組合的任意前綴，其右括號數量永遠不會超過左括號數量；因此只要維持此不變量，就能保證過程中不會產生非法狀態。

- **狀態僅需兩個計數即可描述**：
  在建構過程中，真正決定後續可行動作的，只有「已使用的左括號數」與「尚未配對的左括號數」；前者限制還能否再開新括號，後者限制能否收尾。

- **終止條件可由長度直接判斷**：
  組合的總長度等於對數的兩倍，因此只需追蹤已放置的字元數即可判定是否完成，無需反覆量測當前內容。

- **輸入範圍極小且答案固定**：
  對數的上限很小，且相同對數對應的答案集合永遠不變，因此同一個對數的結果只需計算一次，之後重複查詢皆可直接取用。

依據以上特性，可以採用以下策略：

- **以回溯法逐字元擴展合法前綴**，每一步僅嘗試仍滿足不變量的選擇，確保搜尋樹中不含任何無效節點。
- **以計數器取代字串量測來判斷終止與分支條件**，降低每個節點的常數成本。
- **在函數外部保留一份依對數索引的結果快取**，使每個對數至多只被完整列舉一次。

此策略能在不產生任何非法中間狀態的前提下枚舉全部答案，並讓重複查詢退化為一次陣列存取。

## 解題步驟

### Step 1：預先定義上限常數與結果快取

依據約束條件定義括號對數的上限，並在函數外部建立一份以對數為索引的快取陣列，使同一個對數在整個執行期間至多只被列舉一次。

```typescript
const MAXIMUM_PAIR_COUNT = 8;

// 答案被快取在函數外部，因此每個括號對數在單次執行中至多只會被產生一次
const COMBINATION_CACHE: string[][] = new Array(MAXIMUM_PAIR_COUNT + 1);
```

### Step 2：建立列舉函數並初始化總長度與結果容器

此輔助函數負責列舉單一對數下的所有合法組合。進入後先計算完整組合應有的總長度（對數的兩倍），並準備收集結果的容器。

```typescript
/**
 * 列舉某個特定括號對數下的所有合法組合。
 *
 * @param pairCount 要放置的括號對數。
 * @returns 由恰好 `pairCount` 對括號構成的所有合法組合。
 */
function buildCombinationsForPairCount(pairCount: number): string[] {
  const totalLength = pairCount << 1;
  const combinations: string[] = [];

  // ...
}
```

### Step 3：定義遞迴擴展函數並處理完成條件

在列舉函數內定義遞迴擴展的內部函數，其參數同時攜帶目前前綴、已放置字元數、已使用的左括號數與尚未配對的左括號數。每次進入時先判斷是否已達總長度，若是則代表前綴已成為一個完整且合法的組合，收錄後即可返回。

```typescript
function buildCombinationsForPairCount(pairCount: number): string[] {
  // Step 2：初始化總長度與結果容器

  /**
   * 將合法前綴逐字元擴展，直到形成完整組合。
   *
   * @param prefix 目前已構築的合法前綴。
   * @param placedLength 前綴中已放置的字元數量。
   * @param openCount 已放置的 '(' 數量。
   * @param unclosedCount 仍在等待配對的 '(' 數量。
   */
  function extendPrefix(
    prefix: string,
    placedLength: number,
    openCount: number,
    unclosedCount: number,
  ): void {
    // 以計數已放置字元的方式判斷，可避免在每個葉節點重新讀取字串長度
    if (placedLength === totalLength) {
      combinations.push(prefix);
      return;
    }

    // ...
  }

  // ...
}
```

### Step 4：依不變量展開左括號與右括號兩個分支

尚未完成時，分別嘗試兩種合法的延伸方式：只要左括號的配額尚未用盡，即可再放置一個左括號；只要仍有未被配對的左括號，即可放置一個右括號。兩個條件都滿足不變量，因此不會產生任何非法前綴。

```typescript
function buildCombinationsForPairCount(pairCount: number): string[] {
  // Step 2：初始化總長度與結果容器

  function extendPrefix(
    prefix: string,
    placedLength: number,
    openCount: number,
    unclosedCount: number,
  ): void {
    // Step 3：判斷是否已形成完整組合

    // 只要括號對數的配額尚未用盡，放置左括號即為合法
    if (openCount < pairCount) {
      extendPrefix(prefix + '(', placedLength + 1, openCount + 1, unclosedCount + 1);
    }

    // 只有在仍存在未配對的左括號時，放置右括號才合法
    if (unclosedCount > 0) {
      extendPrefix(prefix + ')', placedLength + 1, openCount, unclosedCount - 1);
    }
  }

  // ...
}
```

### Step 5：由空前綴啟動遞迴並回傳列舉結果

內部函數定義完成後，以空前綴與全為零的計數作為起點啟動遞迴；遞迴結束時所有合法組合皆已收錄於容器中，直接回傳。

```typescript
function buildCombinationsForPairCount(pairCount: number): string[] {
  // Step 2：初始化總長度與結果容器

  // Step 3：定義遞迴擴展函數並處理完成條件

  // Step 4：展開左括號與右括號兩個分支

  extendPrefix('', 0, 0, 0);

  return combinations;
}
```

### Step 6：優先查詢快取以避免重複列舉

主流程進入後先以對數為索引查詢快取；若先前已計算過該對數的答案，則直接回傳，使重複查詢退化為單次陣列存取。

```typescript
const cachedCombinations = COMBINATION_CACHE[n];

// 對同一個括號對數的重複查詢，只需一次陣列存取即可解決
if (cachedCombinations !== undefined) {
  return cachedCombinations;
}
```

### Step 7：首次查詢時進行列舉、寫入快取並回傳

若快取中尚無結果，則呼叫列舉函數完整產生答案，將其寫回快取後回傳，使後續的相同查詢都能命中快取。

```typescript
const combinations = buildCombinationsForPairCount(n);
COMBINATION_CACHE[n] = combinations;

return combinations;
```

## 時間複雜度

- 搜尋過程中的每個節點都滿足合法前綴的不變量，因此不存在無效分支，葉節點數量即為合法組合數，約為第 $n$ 個卡塔蘭數 $\frac{4^n}{n^{1.5}}$ 等級；
- 每個葉節點需構築並收錄一個長度為 $2n$ 的字串，故需額外乘上 $O(n)$；
- 快取使後續相同對數的查詢降為 $O(1)$，但首次計算的成本仍為主導；
- 總時間複雜度為 $O\left(\frac{4^n}{\sqrt{n}}\right)$。

> $O\left(\frac{4^n}{\sqrt{n}}\right)$

## 空間複雜度

- 遞迴深度最多為 $2n$，每層保存長度不超過 $2n$ 的前綴，故遞迴堆疊佔用 $O(n^2)$；
- 快取與結果容器需保存全部合法組合，每個長度為 $2n$，共佔用 $O\left(\frac{4^n}{\sqrt{n}}\right)$；
- 輸出規模為主導項，總空間複雜度為 $O\left(\frac{4^n}{\sqrt{n}}\right)$。

> $O\left(\frac{4^n}{\sqrt{n}}\right)$
