# 2213. Longest Substring of One Repeating Character

You are given a 0-indexed string `s`. 
You are also given a 0-indexed string `queryCharacters` of length `k` 
and a 0-indexed array of integer indices queryIndices of length `k`, both of which are used to describe `k` queries.

The $i^{th}$ query updates the character in `s` at index `queryIndices[i]` to the character `queryCharacters[i]`.

Return an array `lengths` of length `k` 
where `lengths[i]` is the length of the longest substring of `s` consisting of only one repeating character 
after the $i^{th}$ query is performed.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
- `k == queryCharacters.length == queryIndices.length`
- `1 <= k <= 10^5`
- `queryCharacters` consists of lowercase English letters.
- `0 <= queryIndices[i] < s.length`

## 基礎思路

本題要求在字串上反覆執行單點字元修改，並在每次修改後回報「僅由單一重複字元組成的最長子字串」長度。
由於字串長度與查詢次數皆可達 $10^5$，若每次查詢都重新掃描整個字串，總成本將達到平方級別而無法接受。

在思考解法時，可掌握以下核心觀察：

- **答案具有可合併性**：
  一個區間的最長同字元連續段，只可能來自左半段、右半段，或**橫跨兩者交界**的那一段。因此只要額外記錄邊界資訊，兩個相鄰區間的答案即可在常數時間內合併。

- **邊界資訊即為前綴與後綴的連續段**：
  要判斷交界處能否延伸，必須知道左半段結尾的連續段長度與其字元，以及右半段開頭的連續段長度與其字元。這兩組資訊本身同樣具備可合併性。

- **前綴（後綴）跨界的條件是「整段同字」**：
  只有當左半段本身完全由同一字元組成時，合併後的前綴才可能延伸到右半段；後綴的情況對稱。判斷此條件需要知道該半段的跨度長度。

- **單點修改只影響一條路徑**：
  修改一個位置僅會改變包含該位置的那些區間，而它們在樹狀結構上恰好構成從葉節點到根節點的一條路徑，長度為對數級。

- **可利用的剪枝**：
  若查詢寫入的字元與原本相同，整個更新可完全略過；此外若某個祖先重算後資訊完全未變，則其上方所有祖先必然也不變，可提早中止。

依據以上特性，可以採用以下策略：

- **以線段樹維護每個區間的四項資訊**：最長同字元連續段、前綴連續段（含其字元）、後綴連續段（含其字元）。
- **將葉節點數量補足為 2 的冪**，使樹成為完美二元樹，讓同一層節點的跨度一致、索引運算免除分支；補位葉節點賦予兩兩相異的虛擬字元，確保它們永不與真實資料合併。
- **建樹時由下而上逐層合併**，查詢時僅沿受影響的單一路徑向上重算，並以「資訊未變即中止」加速。
- **每次查詢後直接取根節點所存的最長連續段作為答案**。

此策略將每次查詢的成本壓到對數級，整體效率足以應付上限規模。

## 解題步驟

### Step 1：取得基本參數並決定線段樹規模

先取得字串長度與查詢數量，並將葉節點數量向上取整為 2 的冪，使整棵樹成為完美二元樹，節點總數則為葉數的兩倍。

```typescript
const length = s.length;
const queryCount = queryIndices.length;

// 將葉節點數量向上取整為 2 的冪，使樹成為完美二元樹，索引運算也免除分支。
const leafCount = 1 << (32 - Math.clz32(length - 1));
const nodeCount = leafCount << 1;
```

### Step 2：配置扁平化的線段樹儲存空間

以多條型別化陣列平行儲存每個節點的四項資訊，並額外配置一條陣列記錄各位置目前的字元，供後續跳過無效查詢使用。

