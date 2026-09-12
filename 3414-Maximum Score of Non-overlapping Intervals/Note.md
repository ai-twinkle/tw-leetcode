# 3414. Maximum Score of Non-overlapping Intervals

You are given a 2D integer array intervals, 
where `intervals[i] = [l_i, r_i, weight_i]`. 
Interval `i` starts at position `l_i` and ends at `r_i`, and has a weight of `weight_i`. 
You can choose up to 4 non-overlapping intervals. 
The score of the chosen intervals is defined as the total sum of their weights.

Return the lexicographically smallest array of at most 4 indices from `intervals` with maximum score, 
representing your choice of non-overlapping intervals.

Two intervals are said to be non-overlapping if they do not share any points. 
In particular, intervals sharing a left or right boundary are considered overlapping.

**Constraints:**

- `1 <= intevals.length <= 5 * 10^4`
- `intervals[i].length == 3`
- `intervals[i] = [l_i, r_i, weight_i]`
- `1 <= l_i <= r_i <= 10^9`
- `1 <= weight_i <= 10^9`

## 基礎思路

本題要求從一組帶權重的區間中，挑選至多四個互不重疊的區間，使權重總和最大；而在總和相同的情況下，必須回傳字典序最小的原始索引陣列。難點不在於最大化本身，而在於「最佳解不唯一時如何穩定地選出字典序最小者」。

在思考解法時，可掌握以下核心觀察：

- **區間選取問題的經典結構**：
  若先依右端點排序，則任一區間能搭配的前置區間必為一段前綴，於是「選或不選」的決策可以沿著前綴長度逐步推進，形成標準的動態規劃結構。

- **挑選數量有上限**：
  由於最多只能挑四個，可將「已挑選的個數」作為額外的狀態維度，層與層之間單向轉移，狀態總量仍維持在線性規模。

- **相容前綴可用單調性快速定位**：
  排序後右端點遞增，因此「結束位置嚴格早於某區間起點」的那些區間恰為一段前綴，其長度可用二分搜尋求得。

- **字典序需與權重一同納入狀態比較**：
  由於同分時需取字典序最小者，狀態所保存的不能只有權重，還必須保存對應的索引清單；每次轉移時先比權重，權重相同再比索引清單的字典序。

- **索引清單需維持遞增**：
  題目要求回傳的索引陣列本身即為遞增排列，因此在轉移時應將新索引以插入排序的方式併入既有清單，使比較與輸出都能直接進行。

依據以上特性，可以採用以下策略：

- **先依右端點排序，並把資料攤平成連續的扁平陣列**，以降低存取成本。
- **預先以二分搜尋求出每個區間的相容前綴長度**，讓轉移可在常數時間完成。
- **以「挑選個數 × 前綴長度」為狀態進行動態規劃**，每個狀態同時保存最佳權重與對應的遞增索引清單。
- **轉移時先比權重再比字典序**，確保最終答案在最大權重的前提下亦為字典序最小。

此策略能在一次線性掃描的動態規劃中同時完成最大化與字典序最小化，無須事後回溯重建答案。

## 解題步驟

### Step 1：初始化基本規模參數

先取得區間總數，並定義狀態數與可挑選的上限個數；狀態數需比區間數多一，用以表示「前綴長度為 0」的初始狀態。

```typescript
const intervalCount = intervals.length;
const stateCount = intervalCount + 1;
const maximumPicks = 4;
```

### Step 2：將右端點與原始索引打包後排序

為了避免使用比較器回呼所帶來的開銷，將右端點與原始索引打包進單一可精確表示的浮點數中，再以型別化陣列的原生數值排序完成依右端點遞增的排序。

```typescript
// 將 (右端點, 原始索引) 打包成單一精確的 double，讓排序能以原生數值
// 型別化陣列排序執行，而非透過比較器回呼。
const INDEX_SCALE = 1048576;
const sortedKeys = new Float64Array(intervalCount);
for (let i = 0; i < intervalCount; i++) {
  sortedKeys[i] = intervals[i][1] * INDEX_SCALE + i;
}
sortedKeys.sort();
```

### Step 3：解包成扁平型別化陣列

