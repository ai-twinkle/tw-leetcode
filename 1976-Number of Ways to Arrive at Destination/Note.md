# 1976. Number of Ways to Arrive at Destination

You are in a city that consists of `n` intersections numbered from `0` to `n - 1` with bi-directional roads between some intersections. 
The inputs are generated such that you can reach any intersection from any other intersection and that there is at most one road between any two intersections.

You are given an integer n and a 2D integer array roads where $\text{roads}[i] = [u_i, v_i, \text{time}_i]$ means that 
there is a road between intersections $u_i$ and $v_i$ that takes $\text{time}_i$ minutes to travel. 
You want to know in how many ways you can travel from intersection `0` to intersection `n - 1` in the shortest amount of time.

Return the number of ways you can arrive at your destination in the shortest amount of time. Since the answer may be large, return it modulo $10^9 + 7$.

**Constraints:**

- `1 <= n <= 200`
- `n - 1 <= roads.length <= n * (n - 1) / 2`
- `roads[i].length == 3`
- `0 <= u_i, v_i <= n - 1`
- `1 <= time_i <= 10^9`
- `u_i != v_i`
- There is at most one road connecting any two intersections.
- You can reach any intersection from any other intersection.

## 基礎思路

本題要求計算從起點 `0` 到終點 `n - 1` 的「最短路徑」的數量，並將結果對 $10^9+7$ 取模。  
我們可以將題目想像成一張地圖：

- 每個節點（intersection）代表一個路口。
- 每條邊（road）代表連接路口之間的道路，且有一個通過這條路需要花費的「時間」(travel time)。

我們要做的，就是找出從起點到終點最短所需時間，並統計這種最短時間的路線一共有幾條。

為了達成這個目標，我們可採用以下步驟：

### 1. 圖形表示（Graph Representation）

首先，我們要清楚地把整個城市的道路系統表示出來：

- **節點與邊**：利用鄰接表來記錄每個路口有哪些道路可走。  
  例如，若從路口 `A` 到路口 `B` 花費的時間為 `3`，則記錄成：  
  `A → B (3)` 以及 `B → A (3)`（雙向道路）。
- 透過這種記錄方式，每個節點都可以快速找到與自己相鄰的路口以及到達那些路口所需的時間。

這一步的目的，是幫助我們接下來在搜尋路徑時能有效率地訪問鄰近的路口。

### 2. 波次鬆弛（Wave Relaxation）—— 逐步縮短距離的方式

這一步的核心是透過多次的「波次」（wave）操作，逐步更新從起點到每個節點的最短距離。

#### 為什麼需要多次「波次」？

由於道路的分布可能複雜且路徑可能很多，一開始我們並不知道哪一條路徑最短，所以必須反覆地檢查與更新，才能確保找到真正的最短路徑。

具體做法如下：

- 一開始，我們認定從起點 (`0`) 到自己的距離是 `0`（因為不需移動），其他所有路口的距離初始都設為無限大（表示目前還沒找到任何路徑）。
- 接下來，進行多次「波次」的遍歷。每一次「波次」都是從頭到尾地檢查每一個節點：
    - 對每個節點，我們都嘗試將它目前知道的「最短距離」傳播（鬆弛）到與它相鄰的節點。
    - 若透過此節點發現了更短的路徑，就更新鄰接節點的最短距離。
    - 若透過此節點找到的路徑與已知的最短距離一樣短，表示我們又多找到了一條不同但同樣短的路徑，這時我們就要把「最短路徑數量」累加起來。
- 每次完成一輪所有節點的檢查後，我們都會確認是否還有節點的距離被更新：
    - 如果這一輪沒有任何節點距離被更新，表示我們已經找到所有最短路徑，不用再進行下一輪。
    - 若還有節點的距離被更新，就繼續進行下一輪的檢查，直到沒有任何新的更新為止，最多進行 `n` 次（因為最多只需 `n-1` 步即可從起點抵達終點）。

#### 舉個具體例子說明：

假設目前起點 `0` 到節點 `A` 的距離為 `10`，我們檢查到另一條路徑從節點 `B` 到節點 `A` 的距離只需 `8`。  

此時，我們就更新節點 `A` 的最短距離為 `8`，同時把經由節點 `B` 到達節點 `A` 的路徑數量設成節點 `B` 的路徑數量（因為目前更短的路徑只能從節點 `B` 傳來）。  

