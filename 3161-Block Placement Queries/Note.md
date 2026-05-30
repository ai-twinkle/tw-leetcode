# 3161. Block Placement Queries

There exists an infinite number line, with its origin at 0 and extending towards the positive x-axis.

You are given a 2D array `queries`, which contains two types of queries:

1. For a query of type 1, `queries[i] = [1, x]`. 
   Build an obstacle at distance `x` from the origin.
   It is guaranteed that there is no obstacle at distance `x` when the query is asked.
2. For a query of type 2, `queries[i] = [2, x, sz]`. 
   Check if it is possible to place a block of size `sz` anywhere in the range `[0, x]` on the line, 
   such that the block entirely lies in the range `[0, x]`.
   A block cannot be placed if it intersects with any obstacle, but it may touch it. 
   Note that you do not actually place the block. Queries are separate.

Return a boolean array `results`, where `results[i]` is `true` 
if you can place the block specified in the $i^{th}$ query of type 2, and `false` otherwise.

**Constraints:**

- `1 <= queries.length <= 15 * 10^4`
- `2 <= queries[i].length <= 3`
- `1 <= queries[i][0] <= 2`
- `1 <= x, sz <= min(5 * 10^4, 3 * queries.length)`
- The input is generated such that for queries of type 1, no obstacle exists at distance `x` when the query is asked.
- The input is generated such that there is at least one query of type 2.

## 基礎思路

本題要在一條無限長的數線上交錯處理兩類操作：在指定座標插入障礙物，以及在區間 `[0, x]` 內判斷是否能放下一個長度為 `sz` 的區塊（區塊允許貼合但不可重疊障礙物）。由於兩類操作交錯出現且查詢數量可觀，必須採用支援動態更新與快速區間查詢的資料結構。

在思考解法時，可掌握以下核心觀察：

- **可放置條件由「相鄰障礙物的間隔」決定**：
  區塊必然落在兩個相鄰障礙物之間，或落在最後一個障礙物與右邊界之間，因此問題化為：是否存在一段足夠寬的可用空間。

- **查詢右界 `x` 不一定恰好落在障礙物上**：
  因此能放置的判斷必須拆為兩部分——
   - 在 `[0, x]` 內已存在的相鄰障礙物間隔中的最大值（**內部間隔**）
   - 自最後一個位於 `x` 左側（含）的障礙物至 `x` 之間的剩餘長度（**尾端空間**）

- **插入新障礙物會將原本的一段間隔切成兩段**：
  因此單次插入必須同時更新兩處：新位置處的間隔（前驅至新位置）與原後繼處的間隔（新位置至後繼）。

- **以位置 0 為虛擬障礙物**：
  能確保前驅查詢對任意座標皆有定義，免去邊界判斷。

依據以上特性，可以採用以下策略：

- **以線段樹同時維護兩種資訊**：
   - 葉節點存放「該位置距前一障礙物的間隔」，內部節點維護其子樹中的最大間隔，藉此支援單點更新與區間最大值查詢。
   - 另以一組位元資訊標記每個節點所代表的子樹中是否存在障礙物，使前驅／後繼查詢可在線段樹上以對數時間完成。
- **每次第一型查詢同時更新兩處（新位置與其後繼）**，
  以維持間隔的不變式。
- **第二型查詢拆成「內部最大間隔」與「尾端空間」兩個獨立比較**，
  任一者不小於區塊長度即可放置。

此策略使所有操作皆能在對數時間內完成，足以應付題目規模。

## 解題步驟

### Step 1：單次掃描查詢，建立扁平化資料並統計關鍵資訊

在進入主迴圈之前，先以一次掃描完成三件事：偵測座標的上界、將每筆查詢複製到型別陣列中以加速後續存取、並計算第二型查詢的數量以便預先配置結果陣列。

