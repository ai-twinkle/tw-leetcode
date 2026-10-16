# 2916. Subarrays Distinct Element Sum of Squares II

You are given a 0-indexed integer array `nums`.

The distinct count of a subarray of `nums` is defined as:

- Let `nums[i..j]` be a subarray of `nums` consisting of all the indices from `i` to `j` such that `0 <= i <= j < nums.length`. 
  Then the number of distinct values in `nums[i..j]` is called the distinct count of `nums[i..j]`.

Return the sum of the squares of distinct counts of all subarrays of `nums`.

Since the answer may be very large, return it modulo `10^9 + 7`.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要求計算所有子陣列「相異值個數」的平方總和，並對 `10^9 + 7` 取模。陣列長度可達 `10^5`，子陣列數量約為 `n^2 / 2`，逐一枚舉子陣列再計算相異數完全不可行，因此需要以增量方式累計答案。

在思考解法時，可掌握以下核心觀察：

- **固定右端點，維護所有左端點的彙總量**：
  依序推進右端點，並同時維護「所有左端點對應子陣列的相異數總和」與「相異數平方總和」。每推進一步，就把當下的平方總和累加進答案。

- **新元素只影響部分左端點**：
  右端點加入一個值時，只有左端點位於「該值上一次出現位置」之後的子陣列，相異數才會增加一。左端點更早的子陣列原本就包含此值，相異數不變。

- **平方的增量可由一次方總和推得**：
  相異數由 `d` 變為 `d + 1` 時，平方增加 `2d + 1`。因此只需取得受影響左端點的相異數總和，即可更新平方總和。

- **受影響區段的相異數總和可轉換為位置計數**：
  每個值只以其「最後一次出現位置」貢獻相異數。受影響左端點的相異數總和，等於所有位於上一次出現位置之後的「存活最後出現位置」與該位置的距離總和。

- **不同資料分布適合不同的彙總方式**：
  - 若重複值彼此靠近或數量稀少，直接逐一走訪存活位置的成本很低。
  - 若重複值多且間距大，走訪會過長，此時以樹狀陣列（Fenwick 樹）進行區間彙總較穩定。

- **浮點數的精確範圍可用於延遲取模**：
  在 `2^53` 以下浮點數可精確表示整數，因此可累積到接近上界時才取模，減少取模次數。同理，也能把「位置總和」與「計數」打包進同一個數值，一次查詢同時取得兩者。

依據以上特性，可以採用以下策略：

- **先做一次預掃描**，求出每個位置上一次出現同值的位置，並統計相異值數量、重複次數與重複間距總和，用以估算走訪成本。
- **成本低時採用雙向鏈結串列走訪引擎**，直接走訪受影響的存活位置，並在更新後移除舊位置、加入新位置。
- **成本高時採用 Fenwick 樹引擎**，在反轉後的位置上以前綴查詢取得受影響存活位置的總和與數量，並以合併路徑的方式同時完成移除與插入。
- **兩種引擎皆以延遲取模的方式累計答案**，確保數值精確並降低運算成本。

此策略能依輸入分布自動選擇較快的引擎，在各種情況下都能高效完成計算。

## 解題步驟

### Step 1：初始化走訪引擎的常數、鏈結串列與累計狀態

走訪引擎以雙向鏈結串列串起所有存活的最後出現位置。串列以「位置加一」的方式儲存，`0` 表示不存在。同時準備平方和、一次方和、待取模累計值與答案等狀態，並設定延遲取模的上界，確保累計值在浮點精確範圍內。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  const modulo = 1000000007;
  // 平方和在 2^53 以下皆可精確表示，因此僅在接近此界線時才取模
  const reduceLimit = 4000000000000000;
  const previousLive = new Int32Array(length + 2);
  const nextLive = new Int32Array(length + 2);
  let highestLive = -1;
  let squareSum = 0;
  let liveSum = 0;
  let pending = 0;
  let answer = 0;

  // ...
}
```

### Step 2：推進右端點並處理首次出現的值

逐一推進右端點，先取得該值上一次出現的位置。若為首次出現，則所有左端點的相異數都會加一。此時受影響的相異數總和就是目前維護的一次方總和，直接以 `2 * liveSum + (index + 1)` 更新平方和即可。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  // Step 1：初始化常數、鏈結串列與累計狀態

  for (let index = 0; index < length; index++) {
    const previous = previousIndex[index];

    if (previous < 0) {
      // 全新的值會使每個左端點的相異數加一，因此僅需使用累計總和即可
      squareSum += 2 * liveSum + (index + 1);
      liveSum += index + 1;
    } else {
      // ...
    }

    // ...
  }

  // ...
}
```

