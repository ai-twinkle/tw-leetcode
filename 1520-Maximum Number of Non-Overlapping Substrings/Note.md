# 1520. Maximum Number of Non-Overlapping Substrings

Given a string `s` of lowercase letters, you need to find the maximum number of non-empty substrings of `s` 
that meet the following conditions:

1. The substrings do not overlap, that is for any two substrings `s[i..j]` and `s[x..y]`, 
   either `j < x` or `i > y` is true.
2. A substring that contains a certain character `c` must also contain all occurrences of `c`.

Find the maximum number of substrings that meet the above conditions. 
If there are multiple solutions with the same number of substrings, return the one with minimum total length. 
It can be shown that there exists a unique solution of minimum total length.

Notice that you can return the substrings in any order.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` contains only lowercase English letters.

## 基礎思路

本題要求將字串切成數段互不重疊的子字串，且只要某個字母被納入某段，該字母在整個字串中的所有出現位置都必須落在同一段內；
在此前提下，要最大化段數，並在段數相同時取總長度最小者。

在思考解法時，可掌握以下核心觀察：

- **每個字母天然對應一個閉合需求**：
  任一字母只要被選入，就必須連同其首次與末次出現位置之間的整段一併納入，因此每個字母都可視為一個初始區間。

- **區間需要反覆擴張直到自我封閉**：
  區間內若出現其他字母，該字母的所有出現位置也必須被包含，故需持續向右延伸；若某個內部字母的首次出現位置落在區間左界之前，則此區間永遠無法封閉，應直接捨棄。

- **候選區間數量極少**：
  由於只有小寫英文字母，合法的封閉區間至多與字母種類數同級，規模遠小於字串長度，因此可逐一檢驗而不致於昂貴。

- **候選區間之間只有「不相交」與「包含」兩種關係**：
  合法封閉區間不可能部分重疊，否則兩者的字母集合會互相牽連而必須合併；因此依左界由小到大檢視時，新區間要麼與前一個完全分離，要麼被前一個完整包住。

- **貪婪選取即可同時滿足兩項目標**：
  與前者分離時直接新增一段可增加段數；被前者包住時以較小者取代之，段數不變但總長度更短，恰好符合「段數最大、總長最小」的要求。

依據以上特性，可以採用以下策略：

- **先以一次掃描記錄每個字母的首末出現位置**，作為建立初始區間的依據。
- **僅以字母的首次出現位置作為候選起點**，向右擴張直到區間封閉，並在過程中偵測是否出現不可封閉的情況。
- **依左界遞增的順序貪婪地維護選取結果**，分離則新增、被包住則取代。
- **最後再一次性地依選定區間切出子字串**，避免在搜尋過程中重複建構字串。

此策略能在線性等級的時間內，穩定地求出唯一的最佳解。

## 解題步驟

### Step 1：初始化字母編碼與首末位置表

先準備快取字母編碼的陣列，以及記錄每個字母首次、末次出現位置的兩個表；首次出現位置初始化為 `-1` 以表示尚未出現。

```typescript
const length = s.length;
const letterCodes = new Uint8Array(length);
const firstIndex = new Int32Array(26).fill(-1);
const lastIndex = new Int32Array(26);
```

### Step 2：單次掃描記錄每個字母的首末出現位置

以一次線性掃描同時完成兩件事：把每個位置的字母轉為 `0` 到 `25` 的編碼並快取起來，避免之後重複取字元；同時在首次遇到某字母時登記其起點，並持續以當前位置更新其終點。

```typescript
// 單次掃描：快取字母編碼並記錄每個字母的首次與末次出現位置
for (let index = 0; index < length; index++) {
  const code = s.charCodeAt(index) - 97;
  letterCodes[index] = code;
  if (firstIndex[code] === -1) {
    firstIndex[code] = index;
  }
  lastIndex[code] = index;
}
```

### Step 3：準備候選區間的儲存容器

合法區間的數量至多與字母種類數相同，因此以固定大小的型別化陣列儲存已選取區間的左右界，並以計數器記錄目前選取的數量；另以 `previousEnd` 追蹤最近一次選取的右界，初始為 `-1` 表示尚未選取任何區間。

```typescript
// 至多 26 個候選區間，以型別化陣列儲存
const chosenStarts = new Int32Array(26);
const chosenEnds = new Int32Array(26);
let chosenCount = 0;
let previousEnd = -1;
```

### Step 4：由左至右掃描，僅以字母的首次出現位置作為候選起點

以左界遞增的順序走訪每個位置，取出該位置的字母編碼；若此位置並非該字母的首次出現處，代表以它為起點的區間必然無法包含該字母較早的出現位置，直接略過。

```typescript
for (let start = 0; start < length; start++) {
  const code = letterCodes[start];

  // 只有字母的首次出現位置才能作為合法區間的起點
  if (firstIndex[code] !== start) {
    continue;
  }

  // ...
}
```

### Step 5：向右擴張區間直到封閉，並偵測不合法情形

以該字母的末次出現位置作為初始右界，接著逐一檢視區間內的每個位置：若某字母的首次出現位置落在左界之前，則此區間無法封閉，標記為不合法並提前中止；否則若該字母的末次出現位置超出目前右界，就把右界往右延伸，使區間持續擴張直到涵蓋內部所有字母。

```typescript
for (let start = 0; start < length; start++) {
  // Step 4：僅以字母的首次出現位置作為候選起點

  let end = lastIndex[code];
  let isValid = true;

  // 擴張區間以涵蓋其內部的每個字母；若某字母起始於更早處則不合法
  for (let scan = start + 1; scan <= end; scan++) {
    const innerCode = letterCodes[scan];
    if (firstIndex[innerCode] < start) {
      isValid = false;
      break;
    }
    if (lastIndex[innerCode] > end) {
      end = lastIndex[innerCode];
    }
  }

  // ...
}
```

### Step 6：捨棄不合法區間，並以貪婪方式維護選取結果

若區間無法封閉則跳過。對於合法區間，若其左界位於前一個選取區間的右界之後，代表兩者互不相交，可作為新的一段加入；否則此區間必定被前一段完整包住，改以較小的它取代前一段，如此段數不變而總長度更短。最後更新最近一次選取的右界。

```typescript
for (let start = 0; start < length; start++) {
  // Step 4：僅以字母的首次出現位置作為候選起點

  // Step 5：向右擴張區間直到封閉

  if (!isValid) {
    continue;
  }

  if (start > previousEnd) {
    // 與前一個選取結果互不相交：作為新的一段子字串納入
    chosenStarts[chosenCount] = start;
    chosenEnds[chosenCount] = end;
    chosenCount++;
  } else {
    // 被前一個選取結果包住：以較小的區間取代之
    chosenStarts[chosenCount - 1] = start;
    chosenEnds[chosenCount - 1] = end;
  }
  previousEnd = end;
}
```

### Step 7：依選定區間一次性建構結果並回傳

所有區間確定後，才依照各自的左右界切出對應的子字串，避免在搜尋過程中反覆建構字串造成額外開銷。

```typescript
// 最後才一次性建構所有子字串
const result: string[] = new Array(chosenCount);
for (let index = 0; index < chosenCount; index++) {
  result[index] = s.substring(chosenStarts[index], chosenEnds[index] + 1);
}
return result;
```

## 時間複雜度

- 首次掃描記錄字母編碼與首末位置為 $O(n)$；
- 主掃描走訪 $n$ 個位置，但僅在字母的首次出現處才進入擴張程序，故擴張至多執行字母種類數 $k$ 次，每次最長為 $O(n)$，合計 $O(k \cdot n)$；
- 最後建構結果的總字元數不超過 $n$，為 $O(n)$；
- 由於 $k$ 為常數 26，總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 字母編碼快取需 $O(n)$；
- 首末位置表與候選區間陣列皆為固定大小 $O(k)$；
- 輸出結果的總長度不超過 $n$，為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
