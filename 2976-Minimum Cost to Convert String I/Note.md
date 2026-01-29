# 2976. Minimum Cost to Convert String I

You are given two 0-indexed strings `source` and `target`, both of length `n` and consisting of lowercase English letters. 
You are also given two 0-indexed character arrays `original` and `changed`, and an integer array `cost`, 
where `cost[i]` represents the cost of changing the character `original[i]` to the character `changed[i]`.

You start with the string `source`. 
In one operation, you can pick a character `x` from the string and change it to the character `y` at a cost of `z` 
if there exists any index `j` such that `cost[j] == z`, `original[j] == x`, and `changed[j] == y`.

Return the minimum cost to convert the string `source` to the string `target` using any number of operations. 
If it is impossible to convert `source` to `target`, return `-1`.

Note that there may exist indices `i`, `j` such that `original[j] == original[i]` and `changed[j] == changed[i]`.

**Constraints:**

- `1 <= source.length == target.length <= 10^5`
- `source`, `target` consist of lowercase English letters.
- `1 <= cost.length == original.length == changed.length <= 2000`
- `original[i]`, `changed[i]` are lowercase English letters.
- `1 <= cost[i] <= 10^6`
- `original[i] != changed[i]`

## 基礎思路

本題要把 `source` 轉成 `target`，每次操作允許把某個字元 `x` 變成 `y`，並支付對應成本；而且同一對 `(x → y)` 可能給了多筆規則，我們只應採用其中最低成本。
更重要的是，轉換可以經過多步（例如 `a → b → c`），因此「直接規則」不一定是最便宜路徑。

在思考解法時，有幾個核心觀察：

* **每個位置可獨立計算成本**：字元轉換不會互相影響，因此整體最小成本等於每個位置的最小轉換成本總和。
* **字元轉換具有最短路徑結構**：26 個小寫字母可視為圖的節點，規則是帶權有向邊；多步轉換就是在圖上走路徑，因此需要先求出任意兩字元間的最小轉換成本。
* **節點數固定很小（26）**：可以直接做全點對最短路徑預處理，之後每個位置只需 O(1) 查表累加。
* **不可達即失敗**：若某個位置需要的轉換在最短路徑表中仍為不可達，則整體不可能完成，直接回傳 `-1`。

因此策略是：先建立「字母到字母」的最小轉換成本表（包含多步路徑），再逐位置累加得到最小總成本。

## 解題步驟

### Step 1：初始化常數與距離矩陣

建立固定大小（26×26）的距離表，並將所有轉換成本先設為無限大；同時設定「同字元轉換」成本為 0。

```typescript
const ALPHABET_SIZE = 26;
const INF = 1e18;

// 攤平成 26x26 的距離矩陣，降低配置與存取成本
const distance = new Float64Array(ALPHABET_SIZE * ALPHABET_SIZE);

// 初始化所有轉換成本為無限大
for (let index = 0; index < distance.length; index++) {
  distance[index] = INF;
}

// 字元轉成自己成本為 0
for (let characterIndex = 0; characterIndex < ALPHABET_SIZE; characterIndex++) {
  distance[characterIndex * ALPHABET_SIZE + characterIndex] = 0;
}
```

### Step 2：讀入規則並保留每個 `(from → to)` 的最小直接成本

同一對轉換可能出現多次，因此只保留最便宜的直接規則成本。

```typescript
// 為每組 (from → to) 記錄最小的直接轉換成本
for (let ruleIndex = 0; ruleIndex < cost.length; ruleIndex++) {
  const fromCharacterIndex = original[ruleIndex].charCodeAt(0) - 97;
  const toCharacterIndex = changed[ruleIndex].charCodeAt(0) - 97;
  const ruleCost = cost[ruleIndex];

  const flatIndex = fromCharacterIndex * ALPHABET_SIZE + toCharacterIndex;
  const existingCost = distance[flatIndex];

  // 只保留最便宜的直接轉換
  if (ruleCost < existingCost) {
    distance[flatIndex] = ruleCost;
  }
}
```

### Step 3：Floyd–Warshall 外層 — 枚舉中繼字元

以每個字元作為中繼點，嘗試更新任意 `(from → to)` 的最小成本。

