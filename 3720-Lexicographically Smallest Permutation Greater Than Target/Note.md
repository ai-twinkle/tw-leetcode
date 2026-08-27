# 3720. Lexicographically Smallest Permutation Greater Than Target

You are given two strings `s` and `target`, both having length `n`, consisting of lowercase English letters.

Return the lexicographically smallest permutation of `s` that is strictly greater than `target`. 
If no permutation of `s` is lexicographically strictly greater than `target`, return an empty string.

A string `a` is lexicographically strictly greater than a string `b` (of the same length) 
if in the first position where `a` and `b` differ, string a has a letter 
that appears later in the alphabet than the corresponding letter in `b`.

**Constraints:**

- `1 <= s.length == target.length <= 300`
- `s` and `target` consist of only lowercase English letters.

## 基礎思路

本題要求在給定字串的所有排列中，找出字典序嚴格大於目標字串的最小者。
由於排列數量呈階乘級成長，不可能逐一枚舉，必須從字典序的結構性質著手。

在思考解法時，可掌握以下核心觀察：

- **答案必然與目標共享一段前綴**：
  字典序比較只看第一個相異位置，因此最小的「嚴格大於」結果，會盡可能長地沿用目標字串作為前綴，並在某個轉折位置放入一個比目標對應字元更大的字元。

- **轉折位置越靠右，結果越小**：
  若能在較右側完成超越，前面所有位元皆與目標相同，字典序自然更小；因此應從最右可行處開始嘗試，向左回退僅作為備案。

- **字元本身可交換，只需視為多重集合**：
  排列的本質是字元的重新配置，順序自由，因此只需維護「尚可使用的字元數量」，而不需關心原字串的排列方式。

- **轉折之後應全部升序排列**：
  一旦在轉折位置已經嚴格超越目標，後續字元不再受目標拘束，僅需讓剩餘的多重集合以升序輸出，即可得到最小的尾段。

- **可用字元集合適合以位元表示**：
  字母僅有 26 種，用一個位元遮罩記錄哪些字元尚有存量，便能以常數時間判斷「是否還存在比某字元更大的字元」，並直接取出其中最小者。

依據以上特性，可以採用以下策略：

- **先建立字元計數與可用位元遮罩**，將問題轉為多重集合的取用問題。
- **貪婪地沿用目標作為前綴**，直到多重集合無法再供應為止。
- **自該處向左尋找轉折位置**，每次回退時把先前佔用的字元歸還；在第一個可行位置放入最小的較大字元。
- **將剩餘字元升序接在其後**，即為所求；若一路回退到最左仍不可行，代表無解。

此策略只需線性次數的位置嘗試與常數時間的字元判斷，即可穩定得到最小的合法排列。

## 解題步驟

### Step 1：統計輸入字串中各字母的可用數量

先取得字串長度，並建立以字母序號為索引的計數表，記錄每個字母尚可使用的份數，將問題轉換為多重集合的取用。

```typescript
const length = s.length;

// 尚可放置的字母多重集合，以 字母 - 'a' 作為索引。
const characterCounts = new Uint16Array(26);
for (let index = 0; index < length; index++) {
  characterCounts[s.charCodeAt(index) - 97]++;
}
```

### Step 2：建立可用字母的位元遮罩

為每個仍有存量的字母設定對應位元，使後續能以常數時間判斷「是否還有更大的字母可用」。

```typescript
// 每個仍可使用的字母佔一個位元，使「是否還有更大的字母」可在 O(1) 內判斷。
let availableMask = 0;
for (let letter = 0; letter < 26; letter++) {
  if (characterCounts[letter] > 0) {
    availableMask |= 1 << letter;
  }
}
```

### Step 3：預先快取目標字串的字母序號

將目標字串逐位轉為字母序號存入陣列，讓之後的前綴匹配與向左回退過程都不必再重複存取原字串。

```typescript
// 預先快取目標字母的序號，使後續的回退過程不需再存取字串。
const targetCodes = new Uint8Array(length);
for (let index = 0; index < length; index++) {
  targetCodes[index] = target.charCodeAt(index) - 97;
}
```

### Step 4：貪婪地沿用目標字串作為前綴

自左而右嘗試沿用目標的每個字母：若多重集合中仍有存量便取用一份，並在存量歸零時同步關閉其位元；一旦無法供應即停止，此時 `matchedLength` 即為可完全沿用的前綴長度。

```typescript
// 在多重集合仍能供應的前提下，貪婪地沿用目標作為前綴。
let matchedLength = 0;
while (matchedLength < length) {
  const letter = targetCodes[matchedLength];
  if (characterCounts[letter] === 0) {
    break;
  }
  characterCounts[letter]--;
  if (characterCounts[letter] === 0) {
    availableMask &= ~(1 << letter);
  }
  matchedLength++;
}
```