### Step 3：走訪受影響的存活位置並更新平方和

若此值先前出現過，只有左端點位於前一次出現位置之後者會受影響。從最新的存活位置往回走訪，直到越過前一次出現位置為止，並累加每個存活位置到該位置的距離，得到受影響左端點的相異數總和，再據此更新平方和與一次方和。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  // Step 1：初始化常數、鏈結串列與累計狀態

  for (let index = 0; index < length; index++) {
    // Step 2：讀取前一次出現位置

    if (previous < 0) {
      // Step 2：首次出現時以累計總和更新
    } else {
      // 只有位於前一個相同值之後的左端點，其相異數才會增加一
      let widthSum = 0;
      for (let live = highestLive; live > previous; live = previousLive[live + 1] - 1) {
        widthSum += live - previous;
      }
      squareSum += 2 * widthSum + (index - previous);
      liveSum += index - previous;

      // ...
    }

    // ...
  }

  // ...
}
```

### Step 4：將前一次出現位置自鏈結串列中移除

當前位置成為此值新的最後出現位置後，前一次出現位置就不再存活，需從雙向鏈結串列中摘除。若它正是目前最高的存活位置，則一併更新最高存活位置。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  // Step 1：初始化常數、鏈結串列與累計狀態

  for (let index = 0; index < length; index++) {
    // Step 2：讀取前一次出現位置

    if (previous < 0) {
      // Step 2：首次出現時以累計總和更新
    } else {
      // Step 3：走訪存活位置並更新平方和

      // 前一個相同值不再是最後出現位置
      const linkBefore = previousLive[previous + 1];
      const linkAfter = nextLive[previous + 1];
      if (linkAfter > 0) {
        previousLive[linkAfter] = linkBefore;
      }
      if (linkBefore > 0) {
        nextLive[linkBefore] = linkAfter;
      }
      if (highestLive === previous) {
        highestLive = linkBefore - 1;
      }
    }

    // ...
  }

  // ...
}
```

### Step 5：將當前位置接到鏈結串列尾端