```typescript
// 扁平型別化陣列線段樹：節點 i 的子節點為 (i << 1) 與 (i << 1 | 1)，根節點為 1。
const maxRun = new Int32Array(nodeCount);
const prefixRun = new Int32Array(nodeCount);
const suffixRun = new Int32Array(nodeCount);
const prefixChar = new Int32Array(nodeCount);
const suffixChar = new Int32Array(nodeCount);

// 記錄每個位置目前的字元，用來跳過寫回相同字母的查詢。
const currentChar = new Int32Array(length);
```

### Step 3：以原字串內容初始化真實葉節點

直接依字元碼填入每個真實葉節點：單一字元的最長段、前綴、後綴長度皆為 1，前後綴字元即為該字元本身。

```typescript
// 直接以字元碼種入真實葉節點，避免任何字串切割。
for (let index = 0; index < length; index++) {
  const characterCode = s.charCodeAt(index);
  const leaf = leafCount + index;
  currentChar[index] = characterCode;
  maxRun[leaf] = 1;
  prefixRun[leaf] = 1;
  suffixRun[leaf] = 1;
  prefixChar[leaf] = characterCode;
  suffixChar[leaf] = characterCode;
}
```

### Step 4：填入補位葉節點並確保其永不參與合併

補足到 2 的冪所需的多餘葉節點，賦予兩兩相異的負數虛擬字元，使它們既不會彼此合併，也不會與真實字元合併。

```typescript
// 補位葉節點取兩兩相異的負數字元，確保永遠不會與任何內容合併。
for (let index = length; index < leafCount; index++) {
  const leaf = leafCount + index;
  const fillerCharacter = -1 - index;
  maxRun[leaf] = 1;
  prefixRun[leaf] = 1;
  suffixRun[leaf] = 1;
  prefixChar[leaf] = fillerCharacter;
  suffixChar[leaf] = fillerCharacter;
}
```

### Step 5：由下而上逐層建樹並讀取左右子節點資訊

從最底層的內部節點開始，一層一層往根節點推進。同一層中每個節點的子節點跨度皆相同，因此可統一以當前跨度判斷跨界條件。每個節點先取出左右子節點的前後綴字元與長度。

```typescript
// 由下而上逐層建構：同一層的每個節點，其子節點跨度皆為已知且相同。
let childSpan = 1;
let levelStart = leafCount >> 1;
while (levelStart >= 1) {
  const levelEnd = levelStart << 1;
  for (let node = levelStart; node < levelEnd; node++) {
    const left = node << 1;
    const right = left | 1;
    const leftPrefixChar = prefixChar[left];
    const leftSuffixChar = suffixChar[left];
    const leftSuffixRun = suffixRun[left];
    const rightPrefixChar = prefixChar[right];
    const rightPrefixRun = prefixRun[right];

    // ...
  }

  // ...
}
```

### Step 6：合併節點的前綴與後綴連續段

合併後的前綴預設沿用左子節點的前綴；唯有當左子節點整段皆為同一字元、且兩側字元相同時，前綴才能延伸進右子節點。後綴的判斷則完全對稱。

```typescript
while (levelStart >= 1) {
  // Step 5：走訪本層節點並讀取左右子節點資訊

  for (let node = levelStart; node < levelEnd; node++) {
    // Step 5：讀取左右子節點資訊

    // 只有當左子節點整段皆為同一連續段時，前綴才會跨入右子節點。
    let mergedPrefix = prefixRun[left];
    if (mergedPrefix === childSpan && leftPrefixChar === rightPrefixChar) {
      mergedPrefix += rightPrefixRun;
    }

    // 對稱地，只有當右子節點整段皆為同一連續段時，後綴才會跨入左子節點。
    let mergedSuffix = suffixRun[right];
    if (mergedSuffix === childSpan && suffixChar[right] === leftSuffixChar) {
      mergedSuffix += leftSuffixRun;
    }

    // ...
  }

  // ...
}
```

### Step 7：計算此節點的最長同字元連續段

