# 3043. Find the Length of the Longest Common Prefix

You are given two arrays with positive integers `arr1` and `arr2`.

A prefix of a positive integer is an integer formed by one or more of its digits, starting from its leftmost digit. 
For example, `123` is a prefix of the integer `12345`, while `234` is not.

A common prefix of two integers `a` and `b` is an integer `c`, such that `c` is a prefix of both `a` and `b`. 
For example, `5655359` and `56554` have common prefixes `565` and `5655` while `1223` and `43456` do not have a common prefix.

You need to find the length of the longest common prefix between all pairs of integers `(x, y)` such that `x` belongs to `arr1` and `y` belongs to `arr2`.

Return the length of the longest common prefix among all pairs. 
If no common prefix exists among them, return `0`.

**Constraints:**

- `1 <= arr1.length, arr2.length <= 5 * 10^4`
- `1 <= arr1[i], arr2[i] <= 10^8`

## 基礎思路

本題要求在兩個正整數陣列之間，找出所有跨陣列配對 `(x, y)` 中，數字前綴相同的最長長度。若以暴力方式對每一組配對逐位比較，將會產生過高的時間成本，因此必須尋找能夠避免重複比對的策略。

在思考解法時，可掌握以下核心觀察：

- **前綴本質為「不斷去除最低位」的結果**：
  任一正整數的所有前綴，皆可透過反覆整數除以 10 取得，因此整個前綴集合的列舉只需線性次數的位數操作。

- **比對前綴等價於集合查找**：
  若將其中一個陣列的所有前綴預先儲存於可快速查找的集合中，則另一陣列的任一前綴是否為公共前綴僅需常數時間判斷。

- **位數即為前綴長度**：
  一個整數對應某個前綴值時，該前綴的「位數」就是要回報的長度，因此無須額外字串轉換，純以數值運算即可獲得長度資訊。

- **存在天花板可作為剪枝依據**：
  公共前綴的長度不可能超過第一陣列中所有整數的最大位數，因此可在比對時提前裁去多餘的尾端位數，並在達到理論最大值時直接終止。

依據以上特性，可以採用以下策略：

- **將第一陣列中所有整數的所有前綴塞入一個快速查找集合中**，並記錄該陣列中出現過的最大位數作為長度上界。
- **對第二陣列的每個整數，先計算位數並裁切至不超過上界**，再從最長前綴往最短逐步縮短查找，一旦命中即停止內層搜尋。
- **在迭代中持續維護當前最長公共前綴長度**，若該長度已達理論天花板則直接結束所有處理。

此策略能將原本的兩兩配對暴力比對，轉化為線性次數的前綴枚舉與查找，效率顯著提升。

## 解題步驟

### Step 1：取得兩個陣列的長度作為迴圈邊界

先讀取兩個陣列的長度，後續所有迴圈與索引操作都將以此為界。

```typescript
const arr1Length = arr1.length;
const arr2Length = arr2.length;
```

### Step 2：建立前綴集合與最大前綴長度的初始狀態

我們使用一個集合儲存第一陣列所有可能的前綴值，並另外維護該陣列中出現過的最大位數，作為後續比對的長度上界。

```typescript
// 將 arr1 中所有可能的數字前綴存入 Set，達到 O(1) 查找
const prefixSet = new Set<number>();
// 紀錄 arr1 中最大位數，用以限制 arr2 的前綴生成長度
let maxPrefixLengthInArr1 = 0;
```

### Step 3：枚舉第一陣列每個整數的所有前綴並登錄至集合

逐一走訪第一陣列的每個值，透過反覆整數除以 10 的方式取得該數字所有前綴，並同步累計位數，最後更新整體最大位數。

```typescript
for (let index = 0; index < arr1Length; index++) {
  let currentValue = arr1[index];
  let digitCount = 0;
  // 透過反覆去除最低位來生成所有前綴
  while (currentValue > 0) {
    prefixSet.add(currentValue);
    currentValue = (currentValue / 10) | 0;
    digitCount++;
  }
  if (digitCount > maxPrefixLengthInArr1) {
    maxPrefixLengthInArr1 = digitCount;
  }
}
```

### Step 4：初始化目前找到的最長公共前綴長度

