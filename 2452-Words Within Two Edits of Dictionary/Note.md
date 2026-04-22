# 2452. Words Within Two Edits of Dictionary

You are given two string arrays, `queries` and `dictionary`. 
All words in each array comprise of lowercase English letters and have the same length.

In one edit you can take a word from `queries`, and change any letter in it to any other letter. 
Find all words from `queries` that, after a maximum of two edits, equal some word from `dictionary`.

Return a list of all words from `queries`, that match with some word from `dictionary` after a maximum of two edits. 
Return the words in the same order they appear in `queries`.

**Constraints:**

- `1 <= queries.length, dictionary.length <= 100`
- `n == queries[i].length == dictionary[j].length`
- `1 <= n <= 100`
- All `queries[i]` and `dictionary[j]` are composed of lowercase English letters.

## 基礎思路

本題要求找出 `queries` 中所有與 `dictionary` 裡某個單字最多相差兩個字元位置的單字。由於所有單字長度相同，「編輯」的語意可以直接對應到「字元位置上的不同數量」，無需考慮插入或刪除操作。

在思考解法時，可掌握以下核心觀察：

- **編輯次數等同於字元差異數量**：
  因為所有單字等長，一次編輯只能改變一個字元，因此「最多兩次編輯」等價於「逐位比較後，差異位置不超過兩個」。

- **一旦差異超過兩處即可提前終止**：
  比較過程中，只要找到第三個不同的字元位置，就可以確定這對組合無法在兩次編輯內達成，不需要繼續掃描剩餘字元。

- **完全相同可作為快速路徑**：
  若兩個單字完全相同，差異為零，必然符合條件，可直接跳過逐字元比對。

- **只需對每組 (query, dictionary word) 配對做線性掃描**：
  由於只需判斷差異是否超過兩個，不需要紀錄差異的具體內容，過程單純且易於提前跳出。

依據以上特性，可以採用以下策略：

- **對每個 query 逐一與所有 dictionary 單字比對**，只要找到一個符合條件的配對即可記錄並停止。
- **在逐字元比較時追蹤前兩個不匹配位置**，第三個不匹配出現時立即標記並終止該次比對。
- **將完全匹配作為最優先的快速路徑**，減少不必要的逐字元掃描成本。

此策略在題目規模下直接且高效，能確保每個 query 只需在找到第一個合法配對後立即停止搜尋。

## 解題步驟

### Step 1：初始化結果陣列與常用長度變數

在進入主迴圈之前，先建立儲存結果的陣列，並預先讀取單字長度與字典長度，避免在迴圈中重複存取。

```typescript
const result: string[] = [];
const wordLength = queries[0].length;
const dictionaryLength = dictionary.length;
```

### Step 2：遍歷每個 query，並嘗試與字典中的每個單字匹配

對每個 query 設立匹配旗標，接著逐一取出字典中的單字準備比對。
若字典中的單字與 query 完全相同，可直接標記為匹配並跳出字典迴圈。

```typescript
for (const query of queries) {
  let matched = false;

  for (let dictionaryIndex = 0; dictionaryIndex < dictionaryLength; dictionaryIndex++) {
    const dictionaryWord = dictionary[dictionaryIndex];

    // 快速路徑：完全相同的字串不需要任何編輯
    if (query === dictionaryWord) {
      matched = true;
      break;
    }

    // ...
  }

  // ...
}
```

### Step 3：逐字元比對 query 與字典單字，追蹤前兩個不匹配位置

進入逐字元掃描後，以三個變數分別追蹤第一個不匹配位置、第二個不匹配位置，以及是否已超過兩個不匹配的旗標。
遇到相同字元時直接跳過；首次不同時記錄第一個位置，第二次不同時記錄第二個位置；第三次不同出現時立即標記並終止掃描。

```typescript
for (const query of queries) {
  // Step 2：設立旗標並逐一比對字典單字

  for (let dictionaryIndex = 0; dictionaryIndex < dictionaryLength; dictionaryIndex++) {
    // Step 2：快速路徑處理

    // 計算差異數，追蹤第一與第二個不匹配位置
    let firstMismatch = -1;
    let secondMismatch = -1;
    let tooMany = false;

    for (let charIndex = 0; charIndex < wordLength; charIndex++) {
      if (query.charCodeAt(charIndex) === dictionaryWord.charCodeAt(charIndex)) {
        continue;
      }
      if (firstMismatch === -1) {
        // 記錄第一個不匹配位置
        firstMismatch = charIndex;
      } else if (secondMismatch === -1) {
        // 記錄第二個不匹配位置
        secondMismatch = charIndex;
      } else {
        // 找到第三個不匹配，不需繼續
        tooMany = true;
        break;
      }
    }

    // ...
  }

  // ...
}
```

### Step 4：根據掃描結果決定是否標記為匹配，並收集符合條件的 query

若字元掃描結束後不匹配數未超過兩個，則標記此 query 為匹配並跳出字典迴圈；
完成對所有字典單字的比對後，若已匹配則將該 query 加入結果。

```typescript
for (const query of queries) {
  // Step 2：設立旗標並逐一比對字典單字

  for (let dictionaryIndex = 0; dictionaryIndex < dictionaryLength; dictionaryIndex++) {
    // Step 2：快速路徑處理

    // Step 3：逐字元掃描並追蹤不匹配位置

    if (!tooMany) {
      matched = true;
      break;
    }
  }

  if (matched) {
    result.push(query);
  }
}
```

### Step 5：回傳結果陣列

所有 query 處理完畢後，直接回傳收集到的符合單字列表。

```typescript
return result;
```

## 時間複雜度

- 設 `queries` 長度為 $q$，`dictionary` 長度為 $d$，單字長度為 $n$；
- 對每個 query，最多需與所有字典單字逐字元比對，單次比對為 $O(n)$；
- 總時間複雜度為 $O(q \cdot d \cdot n)$。

> $O(q \cdot d \cdot n)$

## 空間複雜度

- 除了儲存結果的陣列以外，僅使用固定數量的輔助變數；
- 結果陣列最多儲存 $q$ 個單字；
- 總空間複雜度為 $O(q)$。

> $O(q)$