無論此值是否為首次出現，當前位置都會成為最新的最後出現位置。由於位置遞增，直接接在串列尾端即可維持有序，並更新最高存活位置。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  // Step 1：初始化常數、鏈結串列與累計狀態

  for (let index = 0; index < length; index++) {
    // Step 2：讀取前一次出現位置

    if (previous < 0) {
      // Step 2：首次出現時以累計總和更新
    } else {
      // Step 3：走訪存活位置並更新平方和

      // Step 4：將前一次出現位置自串列移除
    }

    // 目前索引成為最新的最後出現位置
    previousLive[index + 1] = highestLive + 1;
    nextLive[index + 1] = 0;
    if (highestLive >= 0) {
      nextLive[highestLive + 1] = index + 1;
    }
    highestLive = index;

    // ...
  }

  // ...
}
```

### Step 6：延遲取模累計答案並回傳

每推進一次右端點，就將當下的平方和加入待取模累計值。只有在累計值接近浮點精確上界時才取模，迴圈結束後再把剩餘部分併入答案並回傳。

```typescript
/**
 * 透過雙向鏈結串列直接走訪目前存活的最後出現位置。
 * 適用於重複值彼此靠近或很少出現的陣列，此時每次走訪都很短。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  // Step 1：初始化常數、鏈結串列與累計狀態

  for (let index = 0; index < length; index++) {
    // Step 2：讀取前一次出現位置

    if (previous < 0) {
      // Step 2：首次出現時以累計總和更新
    } else {
      // Step 3：走訪存活位置並更新平方和

      // Step 4：將前一次出現位置自串列移除
    }

    // Step 5：將當前位置接到串列尾端

    pending += squareSum;
    if (pending > reduceLimit) {
      answer = (answer + pending % modulo) % modulo;
      pending = 0;
    }
  }

  return (answer + pending % modulo) % modulo;
}
```

### Step 7：初始化 Fenwick 引擎的常數與狀態

Fenwick 引擎把每個存活位置以「(位置 + 1) × 2^17 + 1」的形式存入樹中。如此一次前綴查詢就能同時取得位置總和（高位部分）與存活數量（低位部分）。由於位置小於 `2^17`，打包後的數值仍可精確表示。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  const modulo = 1000000007;
  // 將位置與單位計數器打包進一個精確的 float64（位置 < 2^17）
  const countScale = 131072;
  const reduceLimit = 4000000000000000;
  const tree = new Float64Array(length + 1);
  let squareSum = 0;
  let liveSum = 0;
  let pending = 0;
  let answer = 0;

  // ...
}
```

### Step 8：處理首次出現的值並插入樹中

與走訪引擎相同，首次出現的值可直接以一次方總和更新平方和。接著將當前位置插入 Fenwick 樹。樹建立在反轉位置上，因此「位置大於某值」的查詢可轉成前綴查詢。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  // Step 7：初始化常數與狀態

  for (let index = 0; index < length; index++) {
    const previous = previousIndex[index];

    if (previous < 0) {
      // 首次出現：目前維護的總和已涵蓋所有左端點
      squareSum += 2 * liveSum + (index + 1);
      liveSum += index + 1;
      const insertion = (index + 1) * countScale + 1;
      for (let node = length - index; node <= length; node += node & -node) {
        tree[node] += insertion;
      }
    } else {
      // ...
    }

    // ...
  }

  // ...
}
```

### Step 9：查詢受影響的存活位置並更新平方和

若此值先前出現過，分兩種情況處理：

- **緊鄰前一個位置重複**：其後沒有任何存活位置，只新增單一元素子陣列，平方和加一即可。
- **其他情況**：以一次前綴查詢取得前一次出現位置之後所有存活位置的打包總和，拆出存活數量與位置總和，換算出受影響左端點的相異數總和，再更新平方和。

最後更新一次方和。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  // Step 7：初始化常數與狀態

  for (let index = 0; index < length; index++) {
    // Step 8：讀取前一次出現位置

    if (previous < 0) {
      // Step 8：首次出現時更新累計值並插入樹中
    } else {
      if (previous === index - 1) {
        // 緊鄰的重複值之後沒有任何存活位置，因此只有 [index, index] 是新的
        squareSum += 1;
      } else {
        // 彙總位於 previous 之後的存活位置：一次查詢即可同時得到總和與計數
        let packed = 0;
        for (let node = length - previous - 1; node > 0; node -= node & -node) {
          packed += tree[node];
        }
        const liveCount = packed % countScale;
        const positionSum = (packed - liveCount) / countScale;
        // 每個受影響的相異數 d 變為 d + 1，因此 d^2 增加 2d + 1
        squareSum += 2 * (positionSum - (previous + 1) * liveCount) + (index - previous);
      }
      liveSum += index - previous;

      // ...
    }

    // ...
  }

  // ...
}
```

### Step 10：沿兩條上升路徑分別執行插入與移除

接著要同時「移除前一次出現位置」並「插入當前位置」。兩者在樹中的上升路徑會在某處交會：

- **交會之前**：每次推進較小的節點，分別套用插入量或移除量。
- **移除路徑先超出樹範圍時**：將其對齊到插入路徑並結束分離更新。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  // Step 7：初始化常數與狀態

  for (let index = 0; index < length; index++) {
    // Step 8：讀取前一次出現位置

    if (previous < 0) {
      // Step 8：首次出現時更新累計值並插入樹中
    } else {
      // Step 9：查詢受影響的存活位置並更新平方和

      // 移除 previous 並加入 index；在兩條上升路徑交會之後，計數相互抵銷，
      // 僅剩位置差值需要繼續向上傳遞
      let risingNode = length - index;
      let fallingNode = length - previous;
      const insertion = (index + 1) * countScale + 1;
      const removal = -((previous + 1) * countScale + 1);
      while (risingNode !== fallingNode) {
        if (risingNode < fallingNode) {
          tree[risingNode] += insertion;
          risingNode += risingNode & -risingNode;
        } else {
          tree[fallingNode] += removal;
          fallingNode += fallingNode & -fallingNode;
          if (fallingNode > length) {
            fallingNode = risingNode;
            break;
          }
        }
      }

      // ...
    }

    // ...
  }

  // ...
}
```

### Step 11：交會後以合併差值更新共同祖先

兩條路徑交會後，其後的節點同時受插入與移除影響。兩者的計數部分相互抵銷，只需沿共同路徑向上傳遞位置差值，即可一次完成剩餘更新。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  // Step 7：初始化常數與狀態

  for (let index = 0; index < length; index++) {
    // Step 8：讀取前一次出現位置

    if (previous < 0) {
      // Step 8：首次出現時更新累計值並插入樹中
    } else {
      // Step 9：查詢受影響的存活位置並更新平方和

      // Step 10：沿兩條上升路徑分別執行插入與移除

      const mergedDelta = (index - previous) * countScale;
      for (let node = risingNode; node <= length; node += node & -node) {
        tree[node] += mergedDelta;
      }
    }

    // ...
  }

  // ...
}
```

### Step 12：延遲取模累計答案並回傳

與走訪引擎相同，每輪將平方和加入待取模累計值，接近精確上界時才取模，最後併入剩餘部分並回傳。

```typescript
/**
 * 以一棵建立於反轉位置上的 Fenwick 樹回答相同的每步彙總，
 * 每個存活位置貢獻 (position + 1) * 2^17 + 1，使總和與計數得以同時攜帶。
 * 適用於含有大量相距甚遠重複值的陣列，此時走訪會過長。
 *
 * @param previousIndex - 每個索引對應的前一個相同值索引，若不存在則為 -1。
 * @param length - 元素數量。
 * @returns 所有子陣列相異數平方和對 10^9 + 7 取模的結果。
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  // Step 7：初始化常數與狀態

  for (let index = 0; index < length; index++) {
    // Step 8：讀取前一次出現位置

    if (previous < 0) {
      // Step 8：首次出現時更新累計值並插入樹中
    } else {
      // Step 9：查詢受影響的存活位置並更新平方和

      // Step 10：沿兩條上升路徑分別執行插入與移除

      // Step 11：交會後以合併差值更新共同祖先
    }

    pending += squareSum;
    if (pending > reduceLimit) {
      answer = (answer + pending % modulo) % modulo;
      pending = 0;
    }
  }

  return (answer + pending % modulo) % modulo;
}
```

### Step 13：求出輸入中的最大值

進入主函數後，先找出輸入的最大值，讓後續的出現位置表只需配置到實際數值範圍，小輸入不會浪費空間。

```typescript
const length = nums.length;

// 依實際數值範圍決定出現位置表的大小，讓小輸入維持低成本
let maximumValue = 0;
for (let index = 0; index < length; index++) {
  if (nums[index] > maximumValue) {
    maximumValue = nums[index];
  }
}
```

### Step 14：預掃描建立前一索引陣列並統計工作量

以一次掃描記錄每個值最後出現的位置（以加一儲存，`0` 表示未出現），進而求出每個位置上一次出現同值的索引。同時統計相異值數量、重複次數與重複間距總和，作為選擇引擎的依據。

```typescript
// 一次預掃描即可將數值查詢轉為依序排列的前一索引陣列，
// 並估算走訪引擎所需的工作量
const lastSeen = new Int32Array(maximumValue + 1);
const previousIndex = new Int32Array(length);
let distinctTotal = 0;
let duplicateTotal = 0;
let gapTotal = 0;
for (let index = 0; index < length; index++) {
  const value = nums[index];
  const previous = lastSeen[value] - 1;
  lastSeen[value] = index + 1;
  previousIndex[index] = previous;
  if (previous < 0) {
    distinctTotal++;
  } else {
    duplicateTotal++;
    gapTotal += index - previous;
  }
}
```

### Step 15：依估算成本選擇引擎並回傳結果

每次走訪拜訪的節點數不超過「重複間距」與「相異值數量」兩者中的較小值。因此只要間距總和，或重複次數乘以相異值數量，任一不超過預算 `40n`，走訪引擎的總成本就有保證，此時採用走訪引擎。否則改用 Fenwick 引擎。

```typescript
// 每次走訪最多拜訪 min(間距, 相異值數量) 個節點，因此兩個乘積皆可界定其成本；
// 40n 為實測與 Fenwick 引擎的效能交叉點
const walkBudget = 40 * length;
if (gapTotal <= walkBudget || duplicateTotal * distinctTotal <= walkBudget) {
  return sumByLiveWalk(previousIndex, length);
}

return sumByFenwick(previousIndex, length);
```

## 時間複雜度

- 求最大值與預掃描皆為一次線性掃描，為 $O(n)$；配置並初始化出現位置表需 $O(m)$，其中 $m$ 為輸入中的最大值。
- 選用走訪引擎時，總走訪次數受預算 $40n$ 限制，鏈結串列的插入與移除皆為常數時間，整體為 $O(n)$。
- 選用 Fenwick 引擎時，每個位置僅進行常數次查詢與更新，每次為 $O(\log n)$，整體為 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n + m)$。

> $O(n \log n + m)$

## 空間複雜度

- 出現位置表需 $O(m)$。
- 前一索引陣列、鏈結串列的兩個陣列或 Fenwick 樹皆為 $O(n)$。
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
