# 1081. Smallest Subsequence of Distinct Characters

Given a string `s`, return the lexicographically smallest subsequence of `s` 
that contains all the distinct characters of `s` exactly once.

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consists of lowercase English letters.

## 基礎思路

本題要求從字串中挑選出一個子序列，使其包含所有**不同字元恰好一次**，且在所有合法結果中具備**字典序最小**的特性。由於每個字元僅能出現一次，我們需要在「保留必要字元」與「盡量讓前面的字元更小」之間取得平衡。

在思考解法時，可掌握以下核心觀察：

- **字典序最小的貪心特性**：
  越前面的位置對字典序的影響越大，因此應盡可能讓靠前的位置放置較小的字元，只要這樣做不會導致某些必要字元遺失。

- **後續是否還會出現決定可否捨棄**：
  當目前準備放入一個較小字元，而先前已放入的字元比它大時，若那個較大字元在後面仍會再次出現，則可以先捨棄它，等之後再補回，以換取更小的字典序。

- **每個字元僅能存在一次**：
  已經被選入結果的字元不需再次處理，必須避免重複加入。

- **單調堆疊維護結果順序**：
  結果本身可視為一個維持遞增傾向的堆疊，透過在放入新字元前彈出「較大且後續仍會出現」的字元，來確保最終結果的字典序最小。

依據以上特性，可以採用以下策略：

- **預先記錄每個字元最後出現的位置**，作為判斷該字元是否還能被捨棄的依據。
- **以單調堆疊逐一掃描字元**，遇到已在堆疊中的字元直接略過；否則在放入前彈出所有「較大且之後仍會出現」的字元。
- **最終依堆疊順序組合出結果字串**，即為字典序最小的合法子序列。

此策略透過一次線性掃描配合堆疊操作，即可在固定的字元集合空間內求得最佳解。

## 解題步驟

### Step 1：初始化基本參數與輔助資料結構

首先取得字串長度，並設定小寫字母 `'a'` 的字元碼偏移量，用以將字元映射至 0 至 25 的固定索引。同時建立記錄每個字元最後出現位置的陣列，以及標記字元是否已在堆疊中的陣列。

```typescript
const length = s.length;

// 小寫字母 'a' 的字元碼偏移量，用以索引固定大小為 26 的陣列
const charCodeOfA = 97;

// lastIndex[c] 儲存字元 c 最後出現的位置
const lastIndex = new Int16Array(26).fill(-1);

// inStack[c] 標記字元 c 目前是否存在於結果堆疊中
const inStack = new Uint8Array(26);
```

### Step 2：預先計算每個字元的最後出現位置

透過單次掃描，將每個字元最後出現的位置記錄下來，供後續判斷該字元之後是否仍會再次出現。

```typescript
// 以單次掃描預先計算每個字元的最後出現位置
for (let position = 0; position < length; position++) {
  lastIndex[s.charCodeAt(position) - charCodeOfA] = position;
}
```

### Step 3：建立堆疊並開始逐一掃描字元

使用一個型別化陣列作為堆疊儲存字元索引（最多 26 個不同字元）。接著逐一掃描每個字元，並將其轉換為對應的索引；若該字元已存在於堆疊中，則直接略過。

```typescript
// 型別化堆疊，儲存字元索引（0-25）；最多 26 個不同字元
const stack = new Uint8Array(26);
let stackSize = 0;

for (let position = 0; position < length; position++) {
  const currentChar = s.charCodeAt(position) - charCodeOfA;

  // 略過已放入結果中的字元
  if (inStack[currentChar] === 1) {
    continue;
  }

  // ...
}
```

### Step 4：彈出較大且後續仍會出現的字元

在放入目前字元前，檢查堆疊頂端的字元：若頂端字元比目前字元大，且它在之後仍會再次出現，則可將其彈出，以換取更小的字典序；反之則停止彈出。

```typescript
for (let position = 0; position < length; position++) {
  // Step 3：轉換字元索引並略過已在堆疊中的字元

  // 彈出較大且後續仍會出現的字元，以維持結果字典序最小
  while (stackSize > 0) {
    const topChar = stack[stackSize - 1];

    if (topChar <= currentChar || lastIndex[topChar] <= position) {
      break;
    }

    inStack[topChar] = 0;
    stackSize--;
  }

  // ...
}
```

### Step 5：將目前字元推入堆疊並標記

完成彈出後，將目前字元推入堆疊，並更新其在堆疊中的標記，表示該字元已被選入結果。

```typescript
for (let position = 0; position < length; position++) {
  // Step 3：轉換字元索引並略過已在堆疊中的字元

  // Step 4：彈出較大且後續仍會出現的字元

  stack[stackSize] = currentChar;
  stackSize++;
  inStack[currentChar] = 1;
}
```

### Step 6：依堆疊順序組合出最終結果字串

掃描結束後，依堆疊中儲存的字元索引順序，逐一還原為對應字元並串接，即為最終的字典序最小子序列。

```typescript
// 依累積的字元索引組合出最終字串
let result = "";

for (let index = 0; index < stackSize; index++) {
  result += String.fromCharCode(stack[index] + charCodeOfA);
}

return result;
```

## 時間複雜度

- 預先計算最後出現位置需掃描字串一次，為 $O(n)$；
- 主迴圈掃描每個字元一次，而每個字元至多被推入與彈出堆疊各一次，堆疊操作總計為 $O(n)$；
- 由於字元集合固定為 26，堆疊操作的常數上限亦受限；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小為 26 的輔助陣列（最後位置、堆疊標記、堆疊本身）；
- 結果字串長度至多為 26 個不同字元；
- 不隨輸入規模增長而擴張。
- 總空間複雜度為 $O(1)$。

> $O(1)$
