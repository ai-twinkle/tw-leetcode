# 2977. Minimum Cost to Convert String II

You are given two 0-indexed strings `source` and `target`, both of length `n` and consisting of lowercase English characters. 
You are also given two 0-indexed string arrays `original` and `changed`, and an integer array `cost`, 
where `cost[i]` represents the cost of converting the string `original[i]` to the string `changed[i]`.

You start with the string `source`. 
In one operation, you can pick a substring `x` from the string, and change it to `y` at a cost of `z` 
if there exists any index `j` such that `cost[j] == z`, `original[j] == x`, and `changed[j] == y`. 
You are allowed to do any number of operations, but any pair of operations must satisfy either of these two conditions:

- The substrings picked in the operations are `source[a..b]` and `source[c..d]` with either `b < c` or `d < a`. 
  In other words, the indices picked in both operations are disjoint.
- The substrings picked in the operations are `source[a..b]` and `source[c..d]` with `a == c` and `b == d`. 
  In other words, the indices picked in both operations are identical.

Return the minimum cost to convert the string `source` to the string `target` using any number of operations. 
If it is impossible to convert `source` to `target`, return `-1`.

Note that there may exist indices i, j such that `original[j] == original[i]` and `changed[j] == changed[i]`.

**Constraints:**

- `1 <= source.length == target.length <= 1000`
- `source`, `target` consist only of lowercase English characters.
- `1 <= cost.length == original.length == changed.length <= 100`
- `1 <= original[i].length == changed[i].length <= source.length`
- `original[i]`, `changed[i]` consist only of lowercase English characters.
- `original[i] != changed[i]`
- `1 <= cost[i] <= 10^6`

## 基礎思路

本題要把 `source` 轉成 `target`，允許做多次「子字串替換」操作，但操作之間必須 **完全不重疊** 或 **完全相同區間**。由於相同區間重複操作只會等價於選擇該區間的一種最終轉換方式，因此整體可視為把字串切成一段段互不重疊的區間，各區間獨立選擇「要不要轉換、以及以多少成本把該段 `source` 變成該段 `target`」。

關鍵在於兩件事：

1. **區間成本如何取得**：操作規則是「某個字串 x 可轉成 y，且可鏈式轉換」，因此同長度的字串之間形成一張有向圖；同一長度內，任意 `x -> y` 的最小成本是圖上的最短路。
2. **全域最小化如何組合**：一旦能在任意位置 `i`、任意長度 `len` 上取得「把 `source[i..i+len-1]` 轉成 `target[i..i+len-1]` 的最小成本」，就能用動態規劃在字串上由左到右選擇不重疊區間，累積出全域最小成本；若某段本來字元相同，也可以選擇「不做操作」以 0 成本前進。

因此整體策略是：

* **依子字串長度分組規則**：不同長度互不相干，分開建圖。
* **每個長度群組做全點對最短路**：得到任意 `from` 到 `to` 的最小轉換成本。
* **用 DP 做區間拼接**：`dp[i]` 表示前 `i` 個字元轉換完成的最小成本；從 `i` 出發，嘗試所有可用長度群組，看能否把 `source` 的該段轉成 `target` 的該段並轉移到 `dp[i+len]`；同時允許字元相同時以 0 成本前進。

## 解題步驟

### Step 1：初始化常數與型別

建立長度、無限大常數，以及規則與分組圖結構（每種長度一張圖）。

```typescript
const sourceLength = source.length;
const INF = 1e30;

// 轉換規則定義
type Rule = { from: string; to: string; cost: number };

// 依長度分組的轉換圖
type Group = {
  length: number;                        // 這個群組處理的子字串長度
  nodeIdByString: Map<string, number>;   // 字串 -> 節點 id 映射
  nodeCount: number;                     // 圖中的節點數
  dist: Float64Array;                    // 全點對最短路矩陣
};
```

### Step 2：依子字串長度分組所有規則

把 `original[i] -> changed[i]` 依字串長度分桶，讓後續建圖只處理同長度字串。

