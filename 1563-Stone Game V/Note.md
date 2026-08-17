# 1563. Stone Game V

There are several stones arranged in a row, and each stone has an associated value 
which is an integer given in the array `stoneValue`.

In each round of the game,
Alice divides the row into two non-empty rows (i.e. left row and right row), 
then Bob calculates the value of each row which is the sum of the values of all the stones in this row. 
Bob throws away the row which has the maximum value, 
and Alice's score increases by the value of the remaining row. 
If the value of the two rows are equal, 
Bob lets Alice decide which row will be thrown away. 
The next round starts with the remaining row.

The game ends when there is only one stone remaining. 
Alice's score is initially zero.

Return the maximum score that Alice can obtain.

**Constraints:**

- `1 <= stoneValue.length <= 500`
- `1 <= stoneValue[i] <= 10^6`

## 基礎思路

本題描述一個逐輪切分的博弈過程：每一輪將目前的石頭序列切成左右兩段，較重的一段被丟棄，較輕的一段的總和計入分數並成為下一輪的序列；
兩段等重時可自行決定保留哪一段。
目標是最大化累積分數。

在思考解法時，可掌握以下核心觀察：

- **子問題具有區間結構**：
  每一輪保留的必定是原序列的一個連續區間，且後續所有決策都只依賴該區間本身，因此可用「區間的最佳得分」作為狀態，並由短區間推導長區間。

- **切分點的可行性具單調性**：
  將切分點由左往右移動時，左半部的總和單調遞增、右半部單調遞減。因此存在一個分界位置，其左側的所有切分皆是「左半較輕」，其右側的所有切分皆是「右半較輕」，兩類切分可分別處理。

- **只需知道「保留左半」與「保留右半」的最佳值**：
  在同一類切分中，被保留的子區間必定共用同一個端點，因此可各自維護一張以該端點為軸的前綴最大值表，將原本需要逐一枚舉切分點的動作壓縮為兩次查表。

- **分界位置隨區間右端擴張而單調前移**：
  固定左端點時，右端點越大則整體總和越大，分界位置只會往右移動，因此可用一個不回頭的指標攤還地維護，避免重複掃描。

- **區間總和可由前綴和常數時間取得**：
  任意區間的總和都能以兩個前綴值相減求出，且在給定的數值上限下不會超出 32 位元整數範圍。

依據以上特性，可以採用以下策略：

- **先建立前綴和**，使任意區間總和的查詢成為常數時間操作。
- **以左端點由大到小的順序枚舉所有區間**，保證所需的較短子區間都已求解完畢。
- **對每個區間定位分界位置**，依「恰好等分」與「不等分」兩種情形，分別從兩張最大值表中取出最佳的後續得分。
- **將剛解出的區間結果折回兩張最大值表**，供更長的區間直接查詢。
- **最後求解的區間即為整列石頭**，其結果就是答案。

此策略把原本需要枚舉切分點的三重迴圈壓縮為兩重，兼顧正確性與效能。

## 解題步驟

### Step 1：處理無法進行任何回合的邊界情況

先取得石頭數量；若只有一顆石頭，則永遠無法切分成兩個非空段落，一輪都不會發生，分數必為 0。

```typescript
const stoneCount = stoneValue.length;

// 單獨一顆石頭永遠無法被切分，因此不會進行任何一輪。
if (stoneCount < 2) {
  return 0;
}
```

### Step 2：建立前綴和以便常數時間取得區間總和

累積前綴和後，任意區間的總和都能以一次減法求得。由於數值與長度的上限相乘後仍在 32 位元整數範圍內，可安全使用型別化陣列儲存。

```typescript
// 前綴和讓每個區間總和只需一次減法即可取得。
// 最大可能總和為 500 * 10^6，仍可容納於 Int32 中。
const prefixSum = new Int32Array(stoneCount + 1);
for (let index = 0; index < stoneCount; index++) {
  prefixSum[index + 1] = prefixSum[index] + stoneValue[index];
}
```

### Step 3：建立兩張扁平化的最大值表

分別建立「以區間左端為軸」與「以區間右端為軸」的兩張最大值表，並將二維結構攤平為一維型別化陣列，使內層迴圈存取的是連續記憶體而非巢狀陣列物件。

```typescript
// 兩張表皆攤平為單一型別化陣列，使內層迴圈走訪連續記憶體，
// 而非在巢狀陣列物件之間追指標。
const bestKeepLeft = new Int32Array(stoneCount * stoneCount);
const bestKeepRight = new Int32Array(stoneCount * stoneCount);
```

### Step 4：宣告用於承接目前區間解的變數

此變數保存目前正在求解的區間結果；由於最後被求解的區間必定是整列石頭，兩層迴圈結束後其值即為最終答案。

```typescript
// 保存目前區間的 dp[start][end]；最後被求解的區間即為整列石頭，
// 因此兩層迴圈結束後此變數已帶有答案。
let bestScore = 0;
```

### Step 5：以左端點由大到小枚舉區間並初始化單一石頭情形

外層迴圈讓左端點由大到小推進，確保後續需要用到的較短子區間都已折疊進兩張表中。進入迴圈後先取得該列的偏移量與起點前綴值，並寫入單一石頭區間的表格值；同時初始化不會回頭的分界指標。

