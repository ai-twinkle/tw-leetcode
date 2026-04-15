# 2463. Minimum Total Distance Traveled

There are some robots and factories on the X-axis. 
You are given an integer array `robot` where `robot[i]` is the position of the $i^{th}$ robot. 
You are also given a 2D integer array factory where `factory[j] = [position_j, limit_j]` indicates 
that `position_j` is the position of the $j^{th}$ factory and that the $j^{th}$ factory can repair at most `limit_j` robots.

The positions of each robot are unique. 
The positions of each factory are also unique. 
Note that a robot can be in the same position as a factory initially.

All the robots are initially broken; they keep moving in one direction. 
The direction could be the negative or the positive direction of the X-axis. 
When a robot reaches a factory that did not reach its limit, the factory repairs the robot, and it stops moving.

At any moment, you can set the initial direction of moving for some robot. 
Your target is to minimize the total distance traveled by all the robots.

Return the minimum total distance traveled by all the robots. 
The test cases are generated such that all the robots can be repaired.

Note that

- All robots move at the same speed.
- If two robots move in the same direction, they will never collide.
- If two robots move in opposite directions and they meet at some point, they do not collide. 
  They cross each other.
- If a robot passes by a factory that reached its limits, it crosses it as if it does not exist.
- If the robot moved from a position `x` to a position `y`, the distance it moved is `|y - x|`.

**Constraints:**

- `1 <= robot.length, factory.length <= 100`
- `factory[j].length == 2`
- `-10^9 <= robot[i], positionj <= 10^9`
- `0 <= limit_j <= robot.length`
- The input will be generated such that it is always possible to repair every robot.

## 基礎思路

本題要求將所有機器人分配給工廠進行修復，每個工廠有容量上限，目標是最小化所有機器人移動距離的總和。機器人與工廠均分佈於數線上，每個機器人必須前往某個工廠，且不得超過該工廠的容量。

在思考解法時，可掌握以下核心觀察：

- **最優分配具有「無交叉」性質**：
  在最優解中，若機器人 A 在機器人 B 左側，則 A 被分配到的工廠不會在 B 被分配到的工廠右側；分配線段不會相互交叉，因此對機器人與工廠皆排序後可線性掃描。

- **貪心策略可應用於逐步決策**：
  每次處理一個機器人時，僅需比較「分配到左側最近可用工廠」與「分配到右側最近可用工廠」兩個方向的代價，取較小者即為局部最優選擇。

- **工廠滿載時的位移成本可遞移計算**：
  當一個工廠已滿，需把其中一個機器人「轉移」到左側工廠；這個轉移本身有代價，而該代價可以透過維護每個工廠的「首位機器人指標」與「邊際位移代價」動態計算，避免重複枚舉。

- **哨兵工廠消除邊界判斷**：
  在數線兩端加入足夠遠的哨兵工廠，可確保每個機器人在向左與向右搜尋時都必定能找到工廠，無須額外處理邊界條件。

依據以上特性，可以採用以下策略：

- **排序後以雙指標線性掃描**，對每個機器人依序決定向左或向右分配。
- **維護每個工廠的首位機器人指標與累積位移代價**，使滿載時的遞推計算為均攤常數時間。
- **貪心選擇代價較小的一側**，並在選定工廠滿載時透過輔助函數執行連鎖位移，確保分配合法。

此策略整體複雜度低，且能在約束範圍內高效求得最優解。

## 解題步驟

### Step 1：對機器人與工廠排序，並加入哨兵工廠

將機器人按位置由小到大排序；同時在工廠串列兩端各插入一個位於極遠處的哨兵工廠，過濾掉容量為零的工廠後再排序，確保後續掃描時左右兩側都必定存在可用工廠，消除邊界判斷。

```typescript
robot.sort((a, b) => a - b);

// 加入哨兵工廠，並過濾掉容量為零的工廠
factory.push([1e18, 1], [-1e18, 1]);
const filtered = factory.filter(f => f[1] > 0);
filtered.sort((a, b) => a[0] - b[0]);
```

### Step 2：將工廠資料展開為平行具型別陣列

為了提升快取友善性，將工廠的位置、容量、已用數量、首位機器人指標與邊際代價各自存入獨立的具型別陣列；首位指標初始化為 `-1` 表示該工廠尚未分配任何機器人。

```typescript
const factoryCount = filtered.length;

// 將工廠資料存入平行具型別陣列以提升快取效能
const position = new Float64Array(factoryCount);
const capacity = new Int32Array(factoryCount);
const used = new Int32Array(factoryCount);
const first = new Int32Array(factoryCount);
const cost = new Float64Array(factoryCount);

for (let i = 0; i < factoryCount; i++) {
  position[i] = filtered[i][0];
  capacity[i] = filtered[i][1];
  first[i] = -1;
}
```

### Step 3：將機器人位置存入具型別陣列

同樣將機器人位置預先存入 `Float64Array`，方便後續在輔助函數中以索引快速存取，減少間接存取的開銷。

```typescript
// 將機器人位置預先存入具型別陣列
const robotCount = robot.length;
const robotPosition = new Float64Array(robotCount);
for (let i = 0; i < robotCount; i++) {
  robotPosition[i] = robot[i];
}
```

### Step 4：定義輔助函數，初始化工廠首次分配的邊際代價

`use` 函數負責將指定機器人分配給指定工廠。當工廠尚未分配任何機器人時（`used === 0`），記錄首位機器人的索引，並計算「從前一個工廠改由本工廠服務該機器人」所節省或增加的距離差，作為後續連鎖計算的基礎。