如果之後再找到另一條路線也是花費 `8` 分鐘能到節點 `A`，我們就將節點 `A` 的路徑數量加上這條新路線提供的數量，表示節點 `A` 現在有更多種方式能在最短時間內抵達。

### 3. 路徑數量累加與取模（Modulo Operation）

由於題目規定「路徑數量」可能非常多，因此在累加每個節點的路徑數量時，我們必須同時進行「取模」操作：

- 將路徑數量控制在題目要求的 $10^9 + 7$ 範圍內，避免數字過大而超出記憶體範圍或計算限制。

## 最終步驟

經過上面的逐步檢查與更新後，我們最後就能夠確定：

- 從起點 `0` 到終點 `n - 1` 的「最短距離」是多少。
- 並且能清楚地知道這種最短距離的路徑數量有幾種（已經取模後）。

這就是我們所需要的最終答案。

## 解題步驟

### Step 1：初始化與圖結構構建

- **圖的建立**  
  根據輸入的 `roads` 數組，將每條邊轉換為鄰接表的表示方式，每個節點記錄其相鄰的節點以及邊的權重（旅行時間）。

```typescript
const graph: { edges: number[]; weights: number[] }[] = Array.from({ length: n }, () => ({ 
  edges: [],
  weights: [],
}));
for (const [u, v, w] of roads) {
  graph[u].edges.push(v);
  graph[u].weights.push(w);
  graph[v].edges.push(u);
  graph[v].weights.push(w);
}
```

- **初始化距離與路徑數量**
    - 使用 `dist` 陣列記錄每個節點從起點 `0` 的最短距離，初始時將所有節點距離設定為無窮大，僅將起點距離設為 `0`。
    - 使用 `ways` 陣列記錄每個節點的最短路徑數量，初始時起點的路徑數量設為 `1`。

```typescript
const dist = new Array(n).fill(Infinity);
dist[0] = 0;
const ways = new Array(n).fill(0);
ways[0] = 1;
const MOD = 1000000007;
```

### Step 2：波次鬆弛算法

- **執行波次遍歷**  
  為了確保所有最短路徑都能正確更新，我們最多執行 `n` 次波次。  
  每個波次中，遍歷除終點外的所有節點，針對每個節點的所有鄰接邊進行以下操作：

    1. **鬆弛操作**  
       對於節點 `node` 與其相鄰節點 `neighbor`，計算 `newDist = dist[node] + travelTime`：
        - 若 `newDist < dist[neighbor]`，表示找到了更短的路徑，則更新 `dist[neighbor] = newDist` 並將 `ways[neighbor]` 設為 `ways[node]`。
        - 若 `newDist === dist[neighbor]`，則表示發現另一條等價的最短路徑，將 `ways[neighbor]` 加上 `ways[node]`（並進行取模操作）。

    2. **清除當前節點的路徑數量**  
       為避免在同一波次中重複傳播，當一個節點的所有鄰邊處理完畢後，將其 `ways[node]` 歸零。

```typescript
for (let wave = 0; wave < n; wave++) {
  let updated = false; // 本次波次是否有更新
  for (let node = 0; node < n - 1; node++) {
    if (ways[node] <= 0) {
      continue;
    }
    const { edges, weights } = graph[node];
    for (let k = 0; k < edges.length; k++) {
      const neighbor = edges[k];
      const newDist = dist[node] + weights[k];
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        ways[neighbor] = ways[node];
        updated = true;
      } else if (newDist === dist[neighbor]) {
        ways[neighbor] = (ways[neighbor] + ways[node]) % MOD;
        updated = true;
      }
    }
    ways[node] = 0;
  }
  if (!updated) {
    break;
  }
}
```

---

### Step 3：返回結果

遍歷完成後，`ways[n - 1]` 就是從起點 `0` 到終點 `n - 1` 的最短路徑總數（已對 `MOD` 取模），將其作為最終答案返回。

```typescript
return ways[n - 1] % MOD;
```

## 時間複雜度

- **波次遍歷**：最多進行 `n` 輪波次，每次遍歷所有節點以及其相鄰邊，最差情況下的時間複雜度約為 $O(n × (n + m))$。
- 實際上，由於提前終止更新的機制，通常不會遍歷滿 `n` 輪。
- 總時間複雜度為 $O(n × (n + m))$。

> $O(n × (n + m))$

## 空間複雜度

- **圖結構、距離與路徑數量陣列**：空間需求為 $O(n + m)$。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
