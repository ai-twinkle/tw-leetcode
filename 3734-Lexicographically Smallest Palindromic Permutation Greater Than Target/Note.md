# 3734. Lexicographically Smallest Palindromic Permutation Greater Than Target

You are given two strings `s` and `target`, each of length `n`, consisting of lowercase English letters.

Return the lexicographically smallest string that is both a palindromic permutation of `s` and strictly greater than `target`. 
If no such permutation exists, return an empty string.

**Constraints:**

- `1 <= n == s.length == target.length <= 300`
- `s` and `target` consist of only lowercase English letters.

## 基礎思路

本題要求在給定字串的字母重排中，找出「同時是回文」且「字典序嚴格大於目標字串」的最小者。由於回文的後半段完全由前半段決定，問題的自由度其實只存在於前半段與中間字元。

在思考解法時，可掌握以下核心觀察：

- **回文的可行性由字母出現次數的奇偶性決定**：
  一個多重集合能排成回文，等價於其中出現奇數次的字母至多只有一個；該字母必然落在正中央，其餘字母則成對分佈於左右兩側。

- **只需決定前半段**：
  一旦前半段確定，後半段即為其鏡射，中間字元亦已固定。因此整個搜尋空間可縮小為「前半段的字母排列」。

- **字典序比較具有前綴主導性**：
  要讓結果嚴格大於目標，標準作法是沿用目標的某段前綴，在某個位置改放一個嚴格更大的字母，其後的位置則可自由安排；越晚發生的「突破點」，所得結果越小。

- **突破點之後應以升冪填滿**：
  突破點之後的字典序已必然大於目標，因此剩餘字母由小到大排列即可得到最小結果。

- **最佳情況是完全沿用目標前半段**：
  若手上的字母足以完整供應目標的整個前半段，則前半段完全相同，勝負僅取決於中間與鏡射而成的後半段，此時只要比較結果是否更大即可。

依據以上特性，可以採用以下策略：

- **先統計字母次數並檢驗回文可行性**，同時把可用字母折半，作為前半段的配額。
- **貪心地沿用目標前半段能被供應的最長前綴**，作為最有利的起點。
- **優先嘗試「前半段完全相同」的情形**，若鏡射結果已足夠大則直接採用。
- **否則由最長前綴處往左逐格回退尋找突破點**，在該位置改放最小的可用且更大的字母，並在回退時歸還先前消耗的配額。
- **突破點確定後，剩餘配額以升冪鋪滿並同步鏡射**，即得最小合法回文。

此策略讓搜尋僅在前半段進行，並以貪心與回退保證所得結果為所有合法解中的字典序最小者。

## 解題步驟

### Step 1：預先定義字母表與解碼相關常數

先定義小寫字母數量、字母 `a` 的字元碼，以及批次解碼時每批的長度上限，供後續全域重複使用。

```typescript
const ALPHABET_SIZE = 26;
const CHAR_CODE_A = 97;
const DECODE_CHUNK_SIZE = 4096;
```

### Step 2：處理將字元碼緩衝區還原為字串的輔助函數

由於結果會先以字元碼的形式寫入緩衝區，最後需轉回字串。此函數以分批方式處理，避免一次傳入過多引數而觸及呼叫上限。

```typescript
/**
 * 將字元碼緩衝區轉換為字串。
 * @param characterCodes - 每個位置存放一個字元碼的緩衝區。
 * @returns 解碼後的字串。
 */
function decodeCharacterCodes(characterCodes: Uint8Array): string {
  let decoded = "";

  // 採分批處理，以避開 Function.prototype.apply 的引數數量上限。
  for (let start = 0; start < characterCodes.length; start += DECODE_CHUNK_SIZE) {
    const chunk = characterCodes.subarray(start, start + DECODE_CHUNK_SIZE);
    decoded += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return decoded;
}
```

### Step 3：統計來源字串中各字母的出現次數

先取得字串長度，並以固定長度的計數表累計每個字母出現的次數，作為後續判斷與配額分配的依據。