答案先取左右子節點兩者的較大值；唯一還需額外考慮的候選，是橫跨兩子節點交界處、由左後綴與右前綴接合而成的連續段。

```typescript
while (levelStart >= 1) {
  // Step 5：走訪本層節點並讀取左右子節點資訊

  for (let node = levelStart; node < levelEnd; node++) {
    // Step 5：讀取左右子節點資訊

    // Step 6：合併前綴與後綴連續段

    const leftMax = maxRun[left];
    const rightMax = maxRun[right];
    let bestRun = leftMax > rightMax ? leftMax : rightMax;

    // 唯一額外的候選，是橫跨兩個子節點交界處的連續段。
    if (leftSuffixChar === rightPrefixChar) {
      const joinedRun = leftSuffixRun + rightPrefixRun;
      if (joinedRun > bestRun) {
        bestRun = joinedRun;
      }
    }

    // ...
  }

  // ...
}
```

### Step 8：寫回節點資訊並前往上一層

將計算完成的四項資訊寫回當前節點；本層處理完畢後，子節點跨度加倍、層起點折半，繼續往根節點推進。

```typescript
while (levelStart >= 1) {
  // Step 5：走訪本層節點並讀取左右子節點資訊

  for (let node = levelStart; node < levelEnd; node++) {
    // Step 5：讀取左右子節點資訊

    // Step 6：合併前綴與後綴連續段

    // Step 7：計算此節點的最長連續段

    maxRun[node] = bestRun;
    prefixRun[node] = mergedPrefix;
    suffixRun[node] = mergedSuffix;
    prefixChar[node] = leftPrefixChar;
    suffixChar[node] = suffixChar[right];
  }
  childSpan <<= 1;
  levelStart >>= 1;
}
```

### Step 9：逐一處理查詢並更新對應葉節點

準備答案容器後開始處理每筆查詢：取出被修改的位置與新字元。若新字元與原字元相同，則整棵樹不會有任何變化，可完全略過更新；否則更新記錄並改寫該葉節點的前後綴字元。

```typescript
const lengths: number[] = new Array(queryCount);
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const position = queryIndices[queryIndex];
  const characterCode = queryCharacters.charCodeAt(queryIndex);

  // 若查詢寫回相同字母則不可能造成任何改變，整段向上攀爬皆可略過。
  if (currentChar[position] !== characterCode) {
    currentChar[position] = characterCode;
    const leaf = leafCount + position;
    prefixChar[leaf] = characterCode;
    suffixChar[leaf] = characterCode;

    // ...
  }

  // ...
}
```

### Step 10：沿唯一路徑向上攀爬並讀取子節點資訊

從被修改葉節點的父節點開始，沿單一路徑往根節點逐層重算。此處同樣先取出左右子節點的前後綴資訊，並以當前跨度作為跨界判斷依據。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：讀取本次查詢的位置與字元

  if (currentChar[position] !== characterCode) {
    // Step 9：更新葉節點內容

    // 從被更動的葉節點沿唯一路徑往上，逐一重算每個祖先。
    let node = leaf >> 1;
    let span = 1;
    while (node >= 1) {
      const left = node << 1;
      const right = left | 1;
      const leftPrefixChar = prefixChar[left];
      const leftSuffixChar = suffixChar[left];
      const leftSuffixRun = suffixRun[left];
      const rightPrefixChar = prefixChar[right];
      const rightPrefixRun = prefixRun[right];
      const rightSuffixChar = suffixChar[right];

      // ...
    }
  }

  // ...
}
```

### Step 11：重算此祖先的前後綴與最長連續段

沿用與建樹階段完全相同的合併規則：先算出跨界後的前綴與後綴，再取左右子節點最長段與交界接合段中的最大值。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：讀取本次查詢的位置與字元

  if (currentChar[position] !== characterCode) {
    // Step 9：更新葉節點內容

    while (node >= 1) {
      // Step 10：讀取左右子節點資訊

      let mergedPrefix = prefixRun[left];
      if (mergedPrefix === span && leftPrefixChar === rightPrefixChar) {
        mergedPrefix += rightPrefixRun;
      }

      let mergedSuffix = suffixRun[right];
      if (mergedSuffix === span && rightSuffixChar === leftSuffixChar) {
        mergedSuffix += leftSuffixRun;
      }

      const leftMax = maxRun[left];
      const rightMax = maxRun[right];
      let bestRun = leftMax > rightMax ? leftMax : rightMax;
      if (leftSuffixChar === rightPrefixChar) {
        const joinedRun = leftSuffixRun + rightPrefixRun;
        if (joinedRun > bestRun) {
          bestRun = joinedRun;
        }
      }

      // ...
    }
  }

  // ...
}
```