```typescript
const queryCount = queries.length;

// 單次掃描：偵測最大座標、將查詢扁平化至型別陣列，並統計第二型查詢數量
let maxCoordinate = 1;
let type2Count = 0;
const flatQueries = new Int32Array(queryCount * 3);
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const currentQuery = queries[queryIndex];
  const queryType = currentQuery[0];
  const xValue = currentQuery[1];
  const baseIndex = queryIndex * 3;
  flatQueries[baseIndex] = queryType;
  flatQueries[baseIndex + 1] = xValue;
  if (queryType === 2) {
    flatQueries[baseIndex + 2] = currentQuery[2];
    type2Count++;
  }
  if (xValue > maxCoordinate) {
    maxCoordinate = xValue;
  }
}
```

### Step 2：計算線段樹葉節點數量

為使線段樹的葉節點能完整對應到所有可能出現的座標，將葉節點數量取為嚴格大於最大座標的最小 2 次方；此寬度保證所有索引運算皆可單純化為位元位移。

```typescript
// 計算線段樹葉節點數量：嚴格大於 maxCoordinate 的最小 2 次方
let treeSize = 1;
while (treeSize <= maxCoordinate) {
  treeSize <<= 1;
}
```

### Step 3：配置線段樹儲存空間

配置兩條與線段樹同形的陣列：`maxGap` 用於維護子樹中障礙物間隔的最大值，`hasObstacle` 則記錄每個節點對應的子樹中是否包含任一障礙物。

```typescript
// 線段樹儲存空間：maxGap 紀錄子樹中障礙物的最大間隔，hasObstacle 標記障礙物存在與否
const maxGap = new Int32Array(treeSize * 2);
const hasObstacle = new Uint8Array(treeSize * 2);
```

### Step 4：將位置 0 標記為虛擬障礙物

在所有真實障礙物之前，先在位置 0 注入一個虛擬障礙物，並沿樹向上將所有祖先節點的存在標記設為 1，使後續任何座標皆能保證找到嚴格前驅。

```typescript
// 將位置 0 標記為虛擬障礙物，使前驅查詢永遠有定義
hasObstacle[treeSize] = 1;
let initNode = treeSize >> 1;
while (initNode > 0) {
  hasObstacle[initNode] = 1;
  initNode >>= 1;
}
```

### Step 5：預先配置結果陣列

依先前已統計的第二型查詢數量，預先配置正確大小的結果陣列，並建立寫入指標。

```typescript
// 依先前統計的第二型查詢數量預先配置結果陣列
const results: boolean[] = new Array(type2Count).fill(false);
let resultIndex = 0;
```

### Step 6：開始主迴圈，取出查詢資訊並依型別分派

逐筆遍歷所有查詢。從扁平化的型別陣列中取出當前查詢的型別與座標，再依型別進入兩條不同的處理路徑：型別一為「插入障礙物」，型別二為「放置判斷」。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const baseIndex = queryIndex * 3;
  const queryType = flatQueries[baseIndex];
  const xValue = flatQueries[baseIndex + 1];

  if (queryType === 1) {
    // ...
  } else {
    // ...
  }
}
```

### Step 7：型別一：尋找新位置的嚴格前驅

對第一型查詢，需先找出嚴格小於 `xValue` 的最近障礙物位置。從葉節點向上走訪，每當當前節點為右子節點時，便檢查其左兄弟子樹是否含有障礙物；若有則進入該子樹後再向最右下方走訪即可定位。由於位置 0 已預先插入為虛擬障礙物，前驅必存在。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // 找出 xValue 嚴格左側的前驅（位置 0 為虛擬障礙物，故必存在）
    let predecessor = 0;
    let walkUpIndex = treeSize + xValue;
    while (walkUpIndex > 1) {
      if ((walkUpIndex & 1) === 1) {
        const leftSibling = walkUpIndex - 1;
        if (hasObstacle[leftSibling] === 1) {
          // 進入左子樹後向最右下方走訪，取得位置最大的障礙物
          let descentNode = leftSibling;
          while (descentNode < treeSize) {
            const rightChild = (descentNode << 1) | 1;
            if (hasObstacle[rightChild] === 1) {
              descentNode = rightChild;
            } else {
              descentNode = descentNode << 1;
            }
          }
          predecessor = descentNode - treeSize;
          break;
        }
      }
      walkUpIndex >>= 1;
    }

    // ...
  } else {
    // ...
  }
}
```