```typescript
// 依子字串長度分組轉換規則
const rulesByLength = new Map<number, Rule[]>();
for (let index = 0; index < original.length; index++) {
  const length = original[index].length;
  let list = rulesByLength.get(length);
  if (list === undefined) {
    list = [];
    rulesByLength.set(length, list);
  }
  list.push({ from: original[index], to: changed[index], cost: cost[index] });
}
```

### Step 3：為每個長度群組建立節點編號

針對同一長度的所有 `from/to` 字串，配置緊湊的整數 id，作為矩陣索引。

```typescript
const groups: Group[] = [];

// 對每種子字串長度建立獨立的最短路圖
for (const [length, rules] of rulesByLength.entries()) {

  // 為所有唯一字串配置緊湊的整數 id
  const nodeIdByString = new Map<string, number>();
  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex];

    if (!nodeIdByString.has(rule.from)) {
      nodeIdByString.set(rule.from, nodeIdByString.size);
    }
    if (!nodeIdByString.has(rule.to)) {
      nodeIdByString.set(rule.to, nodeIdByString.size);
    }
  }

  // ...
}
```

### Step 4：初始化距離矩陣並放入直接邊

建立 `nodeCount * nodeCount` 的距離矩陣，先填 `INF`、對角線設 0，並將重複邊保留最小成本。

```typescript
for (const [length, rules] of rulesByLength.entries()) {
  // Step 3：為每個長度群組建立節點編號

  const nodeCount = nodeIdByString.size;
  const dist = new Float64Array(nodeCount * nodeCount);

  // 以 INF 初始化距離矩陣
  for (let i = 0; i < dist.length; i++) {
    dist[i] = INF;
  }

  // 自己到自己距離為 0
  for (let node = 0; node < nodeCount; node++) {
    dist[node * nodeCount + node] = 0;
  }

  // 放入直接轉換成本（遇到重複規則取最小）
  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex];
    const fromId = nodeIdByString.get(rule.from) as number;
    const toId = nodeIdByString.get(rule.to) as number;

    const position = fromId * nodeCount + toId;
    if (rule.cost < dist[position]) {
      dist[position] = rule.cost;
    }
  }

  // ...
}
```

### Step 5：對每個群組做 Floyd–Warshall 求全點對最短路

用三層迴圈計算任意 `from -> to` 的最小成本，並保存該長度群組。

```typescript
for (const [length, rules] of rulesByLength.entries()) {
  // Step 3：為每個長度群組建立節點編號

  // Step 4：初始化距離矩陣並放入直接邊

  // 計算全點對最小轉換成本（Floyd–Warshall）
  for (let middle = 0; middle < nodeCount; middle++) {
    const middleRow = middle * nodeCount;

    for (let from = 0; from < nodeCount; from++) {
      const fromRow = from * nodeCount;
      const fromToMiddle = dist[fromRow + middle];

      if (fromToMiddle >= INF) {
        continue;
      }

      for (let to = 0; to < nodeCount; to++) {
        const middleToTo = dist[middleRow + to];

        if (middleToTo >= INF) {
          continue;
        }

        const candidate = fromToMiddle + middleToTo;
        const index = fromRow + to;

        if (candidate < dist[index]) {
          dist[index] = candidate;
        }
      }
    }
  }

  // 保存該長度群組的完成圖
  groups.push({ length, nodeIdByString, nodeCount, dist });
}
```

### Step 6：初始化 DP 陣列

`dp[i]` 表示把前 `i` 個字元轉換完成的最小成本；不可達狀態設為 `INF`，起點 `dp[0]=0`。

```typescript
// dp[i] = 把 source[0..i-1] 轉成 target[0..i-1] 的最小成本
const dp = new Float64Array(sourceLength + 1);
for (let i = 0; i < dp.length; i++) {
  dp[i] = INF;
}
dp[0] = 0;
```

### Step 7：DP 主迴圈骨架

逐一處理每個起點 `position`，若該狀態不可達則跳過。

```typescript
// 逐位置處理 source
for (let position = 0; position < sourceLength; position++) {
  const currentCost = dp[position];

  // 跳過不可達狀態
  if (currentCost >= INF) {
    continue;
  }

  // ...
}
```

### Step 8：在 DP 中處理「字元本來就相同」的 0 成本前進