依排序後的順序還原出每個區間的原始索引、左右端點與權重，分別存入各自的扁平陣列；後續所有運算都只會接觸這些陣列。

```typescript
// 解包成扁平型別化陣列；之後所有運算只會接觸這些陣列。
const leftBound = new Int32Array(intervalCount);
const rightBound = new Int32Array(intervalCount);
const intervalWeight = new Float64Array(intervalCount);
const originalIndex = new Int32Array(intervalCount);
for (let i = 0; i < intervalCount; i++) {
  const source = (sortedKeys[i] % INDEX_SCALE) | 0;
  const interval = intervals[source];
  originalIndex[i] = source;
  leftBound[i] = interval[0];
  rightBound[i] = interval[1];
  intervalWeight[i] = interval[2];
}
```

### Step 4：預先計算每個區間的相容前綴長度

對每個區間，以二分搜尋找出第一個「右端點不早於其左端點」的位置；該位置即為可與之共存的前綴長度，代表有多少個已排序區間結束於其起點之前。

```typescript
// previousCompatible[i] = 有多少個已排序區間的結束位置嚴格早於
// leftBound[i]，亦即可與區間 i 合併使用的前綴長度。
const previousCompatible = new Int32Array(intervalCount);
for (let i = 0; i < intervalCount; i++) {
  const target = leftBound[i];
  let low = 0;
  let high = i;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (rightBound[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  previousCompatible[i] = low;
}
```

### Step 5：建立扁平化的動態規劃表格

為每個狀態準備三份資料：最佳權重、索引清單長度，以及至多四個遞增排列的原始索引；另外準備一個暫存緩衝區，供轉移時組裝候選清單使用。

```typescript
// 扁平 DP 表格：狀態 (picks, prefixLength) -> 最佳權重、清單長度，
// 以及至多四個遞增排列的原始索引。
const bestWeight = new Float64Array((maximumPicks + 1) * stateCount);
const bestLength = new Int8Array((maximumPicks + 1) * stateCount);
const bestIndices = new Int32Array((maximumPicks + 1) * stateCount * 4);
const candidateIndices = new Int32Array(4);
```

### Step 6：逐層推進狀態並計算不取與取用的權重

外層依挑選個數逐層推進，內層沿著前綴長度前進。對每個區間，先算出「不取」的來源狀態、「取用」的來源狀態與目標狀態，並分別得到兩種選擇下的權重，作為後續判斷的依據。

```typescript
for (let picks = 1; picks <= maximumPicks; picks++) {
  const layerBase = picks * stateCount;
  const lowerBase = layerBase - stateCount;
  for (let i = 0; i < intervalCount; i++) {
    const skipState = layerBase + i;
    const targetState = skipState + 1;
    const sourceState = lowerBase + previousCompatible[i];
    const skipWeight = bestWeight[skipState];
    const takeWeight = bestWeight[sourceState] + intervalWeight[i];
    let useTake = false;
    let candidateLength = 0;

    // ...
  }
}
```

### Step 7：取用不劣時，將新索引併入來源狀態的遞增清單

當取用的權重不低於不取的權重時，才有必要建立候選清單。此處以一次線性掃描，將新索引插入來源狀態的遞增清單中的正確位置；若掃描結束仍未插入，代表新索引最大，補在尾端。

```typescript
for (let picks = 1; picks <= maximumPicks; picks++) {
  // Step 6：計算層基底

  for (let i = 0; i < intervalCount; i++) {
    // Step 6：計算狀態索引與兩種選擇的權重

    if (takeWeight >= skipWeight) {
      // 將新索引合併進來源狀態的遞增清單。
      const newIndex = originalIndex[i];
      const sourceLength = bestLength[sourceState];
      const sourceOffset = sourceState << 2;
      let inserted = false;
      for (let k = 0; k < sourceLength; k++) {
        const value = bestIndices[sourceOffset + k];
        if (!inserted && newIndex < value) {
          candidateIndices[candidateLength] = newIndex;
          candidateLength++;
          inserted = true;
        }
        candidateIndices[candidateLength] = value;
        candidateLength++;
      }
      if (!inserted) {
        candidateIndices[candidateLength] = newIndex;
        candidateLength++;
      }

      // ...
    }

    // ...
  }
}
```

