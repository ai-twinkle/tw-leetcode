# 2751. Robot Collisions

There are `n` 1-indexed robots, each having a position on a line, health, and movement direction.

You are given 0-indexed integer arrays `positions`, `healths`, and a string `directions` 
(`directions[i]` is either 'L' for left or 'R' for right). 
All integers in `positions` are unique.

All robots start moving on the line simultaneously at the same speed in their given directions. 
If two robots ever share the same position while moving, they will collide.

If two robots collide, the robot with lower health is removed from the line, 
and the health of the other robot decreases by one. 
The surviving robot continues in the same direction it was going. 
If both robots have the same health, they are both removed from the line.

Your task is to determine the health of the robots that survive the collisions, 
in the same order that the robots were given, 
i.e. final health of robot 1 (if survived), final health of robot 2 (if survived), and so on. 
If there are no survivors, return an empty array.

Return an array containing the health of the remaining robots (in the order they were given in the input), 
after no further collisions can occur.

Note: The positions may be unsorted.

**Constraints:**

- `1 <= positions.length == healths.length == directions.length == n <= 10^5`
- `1 <= positions[i], healths[i] <= 10^9`
- `directions[i] == 'L'` or `directions[i] == 'R'`
- `All values in positions are distinct`

## 基礎思路

本題要求模擬一群機器人在數線上移動、碰撞並決出存活者的過程。每次碰撞由兩機器人的生命值決定勝負，最終需依原始順序回傳存活者的生命值。直接模擬每一步移動的成本過高，因此必須找出更高效的碰撞處理結構。

在思考解法時，可掌握以下核心觀察：

- **只有方向相對的機器人才會碰撞**：
  朝同方向移動的機器人永遠不會相遇；只有右移機器人在前、左移機器人在後（按位置排序）時，兩者必然碰撞。

- **碰撞具有天然的後進先出結構**：
  按位置排序後，越晚遇到的右移機器人會越早與後續左移機器人發生碰撞，這正是堆疊（Stack）的特性。

- **一個左移機器人可能連續擊敗多個右移機器人**：
  每場碰撞後，若左移機器人存活，它將繼續向左與下一個堆疊頂端的右移機器人碰撞，直到被擊敗或堆疊清空為止。

- **消除標記優於實際移除**：
  碰撞中失敗的機器人不需要立即從資料結構中移除，只需標記為已消滅，最後按原始索引收集未標記者即可還原輸出順序。

依據以上特性，可以採用以下策略：

- **依位置排序索引，確保碰撞按空間順序處理**，而非直接排序機器人本身以保留原始輸入順序。
- **以堆疊暫存所有右移機器人**，每當遇到左移機器人時，逐一與堆疊頂端進行碰撞結算。
- **以消除標記陣列記錄敗者**，全部處理完畢後，依原始順序掃描一次即可建出答案。

此策略將每一次碰撞的處理降至均攤常數時間，整體效率達到線性。

## 解題步驟

### Step 1：初始化索引陣列並依位置排序

為了不破壞原始輸入順序，我們建立一個索引陣列，並依各機器人的位置由小到大排序，後續所有碰撞均按此空間順序處理。

```typescript
const robotCount = positions.length;

// 使用 Int32Array 以提升快取友善的索引排序效能
const sortedIndices = new Int32Array(robotCount);
for (let i = 0; i < robotCount; i++) {
  sortedIndices[i] = i;
}

// 依位置排序索引，使碰撞能按空間順序處理
sortedIndices.sort((indexA, indexB) => positions[indexA] - positions[indexB]);
```

### Step 2：初始化碰撞堆疊與消除標記陣列

使用一個堆疊暫存尚未與左移機器人發生碰撞的右移機器人；使用消除標記陣列記錄哪些機器人已在碰撞中敗出，以便最後依原始順序收集存活者。

```typescript
// 使用 Int32Array 堆疊存放待碰撞結算的右移機器人
const collisionStack = new Int32Array(robotCount);
let stackTop = -1;

// 使用 Uint8Array 以 O(1) 標記消滅並節省記憶體
const isEliminated = new Uint8Array(robotCount);
```

### Step 3：依排序後位置逐一處理每個機器人，右移者入堆疊

按照排序後的空間順序取出每個機器人：若為右移，直接壓入堆疊等待後續碰撞；若為左移，則進入碰撞結算流程。

```typescript
for (let sortedPosition = 0; sortedPosition < robotCount; sortedPosition++) {
  const currentIndex = sortedIndices[sortedPosition];

  if (directions[currentIndex] === 'R') {
    // 將右移機器人壓入堆疊，等待未來的左移機器人碰撞
    collisionStack[++stackTop] = currentIndex;
  } else {
    // ...
  }
}
```

### Step 4：左移機器人與堆疊頂端進行碰撞，依生命值決定勝負

當遇到左移機器人時，反覆與堆疊頂端的右移機器人交戰：
左移勝則右移者被消滅、左移者生命值減一並繼續挑戰；右移勝則左移者被消滅、右移者生命值減一並終止；同值則兩者同歸於盡。

```typescript
for (let sortedPosition = 0; sortedPosition < robotCount; sortedPosition++) {
  const currentIndex = sortedIndices[sortedPosition];

  if (directions[currentIndex] === 'R') {
    // Step 3：右移機器人入堆疊

  } else {
    // 結算此左移機器人與所有堆疊中右移機器人的碰撞
    while (stackTop >= 0) {
      const rightIndex = collisionStack[stackTop];

      if (healths[currentIndex] > healths[rightIndex]) {
        // 左移勝：消滅右移機器人並繼續向左挑戰
        isEliminated[rightIndex] = 1;
        stackTop--;
        healths[currentIndex]--;
      } else if (healths[currentIndex] < healths[rightIndex]) {
        // 右移勝：消滅左移機器人並削弱右移機器人
        isEliminated[currentIndex] = 1;
        healths[rightIndex]--;
        break;
      } else {
        // 生命值相同：兩者同時消滅
        isEliminated[currentIndex] = 1;
        isEliminated[rightIndex] = 1;
        stackTop--;
        break;
      }
    }
  }
}
```

### Step 5：依原始順序收集所有存活機器人的生命值

所有碰撞結算完成後，依原始輸入索引順序掃描一次，將未被標記為消滅的機器人生命值依序加入結果。

```typescript
// 依原始輸入順序收集存活機器人的生命值
const survivors: number[] = [];
for (let i = 0; i < robotCount; i++) {
  if (!isEliminated[i]) {
    survivors.push(healths[i]);
  }
}

return survivors;
```

## 時間複雜度

- 建立索引陣列需 $O(n)$；
- 依位置排序需 $O(n \log n)$；
- 處理碰撞時，每個機器人至多被壓入與彈出堆疊各一次，總計 $O(n)$；
- 最終收集存活者需 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 排序索引陣列佔 $O(n)$；
- 碰撞堆疊最多存放 $n$ 個元素，佔 $O(n)$；
- 消除標記陣列佔 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