```typescript
// 區間以左端點遞減的順序求解，這保證下方所需的每個較短子區間
// 都已折疊進兩張表中。
for (let start = stoneCount - 1; start >= 0; start--) {
  const rowOffset = start * stoneCount;
  const startPrefix = prefixSum[start];
  const singleValue = prefixSum[start + 1] - startPrefix;

  // 單一石頭的區間無法得分，因此兩張表只承載其本身的值。
  bestKeepLeft[rowOffset + start] = singleValue;
  bestKeepRight[rowOffset + start] = singleValue;

  // 隨著右端點增長，分界點永遠不會往回移動。
  let balanceIndex = start;

  // ...
}
```

### Step 6：擴張右端點並攤還地推進分界點

內層迴圈逐步擴張右端點。每次先取得目前區間的總和，再讓分界指標持續前進，直到左半部的總和至少達到整體的一半；接著記錄該處左半總和的兩倍，作為後續判斷是否恰好等分的依據。

```typescript
for (let start = stoneCount - 1; start >= 0; start--) {
  // Step 5：初始化區間起點資訊、單一石頭表格值與分界指標

  for (let end = start + 1; end < stoneCount; end++) {
    const totalSum = prefixSum[end + 1] - startPrefix;

    // 持續前進，直到左半部至少達到整個區間的一半。
    while ((prefixSum[balanceIndex + 1] - startPrefix) * 2 < totalSum) {
      balanceIndex++;
    }

    const doubledLeftSum = (prefixSum[balanceIndex + 1] - startPrefix) * 2;

    // ...
  }
}
```

### Step 7：依分界情形選出最佳的後續得分

若左右恰好等重，則分界處本身也是可自由選擇保留哪一側的合法切點，因此「保留左半」的查詢範圍可延伸到並包含分界處，再與「保留右半」的最佳值取較大者。若非等重，則分界之前的切分必定使左半較輕，分界之後的切分必定使右半較輕，兩類分別查表後取較大者；並在該類切分不存在時予以略過。

```typescript
for (let start = stoneCount - 1; start >= 0; start--) {
  // Step 5：初始化區間起點資訊、單一石頭表格值與分界指標

  for (let end = start + 1; end < stoneCount; end++) {
    // Step 6：計算區間總和並推進分界點

    if (doubledLeftSum === totalSum) {
      // 完全均分：此時 Alice 可保留任一側，
      // 因此保留左半的區塊可延伸到並包含分界點。
      bestScore = bestKeepLeft[rowOffset + balanceIndex];
      const rightScore = bestKeepRight[(balanceIndex + 1) * stoneCount + end];
      if (rightScore > bestScore) {
        bestScore = rightScore;
      }
    } else {
      bestScore = 0;
      // 分界之前的切分會留下嚴格較輕的左半部。
      if (balanceIndex > start) {
        const leftScore = bestKeepLeft[rowOffset + balanceIndex - 1];
        if (leftScore > bestScore) {
          bestScore = leftScore;
        }
      }
      // 分界之後（含）的切分會留下嚴格較輕的右半部。
      if (balanceIndex < end) {
        const rightScore = bestKeepRight[(balanceIndex + 1) * stoneCount + end];
        if (rightScore > bestScore) {
          bestScore = rightScore;
        }
      }
    }

    // ...
  }
}
```

### Step 8：將剛解出的區間結果折回兩張最大值表

當前區間若被保留，其貢獻為後續最佳得分加上本區間的總和。將此值分別與兩張表中相鄰位置的既有最大值比較後寫入，使兩張表持續維持沿各自軸向的前綴最大值性質，供更長的區間直接查詢。

```typescript
for (let start = stoneCount - 1; start >= 0; start--) {
  // Step 5：初始化區間起點資訊、單一石頭表格值與分界指標

  for (let end = start + 1; end < stoneCount; end++) {
    // Step 6：計算區間總和並推進分界點

    // Step 7：依分界情形選出最佳的後續得分

    // 將剛解出的區間折疊進兩張持續累積的最大值表中。
    const wholeRangeValue = bestScore + totalSum;
    const previousLeft = bestKeepLeft[rowOffset + end - 1];
    bestKeepLeft[rowOffset + end] = previousLeft > wholeRangeValue ? previousLeft : wholeRangeValue;
    const previousRight = bestKeepRight[(start + 1) * stoneCount + end];
    bestKeepRight[rowOffset + end] = previousRight > wholeRangeValue ? previousRight : wholeRangeValue;
  }
}
```

### Step 9：回傳整列石頭的最佳得分

兩層迴圈結束時，最後被求解的區間正是整列石頭，因此目前承接的結果即為答案，直接回傳。

```typescript
return bestScore;
```

## 時間複雜度

- 建立前綴和需一次線性掃描，為 $O(n)$；
- 兩層迴圈共列舉 $O(n^2)$ 個區間；
- 每個區間內僅進行常數次查表與比較，而分界指標在固定左端點下只單向前進，整列攤還後為 $O(n)$；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 前綴和陣列佔用 $O(n)$；
- 兩張攤平的最大值表各佔用 $O(n^2)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
