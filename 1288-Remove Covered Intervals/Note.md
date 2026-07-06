# 1288. Remove Covered Intervals

Given an array intervals where `intervals[i] = [l_i, r_i]` represent the interval `[l_i, r_i)`, 
remove all intervals that are covered by another interval in the list.

The interval `[a, b)` is covered by the interval `[c, d)` if and only if `c <= a` and `b <= d`.

Return the number of remaining intervals.

**Constraints:**

- `1 <= intervals.length <= 1000`
- `intervals[i].length == 2`
- `0 <= l_i < r_i <= 10^5`
- All the given intervals are unique.

## 基礎思路

本題要求移除所有被其他區間覆蓋的區間，並回傳剩餘區間的數量。一個區間 `[a, b)` 被 `[c, d)` 覆蓋的條件為 `c <= a` 且 `b <= d`。

在思考解法時，可掌握以下核心觀察：

- **覆蓋關係的本質是左端點包含、右端點包含**：
  若多個區間共享相同左端點，右端點最大的那個必定覆蓋其餘；若左端點不同，只要前一個區間的右端點夠大，後來的小右端點區間就會被覆蓋。

- **排序能將覆蓋關係轉為線性掃描問題**：
  將所有區間按左端點升序排列後，只需追蹤目前見過的最大右端點；若某個區間的右端點不超過此最大值，它必定已被先前某個左端點 ≤ 它的區間所覆蓋。

- **相同左端點時右端點應降序排列**：
  若兩個區間左端點相同，右端點較大者覆蓋較小者；排序時讓右端點較大者排前面，才能在掃描時正確更新最大右端點，避免小右端點先被計入。

- **可將排序鍵打包成單一數值以省去比較回呼**：
  將左端點與「反轉後的右端點」合併成一個數值，讓原生數值排序同時達成「左端點升序、右端點降序」的排序效果。

依據以上特性，可以採用以下策略：

- **將每個區間壓縮為一個打包鍵值**，使原生數值排序即能正確排序。
- **排序後線性掃描，以最大右端點作為判斷依據**，只有右端點嚴格超過前面所有區間的最大右端點，該區間才算未被覆蓋。
- **計算並回傳未被覆蓋的區間數量**。

## 解題步驟

### Step 1：初始化常數與打包鍵值陣列

定義區間右端點的基底常數 `RIGHT_BOUND`，並為每個區間建立對應的打包鍵值陣列，用於後續排序。

```typescript
const intervalCount = intervals.length;
const RIGHT_BOUND = 100001;

// 將每個區間壓縮為一個非負數：左端點升序、右端點在數值排序下降序
const packedKeys = new Float64Array(intervalCount);
```

### Step 2：將每個區間編碼為打包鍵值

對每個區間，將左端點乘以 `RIGHT_BOUND` 後加上「`RIGHT_BOUND` 減去右端點」，使得單一數值同時攜帶兩項資訊：數值排序結果等同於「左端點升序、右端點降序」。

```typescript
for (let index = 0; index < intervalCount; index++) {
  const interval = intervals[index];
  packedKeys[index] = interval[0] * RIGHT_BOUND + (RIGHT_BOUND - interval[1]);
}
```

### Step 3：對打包鍵值進行原生數值排序

使用型別陣列的原生 `sort()`，不需要比較回呼，直接以數值大小排序，效率優於一般陣列排序。

```typescript
// 原生型別陣列數值排序，避免每次比較都呼叫 JS 回呼函式
packedKeys.sort();
```

### Step 4：初始化掃描用的計數器與最大右端點追蹤變數

`remaining` 用於累計未被覆蓋的區間數量；`maxRightSeen` 記錄目前掃描過所有區間中最大的右端點，作為判斷覆蓋的基準。

```typescript
let remaining = 0;
let maxRightSeen = 0;
```

### Step 5：線性掃描，以右端點判斷區間是否被覆蓋

排序後，每個打包鍵值對應的實際右端點可由 `RIGHT_BOUND - (key % RIGHT_BOUND)` 還原；若此右端點嚴格大於 `maxRightSeen`，代表此區間無法被任何先前的區間覆蓋，計入結果並更新最大右端點。

```typescript
// 排序後的區間只有右端點嚴格超過前面所有右端點時，才能存活
for (let index = 0; index < intervalCount; index++) {
  const currentRight = RIGHT_BOUND - (packedKeys[index] % RIGHT_BOUND);

  if (currentRight > maxRightSeen) {
    remaining++;
    maxRightSeen = currentRight;
  }
}
```

### Step 6：回傳未被覆蓋的區間數量

掃描結束後，`remaining` 即為答案。

```typescript
return remaining;
```

## 時間複雜度

- 編碼所有區間需 $O(n)$；
- 排序需 $O(n \log n)$；
- 線性掃描需 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用長度為 $n$ 的 `packedKeys` 陣列儲存打包鍵值；
- 其餘皆為常數空間的變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