```typescript
const length = s.length;
const totalCounts = new Int32Array(ALPHABET_SIZE);

for (let index = 0; index < length; index++) {
  totalCounts[s.charCodeAt(index) - CHAR_CODE_A]++;
}
```

### Step 4：檢驗回文可行性並建立前半段配額

逐一檢視各字母的次數：出現奇數次者只允許存在一個，該字母即為中央字元；若出現第二個奇數次的字母，則無法構成回文，直接回傳空字串。同時將每個字母的次數折半，作為前半段可使用的配額。

```typescript
// 回文最多只容許一個字母的出現次數為奇數。
const remainingCounts = new Int32Array(ALPHABET_SIZE);
let middleCharCode = -1;

for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
  const count = totalCounts[letter];

  if ((count & 1) === 1) {
    if (middleCharCode !== -1) {
      return "";
    }
    middleCharCode = letter + CHAR_CODE_A;
  }

  remainingCounts[letter] = count >> 1;
}
```

### Step 5：預先展開目標字串並準備結果緩衝區

計算前半段長度，並將目標字串轉為字元碼陣列以加速後續逐位比較；同時配置與答案等長的結果緩衝區。

```typescript
const halfLength = length >> 1;
const targetCodes = new Uint8Array(length);

for (let index = 0; index < length; index++) {
  targetCodes[index] = target.charCodeAt(index);
}

const resultCodes = new Uint8Array(length);
```

### Step 6：貪心地取用目標前半段可被供應的最長前綴

從左往右逐位嘗試沿用目標的字母，只要配額尚有剩餘就消耗一份並前進；一旦某個字母的配額用罄即停止，此時所得長度即為可完全沿用的最長前綴。

```typescript
// 目標前半段中，多重集合實際上足以供應的最長前綴。
let prefixLength = 0;

while (prefixLength < halfLength) {
  const letter = targetCodes[prefixLength] - CHAR_CODE_A;

  if (remainingCounts[letter] === 0) {
    break;
  }

  remainingCounts[letter]--;
  prefixLength++;
}
```

### Step 7：處理前半段可完全沿用的最佳情形，先組出鏡射結果

若整個前半段都能沿用目標，則直接把目標前半段寫入結果並同步鏡射至後半段；若存在中央字元，也一併填入正中央。

```typescript
// 最佳情形：整個前半段與目標相同，勝負僅取決於鏡射而成的後半段。
if (prefixLength === halfLength) {
  for (let index = 0; index < halfLength; index++) {
    const code = targetCodes[index];
    resultCodes[index] = code;
    resultCodes[length - 1 - index] = code;
  }

  if (middleCharCode !== -1) {
    resultCodes[halfLength] = middleCharCode;
  }

  // ...
}
```

### Step 8：比較鏡射結果是否已嚴格大於目標

由於前半段完全相同，比較只需從中央位置開始往後進行；找到第一個相異位置即可判定大小，若確實更大便直接輸出此答案。

```typescript
if (prefixLength === halfLength) {
  // Step 7：沿用目標前半段並鏡射填入

  // 前半段完全相同，因此比較從中間位置開始。
  let isGreater = false;

  for (let index = halfLength; index < length; index++) {
    if (resultCodes[index] !== targetCodes[index]) {
      isGreater = resultCodes[index] > targetCodes[index];
      break;
    }
  }

  if (isGreater) {
    return decodeCharacterCodes(resultCodes);
  }
}
```

### Step 9：決定突破點的起始位置並歸還必要配額

若上一步未能取勝，則需在前半段中尋找可以放入更大字母的突破點。起始位置取自最長前綴處；若前綴已覆蓋整個前半段，則最後一格必須改由突破點使用，因此要先把該格消耗掉的配額歸還。

```typescript
// 突破點的候選位置，由最長共同前綴處往左掃描。
let position = prefixLength < halfLength ? prefixLength : halfLength - 1;

if (prefixLength === halfLength && halfLength > 0) {
  // 在將最後一格改作突破點之前，先歸還該位置原本消耗的字母。
  remainingCounts[targetCodes[halfLength - 1] - CHAR_CODE_A]++;
}
```