```typescript
// 使用 Floyd–Warshall 在 26 個節點上預先計算所有字元對的最小成本
for (let middle = 0; middle < ALPHABET_SIZE; middle++) {
  const middleRowBase = middle * ALPHABET_SIZE;

  // ...
}
```

### Step 4：Floyd–Warshall 中層 — 枚舉起點並做不可達剪枝

若 `from → middle` 不可達，就不必再嘗試任何 `to`，可直接跳過以降低常數成本。

```typescript
for (let middle = 0; middle < ALPHABET_SIZE; middle++) {
  // Step 3：枚舉中繼字元

  const middleRowBase = middle * ALPHABET_SIZE;

  for (let from = 0; from < ALPHABET_SIZE; from++) {
    const fromRowBase = from * ALPHABET_SIZE;
    const fromToMiddle = distance[fromRowBase + middle];

    // 若中繼路徑不可達，直接跳過
    if (fromToMiddle === INF) {
      continue;
    }

    // ...
  }
}
```

### Step 5：Floyd–Warshall 內層 — 枚舉終點並鬆弛更新最小成本

若 `middle → to` 不可達也可跳過；否則用 `from → middle → to` 嘗試更新 `from → to`。

```typescript
for (let middle = 0; middle < ALPHABET_SIZE; middle++) {
  // Step 3：枚舉中繼字元

  for (let from = 0; from < ALPHABET_SIZE; from++) {
    // Step 4：枚舉起點並剪枝

    for (let to = 0; to < ALPHABET_SIZE; to++) {
      const middleToTo = distance[middleRowBase + to];

      // 若目的路徑不可達，跳過
      if (middleToTo === INF) {
        continue;
      }

      const candidateCost = fromToMiddle + middleToTo;
      const flatIndex = fromRowBase + to;

      // 若找到更便宜路徑則更新
      if (candidateCost < distance[flatIndex]) {
        distance[flatIndex] = candidateCost;
      }
    }
  }
}
```

### Step 6：逐位置累加轉換成本的主迴圈骨架

每個位置獨立查表，將 `source[i] → target[i]` 的最小成本加入總和。

```typescript
let totalCost = 0;
const stringLength = source.length;

// 逐位置累加成本（每個位置彼此獨立）
for (let position = 0; position < stringLength; position++) {
  const sourceCharacterIndex = source.charCodeAt(position) - 97;
  const targetCharacterIndex = target.charCodeAt(position) - 97;

  // ...
}
```

### Step 7：若字元相同則跳過，否則查表取得步驟成本

字元已相同時成本為 0；否則從距離矩陣查到最小成本。

```typescript
for (let position = 0; position < stringLength; position++) {
  // Step 6：逐位置累加轉換成本的主迴圈骨架

  // 若該位置字元相同則不需成本
  if (sourceCharacterIndex === targetCharacterIndex) {
    continue;
  }

  const stepCost =
    distance[sourceCharacterIndex * ALPHABET_SIZE + targetCharacterIndex];

  // ...
}
```

### Step 8：若不可達則立即回傳 -1，否則累加

只要任一位置不可達，整體即不可能完成轉換。

```typescript
for (let position = 0; position < stringLength; position++) {
  // Step 6：逐位置累加轉換成本的主迴圈骨架

  // Step 7：跳過相同字元並查表取得成本

  // 若需要的轉換不可達，直接失敗
  if (stepCost === INF) {
    return -1;
  }

  totalCost += stepCost;
}
```

### Step 9：回傳總成本

所有位置皆可達時，回傳累加後的最小總成本。

```typescript
return totalCost;
```

## 時間複雜度

- 初始化距離矩陣（26×26）填入 `INF`：$O(26^2)$。
- 設定對角線為 0：$O(26)$。
- 讀入規則並更新每個 `(from → to)` 的最小直接成本，規則數為 $m$：$O(m)$。
- Floyd–Warshall 在 26 個節點上做全點對最短路徑：$O(26^3)$。
- 逐位置累加 `source[i] → target[i]` 的最小成本，字串長度為 $n$：$O(n)$。
- 總時間複雜度為 $O(26^3 + m + n)$。

> $O(26^3 + m + n)$

## 空間複雜度

- 距離矩陣固定為 26×26（攤平成 676 長度的 TypedArray）：$O(26^2)$。
- 其餘變數皆為常數額外空間。
- 總空間複雜度為 $O(26^2)$。

> $O(26^2)$