以 `longestMatchLength` 紀錄當下已找到的最長公共前綴長度，初始為 0。

```typescript
let longestMatchLength = 0;
```

### Step 5：走訪第二陣列並計算當前整數的位數

針對第二陣列的每個值，先以數學方式計算其位數，避免昂貴的字串轉換成本。

```typescript
for (let index = 0; index < arr2Length; index++) {
  const value = arr2[index];
  // 以數學方式計算當前值的位數，避免字串轉換
  let digitCount = 0;
  let temporary = value;
  while (temporary > 0) {
    digitCount++;
    temporary = (temporary / 10) | 0;
  }

  // ...
}
```

### Step 6：將當前數字裁切至不超過第一陣列最大位數的長度

若該數的位數超出第一陣列的最大位數，則任何超過此長度的前綴都不可能在集合中出現，因此先以整數除法切掉多餘的尾端位數，將比對範圍對齊到上界。

```typescript
for (let index = 0; index < arr2Length; index++) {
  // Step 5：計算當前數字位數

  // 超過 arr1 最大長度的前綴不可能匹配，必須裁切
  let effectiveLength = digitCount;
  if (effectiveLength > maxPrefixLengthInArr1) {
    // 將多餘的尾端位數移除，使前綴長度對齊 arr1 的最大值
    const excess = effectiveLength - maxPrefixLengthInArr1;
    let divisor = 1;
    for (let step = 0; step < excess; step++) {
      divisor *= 10;
    }
    temporary = (value / divisor) | 0;
    effectiveLength = maxPrefixLengthInArr1;
  } else {
    temporary = value;
  }

  // ...
}
```

### Step 7：由長至短嘗試前綴匹配並更新最長長度

從當前可比對的最長前綴開始查找集合，只要命中即代表已找到該數字所能貢獻的最長公共前綴，可直接跳出內層迴圈；若未命中則再次去除最低位，繼續縮短前綴長度。當前綴長度已不大於目前最佳結果時，後續查找已無意義，迴圈條件即可自動結束。

```typescript
for (let index = 0; index < arr2Length; index++) {
  // Step 5：計算當前數字位數

  // Step 6：裁切至 arr1 最大長度範圍

  // 從最長前綴向最短走訪，當無法再超越目前最佳長度時停止
  while (effectiveLength > longestMatchLength) {
    if (prefixSet.has(temporary)) {
      longestMatchLength = effectiveLength;
      // 已找到此數字所能匹配的最長前綴，無須再檢查更短的
      break;
    }
    temporary = (temporary / 10) | 0;
    effectiveLength--;
  }

  // ...
}
```

### Step 8：若已達理論最大長度則提前終止整體迴圈

若當前最長公共前綴長度已等於第一陣列的最大位數，代表結果已不可能再被超越，可直接結束外層迴圈以節省計算。

```typescript
for (let index = 0; index < arr2Length; index++) {
  // Step 5：計算當前數字位數

  // Step 6：裁切至 arr1 最大長度範圍

  // Step 7：嘗試由長至短匹配前綴

  // 若已達到理論最大值，則提前終止
  if (longestMatchLength === maxPrefixLengthInArr1) {
    break;
  }
}
```

### Step 9：回傳最終的最長公共前綴長度

當所有比對完成後，`longestMatchLength` 即為跨陣列配對中最長的公共前綴長度。

```typescript
return longestMatchLength;
```

## 時間複雜度

- 設兩陣列長度分別為 $n$、$m$，元素最大位數為 $d$（本題中 $d \le 9$）；
- 建立前綴集合需走訪第一陣列每個元素並枚舉其所有前綴，耗費 $O(n \cdot d)$；
- 處理第二陣列每個元素時，計算位數與由長至短查找前綴各需 $O(d)$，共 $O(m \cdot d)$；
- 集合查找均為平均常數時間。
- 總時間複雜度為 $O((n + m) \cdot d)$。

> $O((n + m) \cdot d)$

## 空間複雜度

- 前綴集合最多存放第一陣列所有整數的所有前綴，規模為 $O(n \cdot d)$；
- 其餘僅使用固定數量的輔助變數。
- 總空間複雜度為 $O(n \cdot d)$。

> $O(n \cdot d)$
