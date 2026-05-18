# 1345. Jump Game IV

Given an array of integers `arr`, you are initially positioned at the first index of the array.

In one step you can jump from index `i` to index:

- `i + 1` where: `i + 1 < arr.length`.
- `i - 1` where: `i - 1 >= 0`.
- `j` where: `arr[i] == arr[j]` and `i != j`.

Return the minimum number of steps to reach the last index of the array.

Notice that you can not jump outside of the array at any time.

**Constraints:**

- `1 <= arr.length <= 5 * 10^4`
- `-10^8 <= arr[i] <= 10^8`

## 基礎思路

本題要求在一個整數陣列中，從首位元素出發，透過三種跳躍方式（向前一格、向後一格、跳至任一相同數值的位置），求出抵達最後一個位置所需的最少步數。

由於每一次跳躍的代價皆為 1，且需要的是「最少步數」，這正是典型的最短路徑問題。我們可以將陣列每個位置視為圖中的節點，每種合法跳躍方式視為一條邊，問題即轉化為從起點到終點的最短跳躍次數。

在思考解法時，可掌握以下核心觀察：

- **層級擴展的特性**：
  既然每一步代價相同，最短路徑必然出現在最早抵達該節點的那一層，因此採用廣度優先搜尋（BFS）逐層擴展可確保第一次到達終點的步數即為答案。

- **相同數值的群組邊容易造成重複擴展**：
  若多個位置擁有相同的值，理論上它們兩兩之間皆有一條邊；若每次都重複展開，將導致演算法退化為平方等級。實際上，當任一節點首次擴展某個值的群組時，群組內所有節點皆會被加入下一層，後續再次遇到該值時已無新節點可加入。

- **同一群組僅需被展開一次**：
  基於上述觀察，可在第一次展開某個數值的群組後立刻將其清除，使整體跳躍邊的數量壓回線性等級。

- **終點可提前判斷**：
  當下一個鄰居即為終點時，可直接回傳當前步數加 1，省去多餘的入列與出列。

依據以上特性，可以採用以下策略：

- **建立「數值 → 索引清單」的對應表**，以便在 BFS 中快速找到所有共值節點。
- **使用陣列模擬佇列並以指標控制頭尾**，避免逐次出列造成的線性開銷。
- **以位元陣列標記造訪狀態**，並在展開完一個值的群組後立即從表中刪除，確保每條邊僅被檢視一次。

此策略能在最壞情況下保持線性複雜度，確保即便陣列規模達到上限亦能高效求解。

## 解題步驟

### Step 1：處理長度過短的特殊情況

若陣列長度小於等於 1，代表起點本身即為終點，無須任何跳躍。

```typescript
const length = arr.length;

// 平凡情況：已經位於最後一個索引
if (length <= 1) {
  return 0;
}

const lastIndex = length - 1;
```

### Step 2：建立數值對應索引清單的映射

遍歷整個陣列，將每個數值與其出現的所有索引位置收攏到同一個桶中，後續 BFS 即可透過此映射快速取得共值節點。

```typescript
// 將索引依其數值分組
// 使用 Map 以數值為鍵，依約束數值皆位於 int32 範圍內
const valueToIndices: Map<number, number[]> = new Map();
for (let index = 0; index < length; index++) {
  const value = arr[index];
  const bucket = valueToIndices.get(value);
  if (bucket === undefined) {
    valueToIndices.set(value, [index]);
    continue;
  }
  bucket.push(index);
}
```

### Step 3：初始化造訪標記陣列

使用型別陣列作為造訪標記，效能優於一般布林陣列；同時將起點標記為已造訪。

```typescript
// 使用型別陣列作為造訪旗標 —— 效能遠勝於一般布林陣列
const visited = new Uint8Array(length);
visited[0] = 1;
```

### Step 4：初始化以陣列模擬的 BFS 佇列

採用陣列搭配頭尾指標模擬佇列，避免 `Array.shift` 的線性開銷；
最壞情況下每個索引最多入列一次，故配置長度為陣列長度的空間即可。

```typescript
// 以陣列搭配頭尾指標模擬佇列，避免 Array.shift 的 O(n) 開銷
// 最壞情況下每個索引僅入列一次，因此空間 = length 已足夠
const queue = new Int32Array(length);
let queueHead = 0;
let queueTail = 0;
queue[queueTail++] = 0;

let steps = 0;
```

### Step 5：進行逐層展開的 BFS 主迴圈，並從佇列取出當前節點

