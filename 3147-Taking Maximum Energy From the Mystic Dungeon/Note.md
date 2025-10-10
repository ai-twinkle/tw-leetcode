# 3147. Taking Maximum Energy From the Mystic Dungeon

In a mystic dungeon, `n` magicians are standing in a line. 
Each magician has an attribute that gives you energy. 
Some magicians can give you negative energy, which means taking energy from you.

You have been cursed in such a way that after absorbing energy from magician `i`, you will be instantly transported to magician `(i + k)`. 
This process will be repeated until you reach the magician where `(i + k)` does not exist.

In other words, you will choose a starting point and then teleport with `k` jumps until you reach the end of the magicians' sequence, absorbing all the energy during the journey.

You are given an array `energy` and an integer `k`. 
Return the maximum possible energy you can gain.

Note that when you are reach a magician, you must take energy from them, whether it is negative or positive energy.

**Constraints:**

- `1 <= energy.length <= 10^5`
- `-1000 <= energy[i] <= 1000`
- `1 <= k <= energy.length - 1`

## 基礎思路

本題要在一條能量序列中，選擇任一起點，並以固定步長 `k` 向右跳躍，沿途強制吸收（可能為負）能量，直到無法再跳為止；目標是最大化總能量。思考時需注意：

- **路徑被步長固定**：從起點開始，每次必定往右跨 `k`，因此每個起點對應一條唯一且不可中斷的「k-跳鏈」。
- **終止條件自然形成**：當下一個位置超出邊界時結束，無法繼續選擇或調整路徑。
- **起點任意**：需在所有可能起點中取最大總和；能量可能為負，因此「起點過早」可能拖累總和。
- **鏈內可由尾推頭**：同一條 k-跳鏈上，某位置的最佳總和等於「自身能量 + 後續能量總和（若仍可跳）」；因此可自右向左一次掃描完成。

為了高效求解，可採用以下策略：

- **逆向累加**：從右往左，對每個位置計算「從這裡出發，沿著步長 `k` 前進能拿到的總能量」，同時維護全域最大值。
- **鏈式思維**：每條 k-跳鏈皆可獨立由尾到頭累加，整體一趟掃描即可涵蓋所有鏈。
- **線性時間與額外線性空間**：使用一個與輸入同長度的緩衝陣列保存自右而左的累加結果，並在掃描中同步更新答案。

## 解題步驟

### Step 1：初始化長度、緩衝陣列與全域最大值

建立同長度的緩衝，用來存放「從該位置出發」的累計能量；最大值以極小值起始，以涵蓋全負情況。

```typescript
// 取得陣列長度
const length = energy.length;

// 使用 Int32Array 以提升記憶體與 CPU 效率
const accumulatedEnergy = new Int32Array(length);

// 以最小安全整數初始化，處理「全部為負」的情況
let maximumTotalEnergy = Number.MIN_SAFE_INTEGER;
```

### Step 2：逆向單一迴圈建立「從該點出發」的總能量並同步更新答案

自右向左掃描；對每個位置，若可再跳一步則加上「下一個可達位置」的累計值；將結果寫入緩衝並更新全域最大值。

```typescript
// 由右至左掃描，建立動態關係
for (let index = length - 1; index >= 0; index--) {
  let currentTotal = energy[index];

  // 若 index + k 仍在範圍內，累加下一個可達位置的總能量
  if (index + k < length) {
    currentTotal += accumulatedEnergy[index + k];
  }

  // 將結果寫入型別化陣列
  accumulatedEnergy[index] = currentTotal;

  // 若此起點路徑更佳，更新全域最大值
  if (currentTotal > maximumTotalEnergy) {
    maximumTotalEnergy = currentTotal;
  }
}
```

### Step 3：回傳全域最大總能量

掃描完成後的全域最大值即為答案。

```typescript
// 回傳最大可獲得的總能量
return maximumTotalEnergy;
```

## 時間複雜度

- 單次由右至左掃描整個陣列，每個索引恰訪問一次，迴圈內操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外使用一個長度為 $n$ 的緩衝陣列以保存自右向左的累加結果，其餘為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
