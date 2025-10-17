# 3003. Maximize the Number of Partitions After Operations

You are given a string s and an integer `k`.

First, you are allowed to change at most one index in `s` to another lowercase English letter.

After that, do the following partitioning operation until `s` is empty:

- Choose the longest prefix of `s` containing at most `k` distinct characters.
- Delete the prefix from `s` and increase the number of partitions by one. 
  The remaining characters (if any) in `s` maintain their initial order.

Return an integer denoting the maximum number of resulting partitions after the operations by optimally choosing at most one index to change.

**Constraints:**

- `1 <= s.length <= 10^4`
- `s` consists only of lowercase English letters.
- `1 <= k <= 26`

## 基礎思路

本題要在**最多改動一次字元**之後，反覆將字串切去「最長且**至多含 `k` 種不同字元**的前綴」，並計數能切出幾段；我們要讓此段數最大化。思考時需注意：

- **貪婪切割規則**：每次必須刪除「最長」且「至多 `k` 種字元」的前綴，這會固定每步的切點，無法任意分段。
- **一次改字優化**：改動某一位置的字元，目標是**多創造新的切點**或**延後某些字元首次出現**來提升段數；改字位置與改成的字母都需最優化。
- **特例 `k=1`**：每段只能含一種字元，等價於把字串分解為同字元連續區塊（runs）。一次改字可把某個 run 延長或在鄰近處複製以多切幾段，需特判。
- **線性掃描 + 前後資訊**：若能在一次右到左的掃描中，預先算出「從任一位置起、在不改字與改 1 次字下」的後綴可切段數，再在左到右掃描時，把「目前前綴狀態」與該後綴資訊結合，就能在 **O(n)** 內完成最佳化決策。
- **位元集合表達**：英文字母僅 26 種，使用位元遮罩可在常數時間內維護「當前區塊的字元集合」與「是否已滿 `k` 種」。

策略綱要：

- 對 `k=1` 走特判：以 run 為單位計數，並用一次改字把答案最多再提高固定常數（由題內推導）。
- 一般情況以**雙向掃描**：
    - **後綴動態**（右→左）：同時維護「最多 `k` 種」與「最多 `k-1` 種」兩種後綴分段數，並保留某些集合快照以供前向決策。
    - **前綴掃描**（左→右）：在線維護目前區塊的集合與段數，根據是否用掉「一次改字的第二次機會」來決定要接哪個後綴分段（`k` 或 `k-1` 模式），從而最大化總段數。
- 藉由位元遮罩與常數大小的字母集，我們能讓所有集合操作攤為**常數時間**，總計 **O(n)** 時間、**O(n)** 空間完成。

## 解題步驟

### Step 1：早期結束判定（`k` 夠大或已覆蓋）

此步檢查當 `k` 已覆蓋全部字母（或大於實際不同字母數）時，最長前綴就是整串，只能切 1 段。

```typescript
// 早期結束條件（與原始版本相同）
if (k === 26 || k > new Set(s).size) {
  return 1;
}
```

### Step 2：特判 `k === 1`（以連續區塊為單位）

當每段最多 1 種字元時，原始分段數等於「連續相同字元區塊（runs）」個數。一次改字可在有限範圍內提高答案，原程式以線性掃描求得。

```typescript
// 當 k === 1 的特殊情形
if (k === 1) {
  let maxRunLength = 0;
  let currentRunLength = 0;
  let partitionCountMinusOne = -1;
  let previousCharacter = '';

  for (const currentCharacter of s) {
    if (currentCharacter === previousCharacter) {
      currentRunLength += 1;
    } else {
      maxRunLength = Math.max(maxRunLength, currentRunLength);
      currentRunLength = 1;
      previousCharacter = currentCharacter;
      partitionCountMinusOne += 1;
    }
  }

  maxRunLength = Math.max(maxRunLength, currentRunLength);

  return partitionCountMinusOne + Math.min(maxRunLength, 3);
}
```

### Step 3：預處理字元位元遮罩

將每個字元轉為對應的 26 位元遮罩，以利後續常數時間集合運算。

```typescript
const stringLength = s.length;

// 將字串轉為每個字元的位元遮罩
const characterBitMaskArray = new Uint32Array(stringLength);
for (let i = 0; i < stringLength; i++) {
  characterBitMaskArray[i] = 1 << (s.charCodeAt(i) - 97);
}
```

### Step 4：配置後綴 DP 結構與快照

建立兩種後綴分段數陣列（`k` 與 `k-1` 模式），以及在右到左過程中需要的集合快照；同時初始化每個字母最後一次出現位置（供雙指標回退用）。

```typescript
// 型別陣列（後綴計算）
const suffixPartitionFull = new Int32Array(stringLength);
const suffixPartitionPartial = new Int32Array(stringLength);
const prefixSetSnapshot = new Uint32Array(stringLength);

// 映射：每個字母位元 → 最近出現的索引（初始為 stringLength）
const latestIndexByBit = Object.fromEntries(
  Array.from({ length: 26 }, (_: unknown, index: number) =>
    [(1 << index), stringLength]
  )
);
```

### Step 5：初始化右到左掃描狀態

同時維護「滿 `k`」與「滿 `k-1`」兩種集合狀態、其不同字元計數、當前後綴分段數與雙指標。