### Step 12：資訊完全未變時提早中止攀爬

若重算後此節點的四項資訊與原本完全一致，代表更動已被吸收，其上所有祖先亦不會改變，可立即結束攀爬。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：讀取本次查詢的位置與字元

  if (currentChar[position] !== characterCode) {
    // Step 9：更新葉節點內容

    while (node >= 1) {
      // Step 10：讀取左右子節點資訊

      // Step 11：重算前後綴與最長連續段

      // 若此節點毫無變化，則所有祖先亦皆不變，可終止攀爬。
      if (maxRun[node] === bestRun && prefixRun[node] === mergedPrefix && suffixRun[node] === mergedSuffix
        && prefixChar[node] === leftPrefixChar && suffixChar[node] === rightSuffixChar) {
        break;
      }

      // ...
    }
  }

  // ...
}
```

### Step 13：寫回祖先資訊並繼續往上一層移動

未提早中止時，將新資訊寫回此祖先，接著把節點索引右移一位以移向其父節點，同時將跨度加倍。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：讀取本次查詢的位置與字元

  if (currentChar[position] !== characterCode) {
    // Step 9：更新葉節點內容

    while (node >= 1) {
      // Step 10：讀取左右子節點資訊

      // Step 11：重算前後綴與最長連續段

      // Step 12：資訊未變時提早中止

      maxRun[node] = bestRun;
      prefixRun[node] = mergedPrefix;
      suffixRun[node] = mergedSuffix;
      prefixChar[node] = leftPrefixChar;
      suffixChar[node] = rightSuffixChar;

      node >>= 1;
      span <<= 1;
    }
  }

  // ...
}
```

### Step 14：取根節點作為本次查詢的答案

無論是否進行過更新，根節點永遠維護著整個字串的最長同字元連續段，直接讀取即為本輪答案。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 9：讀取本次查詢的位置與字元

  if (currentChar[position] !== characterCode) {
    // Step 10 ~ Step 13：沿路徑向上重算所有受影響的祖先
  }

  // 根節點永遠保存著整個字串的答案。
  lengths[queryIndex] = maxRun[1];
}
```

### Step 15：回傳所有查詢的結果

所有查詢處理完畢後，逐輪記錄的答案已完整存放於結果陣列中，直接回傳。

```typescript
return lengths;
```

## 時間複雜度

- 初始化葉節點與補位葉節點各需一次線性掃描，為 $O(n)$；
- 逐層建樹需走訪全部節點一次，節點數與 $n$ 同階，為 $O(n)$；
- 每筆查詢僅沿葉到根的單一路徑更新，路徑長度為 $O(\log n)$，共 $k$ 筆為 $O(k \log n)$；
- 總時間複雜度為 $O(n + k \log n)$。

> $O(n + k \log n)$

## 空間複雜度

- 線段樹以五條型別化陣列儲存，節點數與 $n$ 同階，為 $O(n)$；
- 記錄各位置目前字元的陣列為 $O(n)$；
- 輸出答案陣列為 $O(k)$；
- 總空間複雜度為 $O(n + k)$。

> $O(n + k)$