### Step 8：型別一：尋找新位置的嚴格後繼

對稱地，再找出嚴格大於 `xValue` 的最近障礙物位置：當當前節點為左子節點時，檢查其右兄弟子樹是否含有障礙物，若有則進入並向最左下方走訪。若 `xValue` 大於所有現存障礙物，後繼不存在，以 `-1` 表示。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅

    // 找出 xValue 嚴格右側的後繼（若 xValue 大於所有現存障礙物，則可能不存在）
    let successor = -1;
    walkUpIndex = treeSize + xValue;
    while (walkUpIndex > 1) {
      if ((walkUpIndex & 1) === 0) {
        const rightSibling = walkUpIndex + 1;
        if (hasObstacle[rightSibling] === 1) {
          // 進入右子樹後向最左下方走訪，取得位置最小的障礙物
          let descentNode = rightSibling;
          while (descentNode < treeSize) {
            const leftChild = descentNode << 1;
            if (hasObstacle[leftChild] === 1) {
              descentNode = leftChild;
            } else {
              descentNode = leftChild | 1;
            }
          }
          successor = descentNode - treeSize;
          break;
        }
      }
      walkUpIndex >>= 1;
    }

    // ...
  } else {
    // ...
  }
}
```

### Step 9：型別一：插入新障礙物並向上更新

新障礙物插入後，其與前驅之間的間隔為 `xValue - predecessor`。將該值寫入對應葉節點並標記障礙物存在，再沿樹向上重新計算每個祖先節點的最大間隔與障礙物存在標記。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅

    // Step 8：尋找嚴格後繼

    // 在 xValue 處插入障礙物：葉節點間隔為 xValue - predecessor，並沿樹向上更新
    let updateIndex = treeSize + xValue;
    maxGap[updateIndex] = xValue - predecessor;
    hasObstacle[updateIndex] = 1;
    updateIndex >>= 1;
    while (updateIndex > 0) {
      const leftChild = updateIndex << 1;
      const rightChild = leftChild | 1;
      const leftGap = maxGap[leftChild];
      const rightGap = maxGap[rightChild];
      maxGap[updateIndex] = leftGap > rightGap ? leftGap : rightGap;
      hasObstacle[updateIndex] = hasObstacle[leftChild] | hasObstacle[rightChild];
      updateIndex >>= 1;
    }

    // ...
  } else {
    // ...
  }
}
```

### Step 10：型別一：若後繼存在，將其間隔縮短並向上更新

由於 `xValue` 介於原本的前驅與後繼之間，原本記錄於後繼處的間隔需縮短為 `successor - xValue`，同樣沿樹向上重新計算各祖先的最大間隔，使整棵樹的不變式保持一致。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅

    // Step 8：尋找嚴格後繼

    // Step 9：插入障礙物並向上更新

    // 由於 xValue 介於原本的前驅與後繼之間，將後繼的間隔縮為 successor - xValue
    if (successor !== -1) {
      updateIndex = treeSize + successor;
      maxGap[updateIndex] = successor - xValue;
      updateIndex >>= 1;
      while (updateIndex > 0) {
        const leftChild = updateIndex << 1;
        const rightChild = leftChild | 1;
        const leftGap = maxGap[leftChild];
        const rightGap = maxGap[rightChild];
        maxGap[updateIndex] = leftGap > rightGap ? leftGap : rightGap;
        updateIndex >>= 1;
      }
    }
  } else {
    // ...
  }
}
```

### Step 11：型別二：尋找查詢上界的包含式前驅

第二型查詢需要找出 `xValue` 左側（含其本身）最近的障礙物。若 `xValue` 本身已是障礙物則直接採用；否則同樣以線段樹走訪策略找出嚴格小於 `xValue` 的最大障礙物位置。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅
    // Step 8：尋找嚴格後繼
    // Step 9：插入障礙物並向上更新
    // Step 10：縮短後繼的間隔
  } else {
    // 第二型查詢：找出小於等於 xValue 的最大障礙物（包含式前驅查詢）
    const blockSize = flatQueries[baseIndex + 2];

    let predecessor = 0;
    const directLeafIndex = treeSize + xValue;
    if (hasObstacle[directLeafIndex] === 1) {
      predecessor = xValue;
    } else {
      let walkUpIndex = directLeafIndex;
      while (walkUpIndex > 1) {
        if ((walkUpIndex & 1) === 1) {
          const leftSibling = walkUpIndex - 1;
          if (hasObstacle[leftSibling] === 1) {
            let descentNode = leftSibling;
            while (descentNode < treeSize) {
              const rightChild = (descentNode << 1) | 1;
              if (hasObstacle[rightChild] === 1) {
                descentNode = rightChild;
              } else {
                descentNode = descentNode << 1;
              }
            }
            predecessor = descentNode - treeSize;
            break;
          }
        }
        walkUpIndex >>= 1;
      }
    }

    // ...
  }
}
```