```typescript
/**
 * @param robotIndex - 待分配機器人的索引
 * @param factoryIndex - 目標工廠的索引
 */
function use(robotIndex: number, factoryIndex: number): void {
  while (used[factoryIndex] === capacity[factoryIndex]) {
    robotIndex = first[factoryIndex]++;
    // 移動首位指標後重新計算邊際代價
    const currentRobotPosition = robotPosition[first[factoryIndex]];
    const previousFactoryPosition = position[factoryIndex - 1];
    const currentFactoryPosition = position[factoryIndex];
    const distanceToPrevious = currentRobotPosition - previousFactoryPosition;
    const distanceToCurrent = currentRobotPosition - currentFactoryPosition;
    cost[factoryIndex] = (distanceToPrevious < 0 ? -distanceToPrevious : distanceToPrevious)
      - (distanceToCurrent < 0 ? -distanceToCurrent : distanceToCurrent);
    factoryIndex--;
  }
  if (used[factoryIndex] === 0) {
    first[factoryIndex] = robotIndex;
    // 計算此工廠首位機器人的初始邊際代價
    const currentRobotPosition = robotPosition[first[factoryIndex]];
    const previousFactoryPosition = position[factoryIndex - 1];
    const currentFactoryPosition = position[factoryIndex];
    const distanceToPrevious = currentRobotPosition - previousFactoryPosition;
    const distanceToCurrent = currentRobotPosition - currentFactoryPosition;
    cost[factoryIndex] = (distanceToPrevious < 0 ? -distanceToPrevious : distanceToPrevious)
      - (distanceToCurrent < 0 ? -distanceToCurrent : distanceToCurrent);
  }
  used[factoryIndex]++;
}
```

### Step 5：定義輔助函數的滿載連鎖位移邏輯

當目標工廠已滿，需將其首位機器人「推回」給左側工廠，並更新首位指標與邊際代價；此過程可能連鎖觸發左側工廠同樣滿載，因此以 `while` 迴圈持續向左遞移，直到找到有空位的工廠為止。

```typescript
function use(robotIndex: number, factoryIndex: number): void {
  while (used[factoryIndex] === capacity[factoryIndex]) {
    robotIndex = first[factoryIndex]++;
    // 移動首位指標後重新計算邊際代價
    const currentRobotPosition = robotPosition[first[factoryIndex]];
    const previousFactoryPosition = position[factoryIndex - 1];
    const currentFactoryPosition = position[factoryIndex];
    const distanceToPrevious = currentRobotPosition - previousFactoryPosition;
    const distanceToCurrent = currentRobotPosition - currentFactoryPosition;
    cost[factoryIndex] = (distanceToPrevious < 0 ? -distanceToPrevious : distanceToPrevious)
      - (distanceToCurrent < 0 ? -distanceToCurrent : distanceToCurrent);
    factoryIndex--;
  }

  // Step 4：首次分配時初始化邊際代價

  used[factoryIndex]++;
}
```

### Step 6：初始化總距離與工廠掃描指標，並找到每個機器人右側的第一個工廠

對每個機器人，從目前工廠指標出發向右推進，直到找到位置不小於該機器人的第一個工廠，取得向右分配的距離代價；接著退回一格，使指標指向機器人左側最近的工廠。

```typescript
let totalDistance = 0;
let currentFactory = 1;

for (let robotIndex = 0; robotIndex < robotCount; robotIndex++) {
  const currentPosition = robotPosition[robotIndex];

  // 向右推進直到找到位於此機器人右側的工廠
  let rightCost = -1;
  while (rightCost < 0) {
    currentFactory++;
    rightCost = position[currentFactory] - currentPosition;
  }
  currentFactory--;

  // ...
}
```

### Step 7：計算向左分配的累積代價（含連鎖位移）

向左分配的基礎代價為機器人到左側工廠的絕對距離；若該工廠已滿，還需累加其儲存的邊際位移代價，並繼續向左檢查，直到遇到有空位的工廠為止。

```typescript
for (let robotIndex = 0; robotIndex < robotCount; robotIndex++) {
  // Step 6：找到右側第一個工廠並退回左側

  // 計算向左分配的代價，包含連鎖位移的累積成本
  const distanceToLeft = position[currentFactory] - currentPosition;
  let leftCost = distanceToLeft < 0 ? -distanceToLeft : distanceToLeft;
  for (let i = currentFactory; ; i--) {
    if (used[i] === capacity[i]) {
      leftCost += cost[i];
    } else {
      break;
    }
  }

  // ...
}
```

### Step 8：貪心選擇代價較小的一側並執行分配

比較左右兩側代價，將代價累加至總距離，並呼叫 `use` 將機器人正式分配給對應工廠；若選擇右側，需先將工廠指標前進一格指向右側工廠再執行分配。

```typescript
for (let robotIndex = 0; robotIndex < robotCount; robotIndex++) {
  // Step 6：找到右側第一個工廠並退回左側

  // Step 7：計算向左代價

  // 選擇代價較小的一側進行分配
  totalDistance += leftCost < rightCost ? leftCost : rightCost;
  if (leftCost <= rightCost) {
    use(robotIndex, currentFactory);
  } else {
    currentFactory++;
    use(robotIndex, currentFactory);
  }
}
```

### Step 9：回傳所有機器人的最小總移動距離

所有機器人處理完畢後，`totalDistance` 即為在最優分配下的最小總距離，直接回傳。

```typescript
return totalDistance;
```

## 時間複雜度

- 設機器人數量為 $n$，工廠數量為 $m$；
- 排序機器人與工廠各需 $O(n \log n)$ 與 $O(m \log m)$；
- 主掃描迴圈對每個機器人執行常數次工廠指標推進與連鎖位移，均攤後每個機器人為 $O(m)$，共 $O(n \times m)$；
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 工廠相關的五個具型別陣列各佔 $O(m)$；
- 機器人位置陣列佔 $O(n)$；
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
