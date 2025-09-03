# 3027. Find the Number of Ways to Place People II

You are given a 2D array `points` of size `n x 2` representing integer coordinates of some points on a 2D-plane, where `points[i] = [x_i, y_i]`.

We define the right direction as positive x-axis (increasing x-coordinate) and the left direction as negative x-axis (decreasing x-coordinate). 
Similarly, we define the up direction as positive y-axis (increasing y-coordinate) and the down direction as negative y-axis (decreasing y-coordinate)

You have to place `n` people, including Alice and Bob, at these points such that there is exactly one person at every point. 
Alice wants to be alone with Bob, so Alice will build a rectangular fence with Alice's position as the upper left corner and Bob's position as the lower right corner of the fence 
(Note that the fence might not enclose any area, i.e. it can be a line). 
If any person other than Alice and Bob is either inside the fence or on the fence, Alice will be sad.

Return the number of pairs of points where you can place Alice and Bob, such that Alice does not become sad on building the fence.

Note that Alice can only build a fence with Alice's position as the upper left corner, and Bob's position as the lower right corner. 
For example, Alice cannot build either of the fences in the picture below with four corners `(1, 1)`, `(1, 3)`, `(3, 1)`, and `(3, 3)`, because:

- With Alice at `(3, 3)` and Bob at `(1, 1)`, Alice's position is not the upper left corner and Bob's position is not the lower right corner of the fence.
- With Alice at `(1, 3)` and Bob at `(1, 1)`, Bob's position is not the lower right corner of the fence.

**Constraints:**

- `2 <= n <= 1000`
- `points[i].length == 2`
- `-10^9 <= points[i][0], points[i][1] <= 10^9`
- All `points[i]` are distinct.

## 基礎思路

本題要求計算在平面上選出兩個點（Alice 與 Bob）構成一個以 Alice 為左上角、Bob 為右下角的長方形，且長方形範圍內（含邊界）**僅包含這兩人**時的有效配對數。

由於點的總數最多為 1000，因此我們可以考慮以每個點作為 Alice，遍歷所有右側點作為 Bob，但若不加優化會導致重複計算與無效判斷。

為了加速查詢與排除無效的 Bob，我們先將所有點依據 `x` 座標升序排列，若 `x` 相同則依 `y` 座標降序排列，確保從左到右掃描時可依序確認合法邊界條件。

對於固定的 Alice，我們只需考慮 `yBob ≤ yAlice` 的候選人，並利用一個變數紀錄目前掃描過程中符合條件的最大 `yBob`，若新的 Bob `y` 值比這個最大值還大，則代表這個長方形是首次出現不被遮蔽的有效區域，即為一個合法配對。

## 解題步驟

### Step 1：處理邊界情況與排序點座標

此步驟先確認至少要有兩個點才有配對可能，接著對所有點進行排序，使後續從左到右掃描更容易依據座標建立合法的長方形邊界。

```typescript
const totalPoints = points.length;
if (totalPoints < 2) {
  return 0;
}

// 依 x 升冪，x 相同時 y 降冪排序
points.sort((pointA, pointB) => {
  const deltaX = pointA[0] - pointB[0];
  if (deltaX !== 0) {
    return deltaX;
  }
  return pointB[1] - pointA[1];
});
```


### Step 2：提取 y 座標並初始化計數變數

這裡將所有 `y` 值存入一個 `Int32Array` 中，能提升後續存取效能，並初始化總配對數量與一個最小整數作為掃描過程中的起始比較基準。

```typescript
const yCoordinates = new Int32Array(totalPoints);
for (let index = 0; index < totalPoints; index++) {
  yCoordinates[index] = points[index][1];
}

let pairCount = 0;
const intMinimum = -2147483648;
```

### Step 3：以每個點作為 Alice，向右枚舉合法的 Bob 並統計配對

這段為主要邏輯：對於每個 Alice，向右逐一檢查可能的 Bob，並在首次遇到 `y` 合法且不被覆蓋的情況下記為有效配對，若已達上界則提早終止，避免多餘計算。

```typescript
for (let indexAlice = 0; indexAlice < totalPoints - 1; indexAlice++) {
  const yAlice = yCoordinates[indexAlice];
  let maximumYAtMostAlice = intMinimum;

  for (let indexBob = indexAlice + 1; indexBob < totalPoints; indexBob++) {
    const yBob = yCoordinates[indexBob];

    // 僅考慮 Bob 在 Alice 下方的情況
    if (yBob <= yAlice) {
      // 若 yBob 是目前最大且合法，視為有效配對
      if (yBob > maximumYAtMostAlice) {
        pairCount++;
        maximumYAtMostAlice = yBob;

        // 若已達 yAlice，不可能再找到更大的合法 y 值，提前結束
        if (maximumYAtMostAlice === yAlice) {
          break;
        }
      }
    }
  }
}
```

### Step 4：回傳最終結果

將統計到的合法配對數量作為最終解返回。

```typescript
return pairCount;
```

## 時間複雜度

- 排序步驟為 $O(n \log n)$。
- 雙層迴圈最多為 $O(n^2)$，每對 `(Alice, Bob)` 僅被處理一次，實際常數因提前終止而較低。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用一個長度為 `n` 的 `Int32Array` 儲存 `y` 值，其餘皆為常數變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