### Step 12：型別二：在前驅之前的區間查詢最大間隔

對線段樹進行區間最大值查詢，取得葉節點區間 `[1, predecessor]` 中所記錄的最大障礙物間隔；此值代表已位於查詢上界以內、相鄰兩障礙物之間最寬的可用空間。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅
    // Step 8：尋找嚴格後繼
    // Step 9：插入障礙物並向上更新
    // Step 10：縮短後繼的間隔
  } else {
    // Step 11：尋找包含式前驅

    // 在葉節點區間 [1, predecessor] 上聚合既有的最大障礙物間隔
    let maxGapInRange = 0;
    if (predecessor >= 1) {
      let leftBound = treeSize + 1;
      let rightBound = treeSize + predecessor + 1;
      while (leftBound < rightBound) {
        if ((leftBound & 1) === 1) {
          const gap = maxGap[leftBound];
          if (gap > maxGapInRange) {
            maxGapInRange = gap;
          }
          leftBound++;
        }
        if ((rightBound & 1) === 1) {
          rightBound--;
          const gap = maxGap[rightBound];
          if (gap > maxGapInRange) {
            maxGapInRange = gap;
          }
        }
        leftBound >>= 1;
        rightBound >>= 1;
      }
    }

    // ...
  }
}
```

### Step 13：型別二：判定區塊是否可放置

可放置條件為「某段先前的相鄰障礙物間隔已足夠寬」**或**「最後一個障礙物到 `xValue` 之間的尾端空間足夠寬」。任一者成立即可放置，將判定結果寫入結果陣列。

```typescript
for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  // Step 6：取出查詢資訊並依型別分派

  if (queryType === 1) {
    // Step 7：尋找嚴格前驅
    // Step 8：尋找嚴格後繼
    // Step 9：插入障礙物並向上更新
    // Step 10：縮短後繼的間隔
  } else {
    // Step 11：尋找包含式前驅

    // Step 12：取得區間最大間隔

    // 若某段先前間隔已足夠寬，或尾端空間 (xValue - predecessor) 足以容納，即可放置
    results[resultIndex++] = maxGapInRange >= blockSize || (xValue - predecessor) >= blockSize;
  }
}
```

### Step 14：回傳結果陣列

所有查詢處理完畢後，將累積的判定結果回傳。

```typescript
return results;
```

## 時間複雜度

- 設 $n$ 為查詢數量，$M$ 為座標上界（由題目約束 $M \le 3n$，故 $M = O(n)$）。
- 前處理階段為 $O(n)$ 的單次掃描。
- 每筆查詢進行常數次線段樹操作（前驅／後繼／單點更新／區間最大值），每次操作為 $O(\log M)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 扁平化查詢陣列佔 $O(n)$。
- 線段樹的兩個底層陣列各佔 $O(M) = O(n)$。
- 結果陣列佔 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