每一層代表多跳躍一次。先取得本層大小，再逐一取出本層節點；若取出的節點即為終點，可立刻回傳當前步數。

```typescript
// 標準的逐層 BFS —— 每一層代表多跳躍一次
while (queueHead < queueTail) {
  const levelSize = queueTail - queueHead;

  for (let counter = 0; counter < levelSize; counter++) {
    const currentIndex = queue[queueHead++];

    // 抵達目標 —— 回傳當前步數
    if (currentIndex === lastIndex) {
      return steps;
    }

    const currentValue = arr[currentIndex];

    // ...
  }

  steps++;
}
```

### Step 6：嘗試向右跳躍至 `i + 1`

若下一個索引就是終點，可直接回傳步數加 1；否則檢查是否在合法範圍內且尚未造訪，再加入佇列。

```typescript
while (queueHead < queueTail) {
  const levelSize = queueTail - queueHead;

  for (let counter = 0; counter < levelSize; counter++) {
    // Step 5：取出當前節點並判斷是否抵達目標

    // 鄰居 1：跳至 i + 1
    // 若下一個索引即為目標可快速回傳（此處 nextIndex < length 必成立）
    const nextIndex = currentIndex + 1;
    if (nextIndex === lastIndex) {
      return steps + 1;
    }
    if (nextIndex < length && visited[nextIndex] === 0) {
      visited[nextIndex] = 1;
      queue[queueTail++] = nextIndex;
    }

    // ...
  }

  steps++;
}
```

### Step 7：嘗試向左跳躍至 `i - 1`

確認左側索引非負且尚未造訪後加入佇列，使 BFS 能往回探索可能的捷徑。

```typescript
while (queueHead < queueTail) {
  const levelSize = queueTail - queueHead;

  for (let counter = 0; counter < levelSize; counter++) {
    // Step 5：取出當前節點並判斷是否抵達目標

    // Step 6：嘗試向右跳躍

    // 鄰居 2：跳至 i - 1
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0 && visited[previousIndex] === 0) {
      visited[previousIndex] = 1;
      queue[queueTail++] = previousIndex;
    }

    // ...
  }

  steps++;
}
```

### Step 8：展開所有共值索引並清除該群組

取得與當前值相同的所有索引，逐一加入佇列；過程中若某個共值節點即為終點亦可立刻回傳。展開完成後將該值從映射中刪除，避免後續重複展開。

```typescript
while (queueHead < queueTail) {
  const levelSize = queueTail - queueHead;

  for (let counter = 0; counter < levelSize; counter++) {
    // Step 5：取出當前節點並判斷是否抵達目標

    // Step 6：嘗試向右跳躍

    // Step 7：嘗試向左跳躍

    // 鄰居 3：跳至任一具有相同數值的索引
    // 關鍵優化：每個值的群組在整個 BFS 中僅展開一次
    const sameValueIndices = valueToIndices.get(currentValue);
    if (sameValueIndices === undefined) {
      continue;
    }

    for (let pointer = 0; pointer < sameValueIndices.length; pointer++) {
      const peerIndex = sameValueIndices[pointer];
      if (visited[peerIndex] === 1) {
        continue;
      }
      // 若某個共值節點即為目標可快速回傳
      if (peerIndex === lastIndex) {
        return steps + 1;
      }
      visited[peerIndex] = 1;
      queue[queueTail++] = peerIndex;
    }
    // 標記該群組已被消耗，避免後續節點重複展開相同邊
    valueToIndices.delete(currentValue);
  }

  steps++;
}
```

### Step 9：防禦性回傳

依據題目約束，最後一個索引必定可達，但仍保留 `-1` 作為防禦性回傳，以確保程式穩健。

```typescript
// 依題目約束最後一個索引必可達，仍回傳 -1 以防萬一
return -1;
```

## 時間複雜度

- 建立數值對應索引映射需遍歷整個陣列一次，耗費 $O(n)$；
- BFS 過程中每個索引最多入列、出列各一次，貢獻 $O(n)$；
- 相同數值的群組在整個 BFS 中僅展開一次，所有共值邊的總展開量為 $O(n)$；
- 向左與向右兩種鄰居每節點僅檢查常數次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 數值對應索引映射在最壞情況下需儲存所有索引，耗費 $O(n)$；
- 造訪標記陣列與佇列陣列各需 $O(n)$；
- 其餘為常數數量的指標變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