### Step 10：於當前突破點尋找可用且嚴格更大的最小字母

由目標在該位置的字母往上掃描字母表，找出第一個仍有配額的字母；由於是由小往大搜尋，找到的必為滿足條件的最小選擇。

```typescript
while (position >= 0) {
  const targetLetter = targetCodes[position] - CHAR_CODE_A;
  let chosenLetter = -1;

  // 仍有剩餘且嚴格大於目標字母的最小字母。
  for (let letter = targetLetter + 1; letter < ALPHABET_SIZE; letter++) {
    if (remainingCounts[letter] > 0) {
      chosenLetter = letter;
      break;
    }
  }

  // ...
}
```

### Step 11：找到突破字母後，寫入共同前綴與突破位置的字元

先扣除所選字母的配額，接著把突破點之前的位置沿用目標字母並鏡射，再於突破點與其鏡射位置放入所選字母；若有中央字元亦一併填入。

```typescript
while (position >= 0) {
  // Step 10：尋找可用且更大的最小字母

  if (chosenLetter !== -1) {
    remainingCounts[chosenLetter]--;

    for (let index = 0; index < position; index++) {
      const code = targetCodes[index];
      resultCodes[index] = code;
      resultCodes[length - 1 - index] = code;
    }

    const chosenCode = chosenLetter + CHAR_CODE_A;
    resultCodes[position] = chosenCode;
    resultCodes[length - 1 - position] = chosenCode;

    if (middleCharCode !== -1) {
      resultCodes[halfLength] = middleCharCode;
    }

    // ...
  }

  // ...
}
```

### Step 12：以升冪鋪滿剩餘配額並輸出答案

突破點之後的位置已不影響大小判定，因此依字母由小到大依序寫入並同步鏡射，即可得到字典序最小的結果，完成後直接解碼回傳。

```typescript
while (position >= 0) {
  // Step 10：尋找可用且更大的最小字母

  if (chosenLetter !== -1) {
    // Step 11：寫入共同前綴與突破位置的字元

    // 剩餘字母可自由排列，升冪順序能使結果最小。
    let writeIndex = position + 1;

    for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
      const code = letter + CHAR_CODE_A;
      let count = remainingCounts[letter];

      while (count > 0) {
        resultCodes[writeIndex] = code;
        resultCodes[length - 1 - writeIndex] = code;
        writeIndex++;
        count--;
      }
    }

    return decodeCharacterCodes(resultCodes);
  }

  // ...
}
```

### Step 13：當前位置無解時往左回退並歸還配額

若在該位置找不到可用的更大字母，則將突破點左移一格；由於該格原本沿用目標字母而消耗過配額，需在移動前歸還，才能維持配額表的正確性。

```typescript
while (position >= 0) {
  // Step 10：尋找可用且更大的最小字母

  // Step 11～12：找到突破字母後構造答案並回傳

  // 將突破點左移，並歸還該位置原本消耗的字母。
  if (position > 0) {
    remainingCounts[targetCodes[position - 1] - CHAR_CODE_A]++;
  }

  position--;
}
```

### Step 14：所有突破點皆失敗時回傳空字串

若前半段的每個位置都無法放入更大的字母，代表不存在嚴格大於目標的回文排列，回傳空字串。

```typescript
return "";
```

## 時間複雜度

- 統計字母次數與展開目標字元碼各需一次線性掃描，為 $O(n)$；
- 檢驗奇偶性與分配配額僅掃描字母表一次，為 $O(\Sigma)$，其中 $\Sigma = 26$ 為常數；
- 貪心取用最長前綴至多前進 $n / 2$ 格，為 $O(n)$；
- 突破點最多回退 $n / 2$ 次，每次於字母表中搜尋一次，為 $O(n \times \Sigma)$；
- 構造答案與升冪鋪滿僅發生一次，連同解碼為 $O(n)$；
- 由於 $\Sigma$ 為常數，總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 兩張字母計數表的大小固定，為 $O(\Sigma)$，即常數空間；
- 目標字元碼與結果緩衝區皆與字串等長，為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