### Step 8：權重相同時以字典序決定取捨

若取用的權重嚴格較大，直接採用；若兩者相同，則逐位比較候選清單與原狀態清單，第一個相異處即可決定勝負；若在共同長度內完全相同，則以較短者為字典序較小。

```typescript
for (let picks = 1; picks <= maximumPicks; picks++) {
  // Step 6：計算層基底

  for (let i = 0; i < intervalCount; i++) {
    // Step 6：計算狀態索引與兩種選擇的權重

    if (takeWeight >= skipWeight) {
      // Step 7：將新索引合併進遞增清單

      if (takeWeight > skipWeight) {
        useTake = true;
      } else {
        // 權重相同：保留字典序較小的索引清單。
        const skipLength = bestLength[skipState];
        const skipOffset = skipState << 2;
        const compareLength = candidateLength < skipLength ? candidateLength : skipLength;
        let decided = false;
        for (let k = 0; k < compareLength; k++) {
          const candidateValue = candidateIndices[k];
          const skipValue = bestIndices[skipOffset + k];
          if (candidateValue !== skipValue) {
            useTake = candidateValue < skipValue;
            decided = true;
            break;
          }
        }
        if (decided === false) {
          useTake = candidateLength < skipLength;
        }
      }
    }

    // ...
  }
}
```

### Step 9：依判斷結果寫入目標狀態

若決定取用，則將候選權重與候選清單寫入目標狀態；否則將前一個狀態的權重與清單原樣延續下去，確保每個狀態都持有截至目前的最佳解。

```typescript
for (let picks = 1; picks <= maximumPicks; picks++) {
  // Step 6：計算層基底

  for (let i = 0; i < intervalCount; i++) {
    // Step 6：計算狀態索引與兩種選擇的權重

    // Step 7：將新索引合併進遞增清單

    // Step 8：權重相同時以字典序決定取捨

    const targetOffset = targetState << 2;
    if (useTake === true) {
      bestWeight[targetState] = takeWeight;
      bestLength[targetState] = candidateLength;
      for (let k = 0; k < candidateLength; k++) {
        bestIndices[targetOffset + k] = candidateIndices[k];
      }
    } else {
      // 將前一個狀態原樣延續下去。
      const skipLength = bestLength[skipState];
      const skipOffset = skipState << 2;
      bestWeight[targetState] = skipWeight;
      bestLength[targetState] = skipLength;
      for (let k = 0; k < skipLength; k++) {
        bestIndices[targetOffset + k] = bestIndices[skipOffset + k];
      }
    }
  }
}
```

### Step 10：從終點狀態取出答案並回傳

最終狀態位於「挑滿上限個數、且涵蓋全部前綴」之處，其保存的索引清單本身已是遞增排列，逐一複製至結果陣列後即可直接回傳。

```typescript
// 最終狀態已經以遞增順序保存了答案。
const finalState = maximumPicks * stateCount + intervalCount;
const finalLength = bestLength[finalState];
const finalOffset = finalState << 2;
const result: number[] = new Array(finalLength);
for (let k = 0; k < finalLength; k++) {
  result[k] = bestIndices[finalOffset + k];
}
return result;
```

## 時間複雜度

- 打包並排序所有區間需 $O(n \log n)$；
- 解包成扁平陣列為一次線性掃描 $O(n)$；
- 對每個區間各執行一次二分搜尋求相容前綴，合計 $O(n \log n)$；
- 動態規劃共有 $O(4n)$ 個狀態，每個狀態的清單合併與字典序比較長度皆不超過 4，為常數時間，合計 $O(n)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 排序鍵與解包後的端點、權重、索引陣列皆為 $O(n)$；
- 相容前綴長度陣列為 $O(n)$；
- 動態規劃表格共 $O(4n)$ 個狀態，每個狀態最多保存 4 個索引，仍為 $O(n)$；
- 不計輸出結果所佔用的空間；
- 總空間複雜度為 $O(n)$。

> $O(n)$