### Step 5：處理完全匹配時的轉折位置回退

若整個目標都能被沿用，代表得到的會是與目標相同的字串，並不嚴格大於目標；此時必須把轉折位置往左移一格，並將該位置原本佔用的字母歸還到多重集合中。

```typescript
// 完全匹配會重現目標本身，並不嚴格大於目標，
// 因此轉折位置必須往左移一格，並釋放該字母。
let pivotIndex = matchedLength;
if (pivotIndex === length) {
  pivotIndex = length - 1;
  const releasedLetter = targetCodes[pivotIndex];
  characterCounts[releasedLetter]++;
  availableMask |= 1 << releasedLetter;
}
```

### Step 6：自右向左掃描轉折位置並檢查是否存在更大字母

由目前的轉折位置向左逐格嘗試，因為越右側成功代表結果越小。每格先取出目標對應的字母，再把可用遮罩右移，僅保留嚴格大於該字母的位元，用以判斷此處是否可行。

```typescript
// 讓轉折位置向左移動；第一個可行的位置就是最右側者，
// 也就會產生最小的結果。
for (; pivotIndex >= 0; pivotIndex--) {
  const targetLetter = targetCodes[pivotIndex];
  const greaterLettersMask = availableMask >>> (targetLetter + 1);

  // ...
}
```

### Step 7：挑選最小的可用較大字母

若遮罩不為零，代表此處可行。取出遮罩的最低位元即為所有較大字母中最小者，換算回字母序號後，從多重集合中扣除一份。

```typescript
for (; pivotIndex >= 0; pivotIndex--) {
  // Step 6：取出目標字母並計算較大字母遮罩

  if (greaterLettersMask !== 0) {
    // 取出最低位元，即為大於 targetLetter 的最小字母。
    const lowestSetBit = greaterLettersMask & -greaterLettersMask;
    const chosenLetter = targetLetter + 1 + (31 - Math.clz32(lowestSetBit));
    characterCounts[chosenLetter]--;

    // ...
  }

  // ...
}
```

### Step 8：以升序組出剩餘字母並回傳答案

轉折之後已無需再受目標約束，故將剩餘多重集合按字母序由小到大依序展開為尾段，最後把目標前綴、選定字母與尾段接合後回傳。

```typescript
for (; pivotIndex >= 0; pivotIndex--) {
  // Step 6：取出目標字母並計算較大字母遮罩

  if (greaterLettersMask !== 0) {
    // Step 7：挑選最小的可用較大字母

    // 轉折之後的所有位置，即為剩餘多重集合的升序排列。
    let suffix = "";
    for (let letter = 0; letter < 26; letter++) {
      const remainingCount = characterCounts[letter];
      if (remainingCount > 0) {
        suffix += String.fromCharCode(letter + 97).repeat(remainingCount);
      }
    }

    return target.slice(0, pivotIndex) + String.fromCharCode(chosenLetter + 97) + suffix;
  }

  // ...
}
```

### Step 9：此處不可行時歸還前一個字母並繼續左移

若當前位置找不到更大的字母，則需向左退一格；退之前必須把前一格原本佔用的目標字母歸還多重集合並重新點亮其位元，使下一輪的判斷基於正確的剩餘狀態。

```typescript
for (; pivotIndex >= 0; pivotIndex--) {
  // Step 6：取出目標字母並計算較大字母遮罩

  // Step 7：挑選最小的可用較大字母

  // Step 8：以升序組出剩餘字母並回傳答案

  // 此處放不下更大的字母，於是歸還前一個目標字母後重試。
  if (pivotIndex > 0) {
    const releasedLetter = targetCodes[pivotIndex - 1];
    characterCounts[releasedLetter]++;
    availableMask |= 1 << releasedLetter;
  }
}
```

### Step 10：所有位置皆不可行時回傳空字串

若一路回退到最左端仍無任何位置能放入更大的字母，代表不存在嚴格大於目標的排列，回傳空字串。

```typescript
return "";
```

## 時間複雜度

- 建立字元計數與快取目標序號各需一次線性掃描，為 $O(n)$；
- 建立可用位元遮罩需掃過固定的 26 個字母，為 $O(1)$；
- 貪婪沿用前綴最多推進 $n$ 次，為 $O(n)$；
- 轉折位置最多向左移動 $n$ 次，每次的遮罩判斷與字母歸還皆為常數時間，為 $O(n)$；
- 組出升序尾段需走訪固定字母集合並輸出至多 $n$ 個字元，為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 字元計數表與位元遮罩僅與固定的字母集合大小相關，為 $O(1)$；
- 快取目標字母序號的陣列需 $O(n)$；
- 組出的尾段字串長度不超過 $n$，為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