當 `source[position] === target[position]`，可直接把 `dp[position+1]` 用同成本鬆弛。

```typescript
for (let position = 0; position < sourceLength; position++) {
  // Step 7：DP 主迴圈骨架

  // 當字元本來就相同，可 0 成本前進
  if (source.charCodeAt(position) === target.charCodeAt(position)) {
    const nextPosition = position + 1;
    if (currentCost < dp[nextPosition]) {
      dp[nextPosition] = currentCost;
    }
  }

  // ...
}
```

### Step 9：在 DP 中嘗試所有長度群組的轉換並鬆弛狀態

對每個群組長度 `length`，若 `end` 不越界，取出 `source` 與 `target` 同區間子字串，查表取得最小轉換成本並更新 `dp[end]`。

```typescript
for (let position = 0; position < sourceLength; position++) {
  // Step 7：DP 主迴圈骨架

  // Step 8：0 成本前進

  // 嘗試所有可用的轉換長度
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    const length = group.length;
    const end = position + length;

    // 超出邊界則跳過
    if (end > sourceLength) {
      continue;
    }

    // 取出 source 與 target 的對應子字串
    const sourceSub = source.substring(position, end);
    const targetSub = target.substring(position, end);

    // 若該群組沒有從這個 source 子字串出發的節點，跳過
    const fromId = group.nodeIdByString.get(sourceSub);
    if (fromId === undefined) {
      continue;
    }

    // 若 target 子字串不在圖中，跳過
    const toId = group.nodeIdByString.get(targetSub);
    if (toId === undefined) {
      continue;
    }

    // 讀取預先計算的最小轉換成本
    const transformCost = group.dist[fromId * group.nodeCount + toId];
    if (transformCost >= INF) {
      continue;
    }

    // 用該轉換成本鬆弛 dp[end]
    const candidate = currentCost + transformCost;
    if (candidate < dp[end]) {
      dp[end] = candidate;
    }
  }
}
```

### Step 10：回傳答案或判定不可行

若 `dp[sourceLength]` 仍為 `INF`，代表無法轉換，回傳 `-1`；否則回傳最小成本。

```typescript
// 回傳結果；若不可行則回傳 -1
if (dp[sourceLength] >= INF) {
  return -1;
}
return dp[sourceLength];
```

## 時間複雜度

* 設 $n = source.length$，$m = cost.length$，$L$ 為不同子字串長度的群組數。
* 對每個長度群組 $g$，設其節點數為 $V_g$、規則數為 $R_g$（且 $\sum_{g=1}^{L} R_g = m$）：

  * 初始化距離矩陣：$O(V_g^2)$。
  * 填入直接轉換邊：$O(R_g)$。
  * Floyd–Warshall 全點對最短路：$O(V_g^3)$。
* DP 部分：

  * 外層位置枚舉 $n$ 次，內層枚舉 $L$ 個群組。
  * 對群組 $g$，每次會建立兩個長度為 $\ell_g$ 的子字串並做兩次映射查詢，因此單次群組檢查為 $O(\ell_g)$。
  * 故 DP 總成本為 $O!\left(n \cdot \sum_{g=1}^{L} \ell_g\right)$。
* 總時間複雜度為 $O(\sum_{g=1}^{L} (V_g^3 + V_g^2 + R_g)+n \cdot \sum_{g=1}^{L} \ell_g)$。

> $O(\sum_{g=1}^{L} (V_g^3 + V_g^2 + R_g)+n \cdot \sum_{g=1}^{L} \ell_g)$

## 空間複雜度

* 每個群組 $g$ 的距離矩陣 `dist` 需要 $O(V_g^2)$ 空間。
* 每個群組的字串節點映射與結構資訊為 $O(V_g)$，總計不超過 $O(\sum_{g=1}^{L} V_g)$，相較距離矩陣為次要項。
* DP 陣列需要 $O(n)$。
* 規則分組儲存需要 $O(m)$。
* 總空間複雜度為 $O(\sum_{g=1}^{L} V_g^2 + n + m)$。

> $O(\sum_{g=1}^{L} V_g^2 + n + m)$