```typescript
// 右到左的狀態變數
let currentSetFullMask = 0;
let currentDistinctFullCount = 0;
let currentPartitionFull = 1;
let pointerFull = stringLength - 1;

let currentSetPartialMask = 0;
let currentDistinctPartialCount = 0;
let currentPartitionPartial = 1;
let pointerPartial = stringLength - 1;
```

### Step 6：建構後綴分段資訊（右→左）

主迴圈同時維護 `k-1` 與 `k` 兩種模式的後綴分段；當新加入的字元使得集合超標時，透過指標回退、彈出最右邊必要字元以開啟新段，並更新分段數。同步記錄某些集合快照給前向掃描使用。

```typescript
// 自右向左建構後綴分段
for (let index = stringLength - 1; index >= 0; index--) {
  suffixPartitionPartial[index] = currentPartitionPartial;
  prefixSetSnapshot[index] = currentSetFullMask;

  // 更新「k - 1」集合（追蹤至多 k - 1 種不同字元）
  if ((currentSetPartialMask & characterBitMaskArray[index]) === 0) {
    if (currentDistinctPartialCount === k - 1) {
      while (pointerPartial > latestIndexByBit[characterBitMaskArray[pointerPartial]]) {
        pointerPartial -= 1;
      }
      currentPartitionPartial = suffixPartitionFull[pointerPartial] + 1;
      currentSetPartialMask ^= characterBitMaskArray[pointerPartial];
      pointerPartial -= 1;
      currentDistinctPartialCount -= 1;
    }
    currentSetPartialMask |= characterBitMaskArray[index];
    currentDistinctPartialCount += 1;
  }

  // 更新「k」集合（追蹤至多 k 種不同字元）
  if ((currentSetFullMask & characterBitMaskArray[index]) === 0) {
    if (currentDistinctFullCount === k) {
      while (pointerFull > latestIndexByBit[characterBitMaskArray[pointerFull]]) {
        pointerFull -= 1;
      }
      currentPartitionFull = suffixPartitionFull[pointerFull] + 1;
      currentSetFullMask ^= characterBitMaskArray[pointerFull];
      pointerFull -= 1;
      currentDistinctFullCount -= 1;
    }
    currentSetFullMask |= characterBitMaskArray[index];
    currentDistinctFullCount += 1;
  }

  suffixPartitionFull[index] = currentPartitionFull;
  latestIndexByBit[characterBitMaskArray[index]] = index;
}
```

### Step 7：前向掃描初始化（左→右）

準備最佳答案、以及針對「當前區塊」的集合/計數/段數。`seenDuplicateInBlock` 與 `hasPendingSecondChance` 用來判斷此區塊是否有重複字元、以及是否可嘗試用一次改字，來連接不同後綴模式以提升答案。

```typescript
// 前向掃描初始化
let bestResult = suffixPartitionFull[0];
let seenDuplicateInBlock = false;
let hasPendingSecondChance = false;

let currentSetForwardMask = 0;
let currentDistinctForwardCount = 0;
let currentPartitionForward = 1;
const allLetterMask = (1 << 26) - 1;
```

### Step 8：前向掃描與合併後綴答案（左→右）

線性掃描 `s`，維護當前前綴的集合與段數；

- 當新字元使得目前區塊將滿 `k` 種時，記下「第二次機會」以便之後嘗試改字；
- 若再遇到重複字元且「第二次機會」成立，依快照判斷是否接 `k-1` 或 `k` 的後綴分段，以最大化答案；
- 若字元種類超標，則結束當前區塊並開新段。

```typescript
for (let index = 0; index < stringLength; index++) {
  if ((currentSetForwardMask & characterBitMaskArray[index]) === 0) {
    // 當前前綴中新出現一種字元
    if (currentDistinctForwardCount === k - 1) {
      if (seenDuplicateInBlock) {
        bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionFull[index]);
      }
      hasPendingSecondChance = true;
    } else if (currentDistinctForwardCount === k) {
      seenDuplicateInBlock = false;
      hasPendingSecondChance = false;
      currentSetForwardMask = 0;
      currentDistinctForwardCount = 0;
      currentPartitionForward += 1;
    }

    currentSetForwardMask |= characterBitMaskArray[index];
    currentDistinctForwardCount += 1;
  } else if (hasPendingSecondChance) {
    if ((currentSetForwardMask | prefixSetSnapshot[index]) < allLetterMask) {
      bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionPartial[index]);
    } else {
      bestResult = Math.max(bestResult, currentPartitionForward + suffixPartitionFull[index]);
    }
    hasPendingSecondChance = false;
  } else if (!seenDuplicateInBlock) {
    seenDuplicateInBlock = true;
  }
}
```

### Step 9：回傳最佳答案

前向掃描結束後，回傳全域最佳分段數。

```typescript
return bestResult;
```

## 時間複雜度

- 轉換位元遮罩與各種線性掃描皆為一次遍歷，合計 **$O(n)$**。
- 右到左的後綴建構與左到右的前綴掃描各一次，位元集合操作與指標回退皆在常數時間內完成。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需儲存數個長度為 `n` 的型別陣列（位元遮罩、兩種後綴分段、快照）為 **$O(n)$**。
- 另有固定大小（26）的映射/位元操作，為 **$O(1)$** 額外開銷。
- 總空間複雜度為 $O(n)$。

> $O(n)$
