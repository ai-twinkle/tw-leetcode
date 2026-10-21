# 3863. Minimum Operations to Sort a String

You are given a string `s` consisting of lowercase English letters.

In one operation, you can select any substring of `s` 
that is not the entire string and sort it in non-descending alphabetical order.

Return the minimum number of operations required to make `s` sorted in non-descending order. 
If it is not possible, return -1.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of only lowercase English letters.

## 基礎思路

本題允許每次選擇一個「非整個字串」的子字串並將其排序，要求以最少操作次數使整個字串變為非遞減；若無法達成則回傳 `-1`。
由於字串長度可達 `10^5`，不可能模擬各種操作組合，必須直接從字串結構判斷答案。

在思考解法時，可掌握以下核心觀察：

- **已排序的字串不需要任何操作**：
  若字串本身已為非遞減，答案即為 0。

- **長度為二的字串無法移動任何字元**：
  此時任何真子字串都只含一個字元，排序不會改變任何東西；若字串未排序，則永遠無法完成。

- **只要有一端已在最終位置，一次操作即可完成**：
  若首字元已是全域最小值，排序除首字元以外的部分即可；同理，若尾字元已是全域最大值，排序除尾字元以外的部分即可。

- **一般情況下兩次操作即足夠**：
  若全域最小值出現在最後一個位置以外，先排序「去掉尾端」的部分，可把最小值移到開頭，再排序「去掉開頭」的部分即可完成；若全域最大值出現在第一個位置以外，則以對稱方式處理。

- **最壞情況需要三次操作**：
  只有在首字元為唯一的嚴格最大值、且尾字元為唯一的嚴格最小值時，上述兩種兩步策略都無法使用，必須多花一步先將其中一個極值移離端點。

- **字母種類有限，可用位元遮罩判斷極值關係**：
  只有 26 種小寫字母，因此可將中間段出現過的字母壓縮成一個整數遮罩，以常數時間判斷「是否存在比某字元更小或更大的字母」。

依據以上特性，可以採用以下策略：

- **單次掃描字串**，同時檢查是否已排序，並記錄兩端之間出現過的字母集合。
- **依序判斷答案為 0、-1、1、3 的條件**，皆不成立時答案為 2。

此策略只需線性掃描一次，加上常數次的位元判斷即可得到答案。

## 解題步驟

### Step 1：快速處理長度不足二的情況

單一字元的字串必定為非遞減，不需要任何操作，可以直接回傳 0。

```typescript
const length = s.length;

// 單一字元必定為非遞減。
if (length < 2) {
  return 0;
}
```

### Step 2：初始化兩端字元與掃描狀態

先取得首尾兩個字元的編碼，並準備三個狀態：

- `isSorted`：記錄字串是否已排序；
- `previousCode`：記錄前一個字元的編碼，用於比較相鄰順序；
- `middleMask`：以 26 位元遮罩記錄嚴格位於兩端之間出現過的字母。

```typescript
const lastIndex = length - 1;
const firstCode = s.charCodeAt(0);
const lastCode = s.charCodeAt(lastIndex);

let isSorted = true;
let previousCode = firstCode;
// 以 26 位元遮罩記錄嚴格位於兩端之間出現過的字母。
let middleMask = 0;
```

### Step 3：單次掃描中間段，同時檢查順序並收集字母

走訪首尾之間的每個字元：

- 若目前字元小於前一個字元，代表字串未排序；
- 將目前字元對應的位元以 OR 併入遮罩，記錄中間段出現過的字母。

```typescript
// 單次掃描：同時檢查順序，並以位元收集中間段的字母（無分支的 OR 運算）。
for (let index = 1; index < lastIndex; index++) {
  const code = s.charCodeAt(index);

  if (code < previousCode) {
    isSorted = false;
  }

  previousCode = code;
  middleMask |= 1 << (code - 97);
}
```

### Step 4：補檢查最後一組相鄰字元

尾字元不屬於中間段，因此最後一組相鄰字元在迴圈外另外比較，完成整個字串的排序檢查。

```typescript
// 最後一組相鄰字元移至迴圈外檢查，以保持迴圈主體精簡。
if (lastCode < previousCode) {
  isSorted = false;
}
```

### Step 5：已排序時直接回傳 0

若整個字串已為非遞減，不需要任何操作。

```typescript
if (isSorted) {
  return 0;
}
```

### Step 6：長度為二且未排序時無解

長度為二時，任何真子字串都只含一個字元，排序無法改變字串，因此回傳 -1。

```typescript
// 長度為二：任何真子字串都無法同時包含兩個字元，因此無法移動任何字元。
if (length === 2) {
  return -1;
}
```

### Step 7：判斷首字元是否為全域最小、尾字元是否為全域最大

將首尾字元轉成對應位元後，用遮罩判斷：

- **首字元為全域最小值**：首字元不大於尾字元，且遮罩中沒有比首字元更低的位元；
- **尾字元為全域最大值**：尾字元不小於首字元，且遮罩整體小於「尾字元位元左移一位」，即中間段沒有比尾字元更大的字母。

```typescript
const firstBit = 1 << (firstCode - 97);
const lastBit = 1 << (lastCode - 97);

// 中間段沒有比首字元更小的字母，且首字元不大於尾字元。
const firstIsGlobalMinimum = firstCode <= lastCode && (middleMask & (firstBit - 1)) === 0;
// 中間段沒有比尾字元更大的字母，且尾字元不小於首字元。
const lastIsGlobalMaximum = lastCode >= firstCode && middleMask < (lastBit << 1);
```

### Step 8：任一端已在最終位置時，一次操作即可完成

若首字元已是全域最小值，排序除首字元外的部分即可；若尾字元已是全域最大值，排序除尾字元外的部分即可。兩種情況都只需一次操作。

```typescript
// 其中一端已位於最終位置，因此只需排序一個真子字串即可。
if (firstIsGlobalMinimum || lastIsGlobalMaximum) {
  return 1;
}
```

### Step 9：首字元為嚴格最大且尾字元為嚴格最小時需要三次操作

這個條件成立需要兩件事同時滿足：

- 遮罩小於首字元位元，代表中間所有字母都嚴格小於首字元；
- 遮罩在尾字元位元以下（含尾字元本身）全為 0，代表中間所有字母都嚴格大於尾字元。

此時兩種兩步策略都無法使用，答案為 3。

```typescript
// 首字元為嚴格最大值，且尾字元為嚴格最小值。
if (middleMask < firstBit && (middleMask & ((lastBit << 1) - 1)) === 0) {
  return 3;
}
```

### Step 10：其餘情況回傳 2

不屬於上述任何情況時，必定能以「先將某個極值移至端點、再排序其餘部分」的兩步策略完成排序。

```typescript
return 2;
```

## 時間複雜度

- 對字串進行一次線性掃描，每個字元只處理一次；
- 掃描後的位元判斷都是常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數與一個 26 位元遮罩；
- 不需要額外的陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
